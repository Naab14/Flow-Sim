import { PriorityQueue, SimEvent } from './PriorityQueue';
import { AppNode, AppEdge, Entity, NodeType, StationStats, GlobalStats } from '../types';

interface NodeState {
  queue: Entity[];
  processing: Entity[];
  blockedEntity: Entity | null;
  lastUpdate: number;
  stats: StationStats;
  status: 'active' | 'idle' | 'blocked' | 'starved';
  config: AppNode['data'];
}

export class Simulator {
  private eventQueue: PriorityQueue;
  private currentTime: number;
  private nodes: Map<string, NodeState>;
  private edges: Map<string, string[]>; // Source -> Targets
  private reverseEdges: Map<string, string[]>; // Target -> Sources (for unblocking)
  private entities: Map<string, Entity>;
  private movingEntities: Entity[];
  private eventIdCounter: number;

  // Historical Data for Charts
  public history: { time: number; throughput: number; wip: number }[] = [];
  private processedWindow: number[] = []; // Timestamps of completion

  constructor() {
    this.eventQueue = new PriorityQueue();
    this.currentTime = 0;
    this.nodes = new Map();
    this.edges = new Map();
    this.reverseEdges = new Map(); // Track which nodes feed INTO each node
    this.entities = new Map();
    this.movingEntities = [];
    this.eventIdCounter = 0;
  }

  // Getter for current simulation time (avoids bracket notation hack in App.tsx)
  public getCurrentTime(): number {
    return this.currentTime;
  }

  public initialize(nodes: AppNode[], edges: AppEdge[]) {
    this.currentTime = 0;
    this.eventQueue.clear();
    this.nodes.clear();
    this.edges.clear();
    this.reverseEdges.clear();
    this.entities.clear();
    this.movingEntities = [];
    this.history = [];
    this.processedWindow = [];

    // Setup Nodes
    nodes.forEach(node => {
      this.nodes.set(node.id, {
        queue: [],
        processing: [],
        blockedEntity: null,
        lastUpdate: 0,
        status: 'idle',
        config: node.data,
        stats: {
          totalProcessed: 0,
          totalGenerated: 0,
          totalDefects: 0,
          totalScrapped: 0,
          busyTime: 0,
          blockedTime: 0,
          starvedTime: 0,
          utilization: 0,
          queueLength: 0,
          avgCycleTime: 0
        }
      });

      // Schedule first arrival for Sources
      if (node.data.type === NodeType.SOURCE) {
        this.scheduleEvent(0, 'ARRIVAL', node.id);
      }
    });

    // Setup Edges (Adjacency List: source -> targets)
    edges.forEach(edge => {
      if (!this.edges.has(edge.source)) {
        this.edges.set(edge.source, []);
      }
      this.edges.get(edge.source)?.push(edge.target);
    });

    // Build reverse edges map (target -> sources) for unblocking
    // Manufacturing analogy: Know which upstream machines feed into each station
    // so when space opens, we can notify them
    edges.forEach(edge => {
      if (!this.reverseEdges.has(edge.target)) {
        this.reverseEdges.set(edge.target, []);
      }
      this.reverseEdges.get(edge.target)?.push(edge.source);
    });
  }

  public update(deltaTime: number): { 
    nodes: Map<string, NodeState>; 
    entities: Entity[]; 
    stats: GlobalStats 
  } {
    const targetTime = this.currentTime + deltaTime;

    // Process events up to targetTime
    while (!this.eventQueue.isEmpty() && this.eventQueue.peek()!.time <= targetTime) {
      const event = this.eventQueue.dequeue();
      if (event) {
        this.currentTime = event.time;
        this.processEvent(event);
      }
    }

    this.currentTime = targetTime;
    this.updateStats();

    // Update moving entities progress for visualization
    const transportTime = 2; // Fixed transport time for viz
    this.movingEntities = this.movingEntities.filter(e => {
       const progress = (this.currentTime - e.completedAt!) / transportTime;
       e.progress = Math.min(progress, 1);
       return progress < 1; 
    });

    return {
      nodes: this.nodes,
      entities: [...this.movingEntities],
      stats: this.getGlobalStats()
    };
  }

  private scheduleEvent(delay: number, type: SimEvent['type'], nodeId?: string, entityId?: string, targetNodeId?: string) {
    this.eventQueue.enqueue({
      id: this.eventIdCounter++,
      time: this.currentTime + delay,
      type,
      nodeId,
      entityId,
      targetNodeId,
      priority: 0
    });
  }

  private processEvent(event: SimEvent) {
    switch (event.type) {
      case 'ARRIVAL':
        this.handleArrival(event);
        break;
      case 'PROCESS_END':
        this.handleProcessEnd(event);
        break;
      case 'MOVE_END':
        this.handleMoveEnd(event);
        break;
      case 'UNBLOCK_CHECK':
        this.handleUnblockCheck(event);
        break;
    }
  }

