export interface PlanFeature {
  slug: string;
  title: string;
  dependencies: string[];
  profile: string;
  variant: string;
  priority: 'P0' | 'P1' | 'P2';
}

export interface PlanResult {
  features: PlanFeature[];
  order: string[][];
}

export function planFromDoc(markdown: string): PlanResult {
  const features: PlanFeature[] = [];
  const featureRegex = /^###\s+\[ \]\s+(.+?)(?:\s*\((.+?)\))?$/gm;
  let match: RegExpExecArray | null;

  while ((match = featureRegex.exec(markdown)) !== null) {
    const title = (match[1] ?? '').trim();
    const depsMatch = (match[2] ?? '').match(/depends on:?\s*(.+)/i);
    const dependencies = depsMatch
      ? depsMatch[1]!.split(',').map(d => d.trim()).filter(Boolean)
      : [];

    const slug = title.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().slice(0, 64);

    features.push({ slug, title, dependencies, profile: 'develop', variant: 'full', priority: 'P2' });
  }

  const order = topologicalSort(features);
  return { features, order };
}

function topologicalSort(features: PlanFeature[]): string[][] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const f of features) {
    inDegree.set(f.slug, f.dependencies.length);
    for (const dep of f.dependencies) {
      const list = adj.get(dep) ?? [];
      list.push(f.slug);
      adj.set(dep, list);
    }
  }

  const order: string[][] = [];
  let queue = features.filter(f => inDegree.get(f.slug) === 0).map(f => f.slug);

  while (queue.length > 0) {
    order.push([...queue]);
    const next: string[] = [];
    for (const slug of queue) {
      for (const neighbor of adj.get(slug) ?? []) {
        const d = (inDegree.get(neighbor) ?? 1) - 1;
        inDegree.set(neighbor, d);
        if (d === 0) next.push(neighbor);
      }
    }
    queue = next;
  }

  return order;
}
