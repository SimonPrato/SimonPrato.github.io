/**
 * Main Application Logic
 */

// Track help display state
let helpDisplayed = false;

/**
 * Main plotting function - orchestrates the entire calculation and visualization
 */
function plot() {
  const formData = document.forms.data;
  
  // Get and validate input values
  let x1, x2;
  
  try {
    const x1Str = validateNumber('x1', formData.x1.value);
    x1 = eval(replaceWithMathFunctions(x1Str));
  } catch (err) {
    alert(`Error in x1: ${err.message}`);
    return;
  }
  
  try {
    const x2Str = validateNumber('x2', formData.x2.value);
    x2 = eval(replaceWithMathFunctions(x2Str));
  } catch (err) {
    alert(`Error in x2: ${err.message}`);
    return;
  }
  
  // Parse doping profiles
  let dopingData;
  try {
    dopingData = parseDopingProfiles(
      formData.f1.value,
      formData.f2.value,
      x1,
      x2
    );
  } catch (err) {
    console.error("Error parsing doping profiles:", err);
    return;
  }
  
  // Calculate depletion width
  const results = calculateDepletionWidth(dopingData.donor, dopingData.acceptor);
  
  // Plot results
  plotResults(results, dopingData.donor, dopingData.acceptor);
  
  // Log results for debugging
  if (results) {
    console.log("Depletion width calculation completed");
    console.log("Total depletion width data:", results.depletionWidths.total);
  }
}

/**
 * Load preset junction configuration
 * @param {string} type - Type of junction ('abrupt' or 'graded')
 */
function loadPreset(type) {
  const formData = document.forms.data;
  
  if (type === 'abrupt') {
    formData.f1.value = '1.1E21*H(x-5)';
    formData.f2.value = '1.1E21 - 1.1E21*H(x-5)';
    formData.x1.value = '0';
    formData.x2.value = '10';
  } else if (type === 'graded') {
    formData.f1.value = '1E20*x';
    formData.f2.value = '5E20';
    formData.x1.value = '0';
    formData.x2.value = '10';
  }
  
  plot();
}

/**
 * Toggle help display
 */
function toggleHelp() {
  const helpElement = document.getElementById('help');
  const helpButton = document.getElementById('question');
  
  if (!helpDisplayed) {
    // Show help
    let helpText = "<p>Input two mathematical expressions that may use the variable x into the two blue text boxes. ";
    helpText += "The mathematical functions that can be used are listed below. Multiplication must be ";
    helpText += "specified with a '*' symbol, 3*cos(x) not 3cos(x). Powers are specified with ** ";
    helpText += "(x² is x**2 not x^2).</p>";
    
    helpText += "<table align='center'><tr><td><ul>";
    helpText += "<li>abs(<i>x</i>) - absolute value</li>";
    helpText += "<li>acos(<i>x</i>) - inverse cosine</li>";
    helpText += "<li>asin(<i>x</i>) - inverse sine</li>";
    helpText += "<li>atan(<i>x</i>) - inverse tangent</li>";
    helpText += "<li>cos(<i>x</i>) - cosine</li>";
    helpText += "<li>exp(<i>x</i>) - <i>e<sup>x</sup></i></li>";
    helpText += "<li>log(<i>x</i>) - natural logarithm</li>";
    helpText += "</ul></td><td><ul>";
    helpText += "<li>pi = 3.141592653589793</li>";
    helpText += "<li>pow(<i>x,y</i>) or x**y - compute <i>x<sup>y</sup></i></li>";
    helpText += "<li>round(<i>x</i>) - round to the nearest integer</li>";
    helpText += "<li>sin(<i>x</i>) - sine</li>";
    helpText += "<li>sqrt(<i>x</i>) - square root</li>";
    helpText += "<li>tan(<i>x</i>) - tangent</li>";
    helpText += "<li>H(<i>x</i>) - Heaviside function = 0 for <i>x</i>&nbsp;&lt;&nbsp;0, 1 for <i>x</i>&nbsp;&gt;&nbsp;0</li>";
    helpText += "</ul></td></tr></table>";
    
    helpElement.innerHTML = helpText;
    helpElement.style.display = 'block';
    helpButton.value = "-?";
    helpDisplayed = true;
  } else {
    // Hide help
    helpElement.innerHTML = "";
    helpElement.style.display = 'none';
    helpButton.value = "?";
    helpDisplayed = false;
  }
}
