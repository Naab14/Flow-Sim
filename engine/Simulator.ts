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

    // Setup Edges (Adjacency List)
    edges.forEach(edge => {
      if (!this.edges.has(edge.source)) {
        this.edges.set(edge.source, []);
      }
      this.edges.get(edge.source)?.push(edge.target);
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

    // Check Capacity
    const capacity = state.config.capacity || 1;
    if (state.processing.length < capacity && state.queue.length > 0) {
      // If we were blocked, we need to check if we can unblock, but here we are starting new work
      // Check if we are currently blocked by downstream? No, processing happens first.
      
      const entity = state.queue.shift();
      if (entity) {
        state.processing.push(entity);
        entity.state = 'processing';
        
        // Calculate Processing Time
        let procTime = state.config.cycleTime;
        if (state.config.type === NodeType.INVENTORY) procTime = 0.1; // Fast pass through buffer if empty

        this.scheduleEvent(procTime, 'PROCESS_END', nodeId, entity.id);
        state.status = 'active';
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
    
    // Shipping / Sink
    if (targets.length === 0 || state.config.type === NodeType.SHIPPING) {
      // Done
      state.processing.splice(entityIndex, 1);
      state.stats.totalProcessed++;
      entity.state = 'completed';
      entity.completedAt = this.currentTime;
      this.processedWindow.push(this.currentTime);
      this.tryStartProcess(nodeId); // Start next
      return;
    }

    // Route to next (Simple load balancing or first available)
    // For blocking logic: Check if ANY target has capacity. 
    // Simplified: Check the first target (linear flow)
    const targetId = targets[0]; 
    const targetState = this.nodes.get(targetId);

    if (targetState) {
        const targetCap = targetState.config.capacity || 1;
        const targetLoad = targetState.queue.length + targetState.processing.length;
        const isInventory = targetState.config.type === NodeType.INVENTORY;
        
        // Blocking Condition: Target is Inventory and Full OR Target is Machine and Queue Full (Simplified: Machine queue limit 5)
        const queueLimit = isInventory ? targetCap : 5; 

        if (isInventory && targetLoad >= targetCap) {
            // BLOCK
            state.status = 'blocked';
            state.blockedEntity = entity; // Hold the entity
            // Do NOT remove from processing yet. Wait for UNBLOCK signal.
            // Add listener logic implicitly by 'UNBLOCK_CHECK' polling or event trigger
        } else {
            // Move
            state.processing.splice(entityIndex, 1);
            state.stats.totalProcessed++;
            this.startMove(entity, nodeId, targetId);
            this.tryStartProcess(nodeId);
        }
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
     
     // Check if we unblocked anyone upstream? 
     // The node 'fromId' just freed space. But 'fromId' is the one Pushing.
     // We need to check if 'toId' moving OUT unblocks 'fromId'.
  }

  private handleUnblockCheck(event: SimEvent) {
     // Polling mechanism to release blocked nodes (simplified for robustness)
     this.nodes.forEach((state, nodeId) => {
         if (state.status === 'blocked' && state.blockedEntity) {
             const targets = this.edges.get(nodeId);
             if (targets && targets.length > 0) {
                 const targetId = targets[0];
                 const targetState = this.nodes.get(targetId);
                 if (targetState) {
                     const isInventory = targetState.config.type === NodeType.INVENTORY;
                     const targetCap = targetState.config.capacity || 1;
                     const targetLoad = targetState.queue.length + targetState.processing.length;
                     
                     if (!isInventory || targetLoad < targetCap) {
                         // UNBLOCK
                         const entity = state.blockedEntity;
                         state.blockedEntity = null;
                         const idx = state.processing.findIndex(e => e.id === entity.id);
                         if (idx !== -1) {
                             state.processing.splice(idx, 1);
                             state.stats.totalProcessed++;
                             this.startMove(entity, nodeId, targetId);
                             this.tryStartProcess(nodeId);
                         }
                     }
                 }
             }
         }
     });
  }
  
  // Call this frequently to handle unblocking
  private handleMoveEnd(event: SimEvent) {
      // Check if this move end created space in a buffer?
      // Actually ARRIVAL creates demand, PROCESS_END frees resource.
      // We'll use a periodic checker or trigger on PROCESS_END of downstream.
      this.scheduleEvent(0, 'UNBLOCK_CHECK');
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