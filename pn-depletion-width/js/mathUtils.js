/**
 * Mathematical Utility Functions
 */

/**
 * Heaviside step function
 * Returns 0.5 at x=0, 0 for x<0, and 1 for x>0
 * @param {number} x - Input value
 * @returns {number} Step function value
 */
function H(x) {
  if (x === 0) {
    return 0.5;
  }
  return (1 + x / Math.abs(x)) / 2;
}

/**
 * Find the index of the element closest to zero in an array
 * @param {Array<number>} arr - Array of numbers
 * @returns {number} Index of element closest to zero
 */
function findClosestToZeroIndex(arr) {
  return arr.reduce((closestIndex, currentValue, currentIndex, array) => {
    const isCloser = Math.abs(currentValue) < Math.abs(array[closestIndex]);
    const isSameDistanceButPositive = 
      Math.abs(currentValue) === Math.abs(array[closestIndex]) && 
      currentValue > array[closestIndex];
    
    if (isCloser || isSameDistanceButPositive) {
      return currentIndex;
    }
    return closestIndex;
  }, 0);
}

/**
 * Find interpolated index where array value matches target
 * @param {Array<number>} arr - Array of values
 * @param {number} index - Current index
 * @param {number} target - Target value to find
 * @returns {number|null} Interpolated index or null if not found
 */
function findInterpolatedIndex(arr, index, target) {
  const y0 = Math.abs(arr[index - 1]);
  const y1 = Math.abs(arr[index]);
  
  // Handle equal values
  if (y0 === y1) {
    return Math.abs(target) === y0 ? index - 0.5 : null;
  }
  
  // Calculate interpolation factor
  const t = (Math.abs(target) - y0) / (y1 - y0);
  return index - 1 + t;
}

/**
 * Count the number of sign changes in an array
 * @param {Array<number>} arr - Array of numbers
 * @returns {number} Number of sign changes
 */
function countSignChanges(arr) {
  let changes = 0;
  let hasPositive = false;
  let hasNegative = false;
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > 0) {
      hasPositive = true;
      if (hasNegative) {
        changes++;
        hasNegative = false;
      }
    } else if (arr[i] < 0) {
      hasNegative = true;
      if (hasPositive) {
        changes++;
        hasPositive = false;
      }
    }
  }
  
  return changes;
}

/**
 * Find the index where the first sign change occurs
 * @param {Array<number>} arr - Array of numbers
 * @returns {number} Index of first sign change, or -1 if none found
 */
function findSignChangeIndex(arr) {
  let hasPositive = false;
  let hasNegative = false;
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > 0) {
      hasPositive = true;
      if (hasNegative) {
        return i;
      }
    } else if (arr[i] < 0) {
      hasNegative = true;
      if (hasPositive) {
        return i;
      }
    }
  }
  
  return -1; // No sign change found
}

/**
 * Get interpolated value at a fractional array index
 * @param {Array<number>} array - Array of values
 * @param {number} index - Fractional index
 * @returns {number} Interpolated value
 */
function getInterpolatedValue(array, index) {
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  
  if (lower < 0 || upper >= array.length) {
    throw new Error("Index out of array bounds");
  }
  
  // Handle integer indices
  if (lower === upper) {
    return array[lower];
  }
  
  // Linear interpolation for fractional indices
  const fraction = index - lower;
  return array[lower] * (1 - fraction) + array[upper] * fraction;
}
