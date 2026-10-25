/**
 * Depletion Width Calculation Functions
 */

/**
 * Calculate cumulative sum in a range with interpolation support
 * @param {Array<number>} array - Array of values to sum
 * @param {number} startIndex - Start index (can be fractional)
 * @param {number} endIndex - End index (can be fractional)
 * @param {number} depletionWidthUnit - Unit conversion factor
 * @returns {number} Cumulative sum result
 */
function cumulativeSumInRange(array, startIndex, endIndex, depletionWidthUnit) {
  let cumulativeSum = 0;
  const factor = ELEMENTARY_CHARGE / PERMITTIVITY * depletionWidthUnit * depletionWidthUnit;
  
  /**
   * Process a continuous segment with fractional indices
   */
  const processSegment = (start, end) => {
    let sum = 0;
    
    // Handle fractional start segment
    if (start % 1 !== 0) {
      const value = getInterpolatedValue(array, start);
      sum += value * (Math.ceil(start) - start);
    }
    
    // Handle full integer segments
    for (let i = Math.ceil(start); i < Math.floor(end); i++) {
      sum += array[i];
    }
    
    // Handle fractional end segment
    if (end % 1 !== 0) {
      const value = getInterpolatedValue(array, end);
      sum += value * (end - Math.floor(end));
    }
    
    return sum;
  };
  
  // Outer loop: integrate over the range
  for (let i = startIndex; i <= endIndex; i++) {
    cumulativeSum += processSegment(startIndex, i) * factor;
  }
  
  return cumulativeSum;
}

/**
 * Calculate depletion width as a function of reverse-biased voltage
 * @param {Array<Array<number>>} donorData - Donor concentration data [[x, N_D], ...]
 * @param {Array<Array<number>>} acceptorData - Acceptor concentration data [[x, N_A], ...]
 * @returns {Object} Object containing voltage-depletion width relationships
 */
function calculateDepletionWidth(donorData, acceptorData) {
  // Extract concentration values
  const acceptorConc = acceptorData.map(pair => pair[1]);
  const donorConc = donorData.map(pair => pair[1]);
  
  // Calculate spatial step size
  const dx = donorData[1][0] - donorData[0][0];
  const depletionWidthUnit = MICROMETER_TO_METER * dx;
  
  // Calculate net doping concentration: N_total = N_A - N_D
  const netDoping = acceptorConc.map((na, i) => na - donorConc[i]);
  
  // Validate single junction
  if (!validateSingleJunction(netDoping)) {
    return null;
  }
  
  // Find junction position (where doping changes sign)
  const junctionIndex = findSignChangeIndex(netDoping);
  
  // Initialize electric field tracking
  const leftField = {
    values: [0],
    indices: [junctionIndex]
  };
  
  const rightField = {
    values: [0],
    indices: [junctionIndex]
  };
  
  // Initialize depletion width results
  const results = {
    total: [],
    nSide: [],
    pSide: []
  };
  
  // Calculate initial field contributions
  let leftFieldValue = ELEMENTARY_CHARGE * netDoping[junctionIndex] / PERMITTIVITY;
  let rightFieldValue = ELEMENTARY_CHARGE * netDoping[junctionIndex + 1] / PERMITTIVITY;
  
  let leftCounter = 1;
  let rightCounter = 1;
  
  // Add initial field values
  leftField.values.push(leftFieldValue);
  leftField.indices.push(junctionIndex - leftCounter);
  rightField.values.push(rightFieldValue);
  rightField.indices.push(junctionIndex + rightCounter);
  
  // Iterate to calculate depletion widths at different voltages
  const maxIndex = netDoping.length - 1;
  
  while (junctionIndex - leftCounter >= 0 && junctionIndex + rightCounter <= maxIndex - 1) {
    let voltage, interpolatedCounter;
    
    if (Math.abs(leftFieldValue) <= Math.abs(rightFieldValue)) {
      // Extend on the left (p-side)
      interpolatedCounter = findInterpolatedIndex(
        rightField.values, 
        rightCounter, 
        leftFieldValue
      );
      
      voltage = Math.abs(cumulativeSumInRange(
        netDoping,
        junctionIndex - leftCounter,
        junctionIndex + interpolatedCounter,
        depletionWidthUnit
      ));
      
      results.nSide.push([leftCounter * dx, voltage]);
      results.pSide.push([interpolatedCounter * dx, voltage]);
      results.total.push([(leftCounter + interpolatedCounter) * dx, voltage]);
      
      // Update left side
      leftCounter++;
      leftFieldValue += ELEMENTARY_CHARGE * netDoping[junctionIndex - leftCounter] / PERMITTIVITY;
      leftField.values.push(leftFieldValue);
      leftField.indices.push(junctionIndex - leftCounter);
      
    } else {
      // Extend on the right (n-side)
      interpolatedCounter = findInterpolatedIndex(
        leftField.values,
        leftCounter,
        rightFieldValue
      );
      
      voltage = Math.abs(cumulativeSumInRange(
        netDoping,
        junctionIndex - interpolatedCounter,
        junctionIndex + rightCounter,
        depletionWidthUnit
      ));
      
      results.nSide.push([interpolatedCounter * dx, voltage]);
      results.pSide.push([rightCounter * dx, voltage]);
      results.total.push([(interpolatedCounter + rightCounter) * dx, voltage]);
      
      // Update right side
      rightCounter++;
      rightFieldValue += ELEMENTARY_CHARGE * netDoping[junctionIndex + rightCounter] / PERMITTIVITY;
      rightField.values.push(rightFieldValue);
      rightField.indices.push(junctionIndex + rightCounter);
    }
  }
  
  return {
    depletionWidths: results,
    netDoping: netDoping,
    junctionIndex: junctionIndex
  };
}

/**
 * Validate that there is exactly one PN junction in the profile
 * @param {Array<number>} netDoping - Net doping concentration array
 * @returns {boolean} True if valid single junction exists
 */
function validateSingleJunction(netDoping) {
  const signChanges = countSignChanges(netDoping);
  
  if (signChanges !== 1) {
    alert(
      "The junction is formed at N_A = N_D. " +
      "Please make sure that there is only one junction in the given interval."
    );
    return false;
  }
  
  return true;
}
