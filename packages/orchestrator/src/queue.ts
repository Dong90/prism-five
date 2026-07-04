import type { PipelineState } from './schema';
import { readPipeline, writePipeline, createInitialState } from './state';

export type Priority = 'P0' | 'P1' | 'P2';

export interface QueueItem {
  slug: string;
  priority: Priority;
  addedAt: string;
}

const PRIORITY_ORDER: Record<Priority, number> = { P0: 0, P1: 1, P2: 2 };

export class QueueManager {
  private state: PipelineState;
  private statePath: string;

  constructor(statePath?: string) {
    this.statePath = statePath ?? '.pentad/pipeline.json';
    try {
      this.state = readPipeline(this.statePath);
    } catch {
      this.state = createInitialState();
      writePipeline(this.state, this.statePath);
    }
  }

  list(): QueueItem[] {
    const items: QueueItem[] = [];
    const queue = this.state.queue || [];
    for (const entry of queue) {
      if (typeof entry === 'string') {
        items.push({ slug: entry, priority: 'P2', addedAt: '' });
      } else {
        items.push(entry as QueueItem);
      }
    }
    return items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }

  enqueue(slug: string, priority: Priority = 'P2'): QueueItem {
    const item: QueueItem = {
      slug,
      priority,
      addedAt: new Date().toISOString(),
    };
    const queue = this.state.queue || [];
    // Remove duplicate
    const filtered = queue.filter((e: string | QueueItem) =>
      typeof e === 'string' ? e !== slug : (e as QueueItem).slug !== slug,
    );
    filtered.push(item);
    this.state.queue = filtered;
    writePipeline(this.state, this.statePath);
    return item;
  }

  dequeue(): QueueItem | null {
    const items = this.list();
    if (items.length === 0) return null;
    const next = items[0]!;
    const queue = this.state.queue || [];
    this.state.queue = queue.filter((e: string | QueueItem) => {
      const s = typeof e === 'string' ? e : (e as QueueItem).slug;
      return s !== next.slug;
    });
    writePipeline(this.state, this.statePath);
    return next;
  }

  remove(slug: string): boolean {
    const queue = this.state.queue || [];
    const before = queue.length;
    this.state.queue = queue.filter((e: string | QueueItem) => {
      const s = typeof e === 'string' ? e : (e as QueueItem).slug;
      return s !== slug;
    });
    if (this.state.queue.length !== before) {
      writePipeline(this.state, this.statePath);
      return true;
    }
    return false;
  }

  size(): number {
    return (this.state.queue || []).length;
  }
}
