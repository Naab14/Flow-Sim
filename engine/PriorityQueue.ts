export interface SimEvent {
  id: number;
  time: number;
  type: 'ARRIVAL' | 'PROCESS_START' | 'PROCESS_END' | 'MOVE_END' | 'UNBLOCK_CHECK';
  nodeId?: string;
  targetNodeId?: string;
  entityId?: string;
  priority: number; // Lower number = higher priority
}

export class PriorityQueue {
  private items: SimEvent[];

  constructor() {
    this.items = [];
  }

  enqueue(element: SimEvent) {
    this.items.push(element);
    this.heapifyUp(this.items.length - 1);
  }

  dequeue(): SimEvent | undefined {
    if (this.isEmpty()) return undefined;
    const root = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0 && last) {
      this.items[0] = last;
      this.heapifyDown(0);
    }
    return root;
  }

  peek(): SimEvent | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }

  private heapifyUp(index: number) {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = Math.floor((currentIndex - 1) / 2);
      if (this.items[currentIndex].time >= this.items[parentIndex].time) break;
      this.swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
    }
  }

  private heapifyDown(index: number) {
    let currentIndex = index;
    const length = this.items.length;

    while (true) {
      let smallestIndex = currentIndex;
      const leftChild = 2 * currentIndex + 1;
      const rightChild = 2 * currentIndex + 2;

      if (leftChild < length && this.items[leftChild].time < this.items[smallestIndex].time) {
        smallestIndex = leftChild;
      }
      if (rightChild < length && this.items[rightChild].time < this.items[smallestIndex].time) {
        smallestIndex = rightChild;
      }

      if (smallestIndex === currentIndex) break;
      this.swap(currentIndex, smallestIndex);
      currentIndex = smallestIndex;
    }
  }

  private swap(i: number, j: number) {
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
  }
}
