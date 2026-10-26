/* Partition complete prepared groups; no phrase or step is rewritten. */
(function (root, factory) {
  'use strict';
  const api = Object.freeze(factory());
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MelungaVisibleSequences = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function compareBounds(a, b) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
    return a.length - b.length;
  }

  function partitionGroupBoundaries(weights) {
    if (!Array.isArray(weights) || !weights.length || Array.from(weights).some(n => !Number.isInteger(n) || n < 1 || n > 40)) throw new Error('Invalid technical group weights');
    const prefix = [0];
    weights.forEach(n => prefix.push(prefix.at(-1) + n));
    const total = prefix.at(-1), count = weights.length;
    if (total <= 100) return [{groupStart: 0, groupEndExclusive: count, cards: total, firstPresentation: 1, lastPresentation: total}];
    let chosen;
    for (let k = Math.ceil(total / 40); k <= Math.floor(total / 30); k++) {
      let previous = new Map([[0, {cost: 0, ends: []}]]);
      for (let used = 1; used <= k; used++) {
        const next = new Map();
        for (let end = 1; end <= count; end++) {
          for (let start = end - 1; start >= 0; start--) {
            const size = prefix[end] - prefix[start];
            if (size > 40) break;
            if (size < 30 || !previous.has(start)) continue;
            const before = previous.get(start), candidate = {cost: before.cost + (size - 35) ** 2, ends: [...before.ends, end]};
            const current = next.get(end);
            if (!current || candidate.cost < current.cost || candidate.cost === current.cost && compareBounds(candidate.ends, current.ends) < 0) next.set(end, candidate);
          }
        }
        previous = next;
      }
      const result = previous.get(count);
      if (!result) continue;
      const candidate = {distance: Math.abs(total - 35 * k), cost: result.cost, k, ends: result.ends};
      if (!chosen || candidate.distance < chosen.distance || candidate.distance === chosen.distance && (candidate.cost < chosen.cost || candidate.cost === chosen.cost && (candidate.k < chosen.k || candidate.k === chosen.k && compareBounds(candidate.ends, chosen.ends) < 0))) chosen = candidate;
    }
    if (!chosen) throw new Error('No contiguous 30–40-card partition preserves the technical groups');
    let start = 0;
    return chosen.ends.map(end => {
      const chunk = {groupStart: start, groupEndExclusive: end, cards: prefix[end] - prefix[start], firstPresentation: prefix[start] + 1, lastPresentation: prefix[end]};
      start = end;
      return chunk;
    });
  }
  return { partitionGroupBoundaries };
});
