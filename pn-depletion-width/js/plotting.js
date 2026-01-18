/**
 * Plotting and Visualization Functions
 */

/**
 * Plot depletion width results
 * @param {Object} results - Calculation results from calculateDepletionWidth
 * @param {Array<Array<number>>} donorData - Donor concentration data
 * @param {Array<Array<number>>} acceptorData - Acceptor concentration data
 */
function plotResults(results, donorData, acceptorData) {
  if (!results) {
    // Plot only doping profile if calculation failed
    plotDopingProfileOnly(donorData, acceptorData);
    return;
  }
  
  plotDepletionWidth(results.depletionWidths);
  plotDopingProfile(donorData, acceptorData, results.netDoping);
}

/**
 * Plot depletion width vs voltage
 * @param {Object} depletionWidths - Object with total, nSide, and pSide arrays
 */
function plotDepletionWidth(depletionWidths) {
  const plotData = [
    {
      data: depletionWidths.total,
      color: "rgb(0, 255, 0)",
      shadowSize: 0,
      lines: { show: true },
      label: "Total"
    },
    {
      data: depletionWidths.pSide,
      color: "rgb(255, 0, 0)",
      shadowSize: 0,
      lines: { show: true },
      label: "p-side"
    },
    {
      data: depletionWidths.nSide,
      color: "rgb(0, 0, 255)",
      shadowSize: 0,
      lines: { show: true },
      label: "n-side"
    }
  ];
  
  const options = {
    yaxis: {
      min: depletionWidths.total[0][1],
      max: depletionWidths.total[depletionWidths.total.length - 1][1]
    }
  };
  
  $.plot($("#depletion_width"), plotData, options);
}

/**
 * Plot doping concentration profiles
 * @param {Array<Array<number>>} donorData - Donor concentration data
 * @param {Array<Array<number>>} acceptorData - Acceptor concentration data
 * @param {Array<number>} netDoping - Net doping concentration
 */
function plotDopingProfile(donorData, acceptorData, netDoping) {
  // Create total doping data from net doping
  const totalDopingData = donorData.map((pair, index) => [pair[0], netDoping[index]]);
  
  const plotData = [
    {
      data: donorData,
      color: "rgb(0, 0, 255)",
      shadowSize: 0,
      lines: { show: true },
      label: "Donors (N_D)"
    },
    {
      data: acceptorData,
      color: "rgb(255, 0, 0)",
      shadowSize: 0,
      lines: { show: true },
      label: "Acceptors (N_A)"
    },
    {
      data: totalDopingData,
      color: "rgb(0, 0, 0)",
      shadowSize: 0,
      lines: { show: true },
      label: "Net (N_A - N_D)"
    }
  ];
  
  const options = {
    yaxis: {
      tickFormatter: function(val, axis) {
        return val.toExponential(1);
      }
    }
  };
  
  $.plot($("#doping_profile"), plotData, options);
}

/**
 * Plot only doping profile when calculation fails
 * @param {Array<Array<number>>} donorData - Donor concentration data
 * @param {Array<Array<number>>} acceptorData - Acceptor concentration data
 */
function plotDopingProfileOnly(donorData, acceptorData) {
  const acceptorConc = acceptorData.map(pair => pair[1]);
  const donorConc = donorData.map(pair => pair[1]);
  const netDoping = acceptorConc.map((na, i) => na - donorConc[i]);
  
  plotDopingProfile(donorData, acceptorData, netDoping);
}
