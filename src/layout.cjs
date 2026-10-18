"use strict";
// Adapted from Quiet Atlas graph-layout.js; only display dimensions differ.

// Display-only layered layout. Virtual slots reserve space for edges that skip
// a layer; they never become questions or get written to the vault.
const HALF_WIDTH = 118;
const NODE_HEIGHT = 136;
const GAP = 38;

function graphLayout(nodes) {
  const ordered = [...nodes].sort((a, b) => a.title.localeCompare(b.title, "en") || a.id.localeCompare(b.id));
  const byId = new Map(ordered.map(node => [node.id, node]));
  const depths = new Map(), visiting = new Set();
  function depth(id) {
    if (depths.has(id)) return depths.get(id);
    if (visiting.has(id)) return 0; // Tolerate cycles introduced by manual Markdown edits.
    visiting.add(id);
    const parents = [...new Set(byId.get(id).prerequisites)].filter(id => byId.has(id)).sort();
    const level = parents.length ? 1 + Math.max(...parents.map(depth)) : 0;
    visiting.delete(id); depths.set(id, level); return level;
  }
  ordered.forEach(node => depth(node.id));
  const layers = Array.from({length: Math.max(0, ...depths.values()) + 1}, () => []);
  const items = new Map();
  for (const node of ordered) {
    const item = {id: node.id, level: depths.get(node.id), height: node.layoutHeight || NODE_HEIGHT, before: [], after: []};
    items.set(item.id, item); layers[item.level].push(item);
  }
  const edges = [], segments = [];
  for (const node of ordered) {
    for (const source of [...new Set(node.prerequisites)].filter(id => byId.has(id)).sort()) {
      const edge = {source, target: node.id, route: []};
      let previous = items.get(source);
      for (let level = previous.level + 1; level < depths.get(node.id); level++) {
        const item = {id: Symbol("edge slot"), level, height: 24, before: [], after: []};
        items.set(item.id, item); layers[level].push(item); edge.route.push(item.id);
      }
      if (depths.get(source) < depths.get(node.id)) {
        for (const id of [...edge.route, node.id]) {
          const next = items.get(id);
          previous.after.push(next.id); next.before.push(previous.id);
          segments.push([previous.id, next.id]); previous = next;
        }
      }
      edges.push(edge);
    }
  }

  function indices(columns) {
    return new Map(columns.flatMap(column => column.map((item, index) => [item.id, index])));
  }
  function score(columns) {
    const index = indices(columns);
    let crossings = 0, distance = 0;
    for (let a = 0; a < segments.length; a++) {
      const [s, t] = segments[a]; distance += Math.abs(index.get(s) - index.get(t));
      for (let b = a + 1; b < segments.length; b++) {
        const [u, v] = segments[b];
        if (items.get(s).level === items.get(u).level &&
            (index.get(s) - index.get(u)) * (index.get(t) - index.get(v)) < 0) crossings++;
      }
    }
    return [crossings, distance];
  }
  let best = layers.map(column => [...column]), bestScore = score(best);
  // Alternating barycenter sweeps bring connected questions together. Keep the
  // best pass, since a later sweep can reintroduce crossings on another layer.
  for (let pass = 0; pass < 8; pass++) {
    const forward = pass % 2 === 0;
    const order = layers.map((_, level) => level);
    if (!forward) order.reverse();
    for (const level of order) {
      const index = indices(layers);
      const barycenter = item => {
        const neighbors = forward ? item.before : item.after;
        return neighbors.length ? neighbors.reduce((sum, id) => sum + index.get(id), 0) / neighbors.length : index.get(item.id);
      };
      layers[level].sort((a, b) => barycenter(a) - barycenter(b) || index.get(a.id) - index.get(b.id));
    }
    const candidate = score(layers);
    if (candidate[0] < bestScore[0] || (candidate[0] === bestScore[0] && candidate[1] < bestScore[1])) {
      best = layers.map(column => [...column]); bestScore = candidate;
    }
  }

  const columnHeight = column => column.reduce((sum, item) => sum + item.height, 0) + Math.max(0, column.length - 1) * GAP;
  const contentHeight = Math.max(392, ...best.map(columnHeight));
  const allPositions = new Map(), positions = new Map();
  best.forEach((column, level) => {
    let y = 34 + (contentHeight - columnHeight(column)) / 2;
    for (const item of column) {
      const position = {x: 142 + level * 330, y: y + item.height / 2};
      allPositions.set(item.id, position);
      if (byId.has(item.id)) positions.set(item.id, position);
      y += item.height + GAP;
    }
  });
  let returns = 0;
  // Separate ports at each end so several relationships do not share one line.
  const port = (edge, outgoing) => {
    const id = outgoing ? edge.source : edge.target;
    const peers = edges.filter(item => (outgoing ? item.source : item.target) === id)
      .sort((a, b) => positions.get(outgoing ? a.target : a.source).y - positions.get(outgoing ? b.target : b.source).y || a.source.localeCompare(b.source) || a.target.localeCompare(b.target));
    return (peers.indexOf(edge) - (peers.length - 1) / 2) * Math.min(12, 50 / Math.max(1, peers.length - 1));
  };
  for (const edge of edges) {
    const source = positions.get(edge.source), target = positions.get(edge.target);
    const sourceY = source.y + port(edge, true), targetY = target.y + port(edge, false);
    edge.points = [{x: source.x + HALF_WIDTH, y: sourceY}];
    if (depths.get(edge.source) < depths.get(edge.target)) {
      for (const id of edge.route) {
        const slot = allPositions.get(id);
        edge.points.push({x: slot.x - HALF_WIDTH, y: slot.y}, {x: slot.x + HALF_WIDTH, y: slot.y});
      }
    } else {
      const y = 34 + contentHeight + 26 + returns++ * 20;
      edge.points.push({x: source.x + 140, y: sourceY}, {x: source.x + 140, y},
        {x: target.x - 140, y}, {x: target.x - 140, y: targetY});
    }
    edge.points.push({x: target.x - HALF_WIDTH, y: targetY});
    delete edge.route;
  }
  return {positions, edges, width: Math.max(720, 286 + (best.length - 1) * 330),
    height: 68 + contentHeight + (returns ? 26 + returns * 20 : 0)};
}