  private handleArrival(event: SimEvent) {
    if (!event.nodeId) return;
    const nodeState = this.nodes.get(event.nodeId);
    if (!nodeState) return;

    // Create Entity if Source
    let entity: Entity;
    if (nodeState.config.type === NodeType.SOURCE) {
      entity = {
        id: `ent_${this.eventIdCounter++}`,
        createdAt: this.currentTime,
        path: [event.nodeId],
        currentLocation: event.nodeId,
        state: 'queued',
        type: 'good',
        progress: 0
      };
      this.entities.set(entity.id, entity);
      nodeState.stats.totalGenerated = (nodeState.stats.totalGenerated || 0) + 1;
      
      // Schedule next arrival
      const cycleTime = nodeState.config.cycleTime || 10;
      this.scheduleEvent(cycleTime, 'ARRIVAL', event.nodeId);
    } else {
       // Entity arriving from upstream
       if(!event.entityId) return;
       entity = this.entities.get(event.entityId)!;
       entity.currentLocation = event.nodeId;
       entity.path.push(event.nodeId);
       entity.state = 'queued';
    }

    // Add to queue
    nodeState.queue.push(entity);
    this.tryStartProcess(event.nodeId);
  }

  private tryStartProcess(nodeId: string) {
    const state = this.nodes.get(nodeId);
    if (!state) return;

    // If we're blocked, can't start new work (holding output)
    if (state.status === 'blocked') return;

    // Check Capacity
    const capacity = state.config.capacity || 1;
    if (state.processing.length < capacity && state.queue.length > 0) {
      const entity = state.queue.shift();
      if (entity) {
        state.processing.push(entity);
        entity.state = 'processing';

        // Calculate Processing Time
        let procTime = state.config.cycleTime;
        if (state.config.type === NodeType.INVENTORY) {
          procTime = 0.1; // Fast pass through buffer (just a holding area)
        }

        this.scheduleEvent(procTime, 'PROCESS_END', nodeId, entity.id);
        state.status = 'active';

        // Entity moved from queue to processing - queue has more space now
        // Notify upstream that they may be able to send more entities
        // Manufacturing analogy: Input staging area has a free slot
        this.notifySpaceAvailable(nodeId);
      }
    } else if (state.processing.length === 0 && state.queue.length === 0) {
      state.status = 'starved';
    }
  }

  private handleProcessEnd(event: SimEvent) {
    const nodeId = event.nodeId!;
    const state = this.nodes.get(nodeId);
    if (!state || !event.entityId) return;

    const entityIndex = state.processing.findIndex(e => e.id === event.entityId);
    if (entityIndex === -1) return;

    const entity = state.processing[entityIndex];

    // Determine Next Step
    const targets = this.edges.get(nodeId) || [];

    // Shipping / Sink: Entity completes its journey
    if (targets.length === 0 || state.config.type === NodeType.SHIPPING) {
      state.processing.splice(entityIndex, 1);
      state.stats.totalProcessed++;
      entity.state = 'completed';
      entity.completedAt = this.currentTime;
      this.processedWindow.push(this.currentTime);
      this.tryStartProcess(nodeId);
      return;
    }

    // QUALITY/INSPECTION node: Check for defects
    // Manufacturing analogy: QC inspector checks part against specs
    if (state.config.type === NodeType.QUALITY) {
      const defectRate = state.config.defectRate || 0;
      const isDefect = Math.random() * 100 < defectRate;

      if (isDefect) {
        // Mark entity as defective
        entity.type = 'defect';
        state.stats.totalDefects = (state.stats.totalDefects || 0) + 1;

        // Route to second target (rework lane) if available
        if (targets.length > 1) {
          // Has rework path - route defect there
          const reworkTargetId = targets[1];
          if (this.canAcceptEntity(reworkTargetId)) {
            state.processing.splice(entityIndex, 1);
            state.stats.totalProcessed++;
            this.startMove(entity, nodeId, reworkTargetId);
            this.tryStartProcess(nodeId);
            return;
          }
          // Rework path full - will block (handled below)
        } else {
          // No rework path - SCRAP the entity
          // Manufacturing analogy: Part fails QC, no rework lane, goes to scrap bin
          state.processing.splice(entityIndex, 1);
          state.stats.totalProcessed++;
          state.stats.totalScrapped = (state.stats.totalScrapped || 0) + 1;
          entity.state = 'completed'; // Removed from system
          entity.completedAt = this.currentTime;
          // Note: NOT added to processedWindow (scrap doesn't count as throughput)
          this.tryStartProcess(nodeId);
          return;
        }
      }
      // If good, continue with normal routing (targets[0])
    }

    // Find best target to route to
    // Manufacturing analogy: Check all downstream stations, pick one with space
    const targetId = this.findAvailableTarget(targets);

    if (targetId) {
      // Target has space - move entity forward
      state.processing.splice(entityIndex, 1);
      state.stats.totalProcessed++;
      this.startMove(entity, nodeId, targetId);
      this.tryStartProcess(nodeId);
    } else {
      // ALL targets are full - BLOCK this station
      // Manufacturing analogy: Machine finished part but output conveyor is full
      // Machine must hold the part and wait (can't start next job)
      state.processing.splice(entityIndex, 1); // Remove from processing
      state.blockedEntity = entity; // Hold in blocked state
      state.status = 'blocked';
      entity.state = 'queued'; // Entity is waiting to move

      // No event scheduled - we'll be notified when space opens via notifySpaceAvailable()
    }
  }

