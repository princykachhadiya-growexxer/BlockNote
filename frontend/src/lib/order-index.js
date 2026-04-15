/**
 * Float order_index utilities.
 * All indices are positive floats with a gap of 1000 between "clean" positions.
 */

export const BASE_STEP = 1000;
export const RENORM_THRESHOLD = 0.001;

/**
 * Compute the order_index for a new block inserted AFTER `prev` and BEFORE `next`.
 * If prev is null  → insert before everything (half of next, or BASE_STEP if next is null too).
 * If next is null  → append after prev by BASE_STEP.
 */
export function midpoint(prev, next) {
  if (prev == null && next == null) return BASE_STEP;
  if (prev == null) return next / 2;
  if (next == null) return prev + BASE_STEP;
  return (prev + next) / 2;
}

/**
 * Append order_index: last block's index + BASE_STEP.
 */
export function appendIndex(blocks) {
  if (!blocks.length) return BASE_STEP;
  return blocks[blocks.length - 1].order_index + BASE_STEP;
}

/**
 * Check if any adjacent pair in a sorted block list has collapsed below threshold.
 */
export function needsRenorm(blocks) {
  for (let i = 1; i < blocks.length; i++) {
    if (blocks[i].order_index - blocks[i - 1].order_index < RENORM_THRESHOLD) return true;
  }
  return false;
}

/**
 * Return a new array of { id, order_index } with evenly-spaced indices.
 * Call apiReorderBlocks with this result.
 */
export function buildRenormList(blocks) {
  return blocks.map((b, i) => ({ id: b.id, order_index: (i + 1) * BASE_STEP }));
}