function graphEdgePath(points, vertical = false, routed = false) {
  let path = `M ${points[0].x} ${points[0].y}`;
  if (routed) {
    // Round the protected side lanes, including during an interrupted animation.
    for (let i=1;i<points.length-1;i++) {
      const a=points[i-1],b=points[i],c=points[i+1];
      const incoming=Math.hypot(a.x-b.x,a.y-b.y),outgoing=Math.hypot(c.x-b.x,c.y-b.y);
      const radius=Math.min(30,incoming/2,outgoing/2);
      if (!incoming || !outgoing) { path+=` L ${b.x} ${b.y}`; continue; }
      const before={x:b.x+(a.x-b.x)*radius/incoming,y:b.y+(a.y-b.y)*radius/incoming};
      const after={x:b.x+(c.x-b.x)*radius/outgoing,y:b.y+(c.y-b.y)*radius/outgoing};
      path+=` L ${before.x} ${before.y} Q ${b.x} ${b.y}, ${after.x} ${after.y}`;
    }
    const last=points.at(-1);return path+` L ${last.x} ${last.y}`;
  }
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    // Example branches leave the bottom and enter the top of their boxes.
    // Vertical tangents also join the reserved straight stem without a corner.
    if (vertical) {
      const mid = (a.y + b.y) / 2;
      path += a.x === b.x ? ` L ${b.x} ${b.y}` : ` C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${b.y}`;
    } else {
      const mid = (a.x + b.x) / 2;
      path += a.y === b.y ? ` L ${b.x} ${b.y}` : ` C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
    }
  }
  return path;
}


module.exports = {graphLayout, graphEdgePath};
