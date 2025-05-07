export default class DepGraph<T> {
  _graph = new Map<T, { incoming: Set<T>; outgoing: Set<T> }>()

  constructor() {
    this._graph = new Map()
  }

  export(): Object {
    return {
      nodes: this.nodes,
      edges: this.edges,
    }
  }

  toString(): string {
    return JSON.stringify(this.export(), null, 2)
  }

  get nodes(): T[] {
    return Array.from(this._graph.keys())
  }

  get edges(): [T, T][] {
    let edges: [T, T][] = []
    this.forEachEdge((edge) => edges.push(edge))
    return edges
  }

  hasNode(node: T): boolean {
    return this._graph.has(node)
  }

  addNode(node: T): void {
    if (!this._graph.has(node)) {
      this._graph.set(node, { incoming: new Set(), outgoing: new Set() })
    }
  }

  removeNode(node: T): void {
    if (this._graph.has(node)) {
      for (const target of this._graph.get(node)!.outgoing) {
        this.removeEdge(node, target)
      }
      for (const source of this._graph.get(node)!.incoming) {
        this.removeEdge(source, node)
      }
      this._graph.delete(node)
    }
  }

  forEachNode(callback: (node: T) => void): void {
    for (const node of this._graph.keys()) {
      callback(node)
    }
  }

  hasEdge(from: T, to: T): boolean {
    return Boolean(this._graph.get(from)?.outgoing.has(to))
  }

  addEdge(from: T, to: T): void {
    this.addNode(from)
    this.addNode(to)

    this._graph.get(from)!.outgoing.add(to)
    this._graph.get(to)!.incoming.add(from)
  }

  removeEdge(from: T, to: T): void {
    if (this._graph.has(from) && this._graph.has(to)) {
      this._graph.get(from)!.outgoing.delete(to)
      this._graph.get(to)!.incoming.delete(from)
    }
  }

  outDegree(node: T): number {
    return this.hasNode(node) ? this._graph.get(node)!.outgoing.size : -1
  }
  inDegree(node: T): number {
    return this.hasNode(node) ? this._graph.get(node)!.incoming.size : -1
  }

  forEachOutNeighbor(node: T, callback: (neighbor: T) => void): void {
    this._graph.get(node)?.outgoing.forEach(callback)
  }

  forEachInNeighbor(node: T, callback: (neighbor: T) => void): void {
    this._graph.get(node)?.incoming.forEach(callback)
  }

  forEachEdge(callback: (edge: [T, T]) => void): void {
    for (const [source, { outgoing }] of this._graph.entries()) {
      for (const target of outgoing) {
        callback([source, target])
      }
    }
  }

  // DEPENDENCY ALGORITHMS

  mergeGraph(other: DepGraph<T>): void {
    other.forEachEdge(([source, target]) => {
      this.addNode(source)
      this.addNode(target)
      this.addEdge(source, target)
    })
  }

  updateIncomingEdgesForNode(other: DepGraph<T>, node: T): void {
    this.addNode(node)

    other.forEachInNeighbor(node, (neighbor) => {
      this.addEdge(neighbor, node)
    })

    this.forEachEdge(([source, target]) => {
      if (target === node && !other.hasEdge(source, target)) {
        this.removeEdge(source, target)
      }
    })
  }

  removeOrphanNodes(): Set<T> {
    let orphanNodes = new Set<T>()

    this.forEachNode((node) => {
      if (this.inDegree(node) === 0 && this.outDegree(node) === 0) {
        orphanNodes.add(node)
      }
    })

    orphanNodes.forEach((node) => {
      this.removeNode(node)
    })

    return orphanNodes
  }

  getLeafNodes(node: T): Set<T> {
    let stack: T[] = [node]
    let visited = new Set<T>()
    let leafNodes = new Set<T>()

    // DFS: Depth First Search
    while (stack.length > 0) {
      let node = stack.pop()!

      if (visited.has(node)) {
        continue
      }
      visited.add(node)

      if (this.outDegree(node) === 0) {
        leafNodes.add(node)
      }

      this.forEachOutNeighbor(node, (neighbor) => {
        if (!visited.has(neighbor)) {
          stack.push(neighbor)
        }
      })
    }

    return leafNodes
  }

  getLeafNodeAncestors(node: T): Set<T> {
    const leafNodes = this.getLeafNodes(node)
    let visited = new Set<T>()
    let upstreamNodes = new Set<T>()

    leafNodes.forEach((leafNode) => {
      let stack: T[] = [leafNode]

      while (stack.length > 0) {
        let node = stack.pop()!

        if (visited.has(node)) {
          continue
        }
        visited.add(node)
        if (this.outDegree(node) !== 0) {
          upstreamNodes.add(node)
        }

        this.forEachInNeighbor(node, (parentNode) => {
          if (!visited.has(parentNode)) {
            stack.push(parentNode)
          }
        })
      }
    })

    return upstreamNodes
  }
}