  /**
   * Find a target node that has capacity to accept an entity
   * Manufacturing analogy: Check each downstream station - is their input queue/buffer full?
   * Returns first available target, or null if all are full
   */
  private findAvailableTarget(targets: string[]): string | null {
    for (const targetId of targets) {
      if (this.canAcceptEntity(targetId)) {
        return targetId;
      }
    }
    return null;
  }

  /**
   * Check if a node can accept another entity
   * For INVENTORY (buffer): Check against capacity (storage limit)
   * For PROCESS (machine): Allow reasonable queue (capacity + 5 waiting)
   */
  private canAcceptEntity(nodeId: string): boolean {
    const state = this.nodes.get(nodeId);
    if (!state) return false;

    const isInventory = state.config.type === NodeType.INVENTORY;
    const capacity = state.config.capacity || 1;

    if (isInventory) {
      // Buffer: Total items (queue + processing) must be under capacity
      // Manufacturing analogy: Pallet positions in a buffer area
      const currentLoad = state.queue.length + state.processing.length;
      return currentLoad < capacity;
    } else {
      // Machine: Allow queue up to capacity + 5 (input staging area)
      // Manufacturing analogy: Machine has capacity slots + 5 pallet positions waiting
      const maxQueue = capacity + 5;
      return state.queue.length < maxQueue;
    }
  }

  private startMove(entity: Entity, fromId: string, toId: string) {
    entity.state = 'moving';
    entity.completedAt = this.currentTime; // repurposed for start of move time
    entity.currentLocation = `${fromId}->${toId}`; // Edge ID
    this.movingEntities.push(entity);

    // Schedule arrival at next node
    const transportTime = 2; // Hardcoded visual travel time
    this.scheduleEvent(transportTime, 'ARRIVAL', toId, entity.id);

    // Entity left fromId - check if any upstream node was blocked waiting for fromId
    // Manufacturing analogy: Part left Machine A, check if Machine feeding A was blocked
    this.notifySpaceAvailable(fromId);
  }

  /**
   * Called when a node has new capacity (entity moved out)
   * Check if any upstream nodes were blocked waiting to send to this node
   * Manufacturing analogy: Buffer slot opened - signal upstream machine "you can send now"
   */
  private notifySpaceAvailable(nodeId: string) {
    // Find all nodes that feed INTO this node
    const upstreamNodes = this.reverseEdges.get(nodeId) || [];

    for (const upstreamId of upstreamNodes) {
      const upstreamState = this.nodes.get(upstreamId);
      if (!upstreamState) continue;

      // Is this upstream node blocked with an entity waiting to go somewhere?
      if (upstreamState.status === 'blocked' && upstreamState.blockedEntity) {
        // Check if the blocked entity can now move to THIS node
        if (this.canAcceptEntity(nodeId)) {
          // UNBLOCK! Move the held entity forward
          const entity = upstreamState.blockedEntity;
          upstreamState.blockedEntity = null;
          upstreamState.stats.totalProcessed++;

          this.startMove(entity, upstreamId, nodeId);

          // Upstream can now process next item in its queue
          this.tryStartProcess(upstreamId);

          // Only unblock one entity per notification (first come first served)
          // The next startMove will trigger another notifySpaceAvailable if more space opens
          break;
        }
      }
    }
  }

  // Legacy handlers - kept for event type compatibility but no longer used
  private handleUnblockCheck(_event: SimEvent) {
    // No longer needed - using event-driven notifySpaceAvailable() instead
    // Kept for backwards compatibility with any queued events
  }

  private handleMoveEnd(_event: SimEvent) {
    // No longer needed - unblocking handled by notifySpaceAvailable() in startMove()
  }

  private updateStats() {
      // Remove old processed records (> 60s ago) for rolling throughput
      const now = this.currentTime;
      this.processedWindow = this.processedWindow.filter(t => now - t <= 60);

      // Update node utilization timers
      this.nodes.forEach(state => {
          if (state.status === 'active') state.stats.busyTime += 0.1; // approx tick
          if (state.status === 'blocked') state.stats.blockedTime += 0.1;
          if (state.status === 'starved') state.stats.starvedTime += 0.1;
          
          const totalTime = this.currentTime || 1;
          state.stats.utilization = (state.stats.busyTime / totalTime) * 100;
          state.stats.queueLength = state.queue.length;
      });
  }

  public getGlobalStats(): GlobalStats {
      // WIP = entities currently in the system (not yet completed/shipped)
      // Manufacturing analogy: Count every part physically on the floor
      const wip = [...this.entities.values()].filter(e => e.state !== 'completed').length;

      // Throughput = completed units per minute (rolling 60-second window)
      const throughput = this.processedWindow.length;

      // Completed count = total units shipped since start
      const completedCount = [...this.entities.values()].filter(e => e.state === 'completed').length;

      return {
          throughput,
          wip,
          averageLeadTime: 0,
          completedCount,
          oee: 0 // Placeholder - will calculate properly in Day 2
      };
  }
}