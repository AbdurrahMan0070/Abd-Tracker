/**
 * Core attendance prediction utilities
 */

const MIN_PERCENT = 75;

/**
 * Calculate current attendance percentage
 */
function calcPercent(attended, total) {
  if (total === 0) return 0;
  return parseFloat(((attended / total) * 100).toFixed(2));
}

/**
 * How many more classes can be missed while staying >= 75%
 * Formula: (attended - 0.75 * (total + x)) >= 0  → solve for x
 * attended >= 0.75 * total + 0.75x
 * x <= (attended - 0.75 * total) / 0.75
 */
function canMiss(attended, total) {
  const result = Math.floor((attended - MIN_PERCENT / 100 * total) / (MIN_PERCENT / 100));
  return Math.max(0, result);
}

/**
 * How many consecutive classes must be attended to reach >= 75%
 * attended + y >= 0.75 * (total + y)
 * attended + y >= 0.75*total + 0.75y
 * 0.25y >= 0.75*total - attended
 * y >= (0.75*total - attended) / 0.25
 */
function mustAttend(attended, total) {
  const needed = Math.ceil((MIN_PERCENT / 100 * total - attended) / (1 - MIN_PERCENT / 100));
  return Math.max(0, needed);
}

/**
 * Simulate attending next class
 */
function simulateAttend(attended, total) {
  return calcPercent(attended + 1, total + 1);
}

/**
 * Simulate missing next class
 */
function simulateMiss(attended, total) {
  return calcPercent(attended, total + 1);
}

/**
 * Risk level
 */
function riskLevel(percent) {
  if (percent < MIN_PERCENT) return 'DANGER';
  if (percent < 80) return 'WARNING';
  return 'SAFE';
}

/**
 * Full prediction object for a subject
 */
function buildPrediction(attended, total) {
  const percent = calcPercent(attended, total);
  const risk = riskLevel(percent);
  const missable = canMiss(attended, total);
  const toAttend = mustAttend(attended, total);
  const ifAttend = simulateAttend(attended, total);
  const ifMiss = simulateMiss(attended, total);

  return {
    attended,
    total,
    percent,
    risk,
    canMiss: missable,
    mustAttend: toAttend,
    simulation: {
      ifAttend,
      ifMiss,
      ifAttendRisk: riskLevel(ifAttend),
      ifMissRisk: riskLevel(ifMiss),
    },
  };
}

module.exports = { calcPercent, canMiss, mustAttend, simulateAttend, simulateMiss, riskLevel, buildPrediction };
