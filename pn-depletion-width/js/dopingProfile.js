/**
 * Doping Profile Handling Functions
 */

/**
 * Replace mathematical function names with Math object equivalents
 * @param {string} str - Expression string to process
 * @returns {string} Processed string with Math. prefixes
 */
function replaceWithMathFunctions(str) {
  let result = str;
  
  // Replace variable x with qq (temporary placeholder)
  result = result.replace(/x/gi, "qq");
  
  // Replace mathematical functions with Math. equivalents
  const functions = [
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'log', 'sqrt', 'abs', 'round'
  ];
  
  functions.forEach(func => {
    // Handle word boundaries and avoid replacing in Math.sin patterns
    result = result.replace(new RegExp(`\\b${func}`, 'gi'), `Math.${func}`);
    result = result.replace(new RegExp(`([^a\\.])${func}`, 'gi'), `$1Math.${func}`);
  });
  
  // Special handling for exp (to avoid replacing in "exp" as part of exponent notation)
  result = result.replace(/eqqp/gi, "Math.exp");
  
  // Handle pow and pi
  result = result.replace(/pow/gi, "Math.pow");
  result = result.replace(/pi/gi, "Math.PI");
  
  return result;
}

/**
 * Validate that a string represents a valid number
 * @param {string} name - Name of the parameter (for error messages)
 * @param {string} str - String to validate
 * @returns {string} Cleaned string
 */
function validateNumber(name, str) {
  // Check for invalid ^ character
  if (str.match(/\^/g)) {
    alert(`^ character in ${name} not allowed. Use ** for exponentiation.`);
  }
  
  // Remove extra whitespace
  str = str.replace(/\s+/g, "");
  
  // Check if empty
  if (str === "") {
    alert(`${name} is not specified.`);
  }
  
  return str;
}

/**
 * Parse and evaluate doping profile expressions
 * @param {string} donorExpr - Donor concentration expression N_D(x)
 * @param {string} acceptorExpr - Acceptor concentration expression N_A(x)
 * @param {number} x1 - Start position in micrometers
 * @param {number} x2 - End position in micrometers
 * @returns {Object} Object containing donor and acceptor data arrays
 */
function parseDopingProfiles(donorExpr, acceptorExpr, x1, x2) {
  // Check for ^ character and suggest **
  if (donorExpr.match(/\^/g)) {
    alert("^ character not allowed. Use ** for exponentiation.");
    donorExpr = donorExpr.replace(/\^/gi, "**");
  }
  
  if (acceptorExpr.match(/\^/g)) {
    alert("^ character not allowed. Use ** for exponentiation.");
    acceptorExpr = acceptorExpr.replace(/\^/gi, "**");
  }
  
  // Process expressions
  const processedDonor = replaceWithMathFunctions(donorExpr);
  const processedAcceptor = replaceWithMathFunctions(acceptorExpr);
  
  const donorData = [];
  const acceptorData = [];
  const numPoints = 301;
  
  // Evaluate expressions at each point
  for (let i = 0; i < numPoints; i++) {
    const x = x1 + i * (x2 - x1) / (numPoints - 1);
    const xStr = `(${x})`;
    
    try {
      const donorValue = eval(processedDonor.replace(/qq/gi, xStr));
      donorData[i] = [x, donorValue];
    } catch (err) {
      alert(`Error evaluating donor concentration N_D(x): ${err.message}`);
      throw err;
    }
    
    try {
      const acceptorValue = eval(processedAcceptor.replace(/qq/gi, xStr));
      acceptorData[i] = [x, acceptorValue];
    } catch (err) {
      alert(`Error evaluating acceptor concentration N_A(x): ${err.message}`);
      throw err;
    }
  }
  
  return {
    donor: donorData,
    acceptor: acceptorData
  };
}
