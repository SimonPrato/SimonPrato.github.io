function findClosestToZeroIndex(arr) {
  return arr.reduce((closestIndex, currentValue, currentIndex, array) => {
    if (Math.abs(currentValue) < Math.abs(array[closestIndex]) || 
        (Math.abs(currentValue) === Math.abs(array[closestIndex]) && currentValue > array[closestIndex])) {
      return currentIndex;
    }
    return closestIndex;
  }, 0);
}


function findInterpolatedIndex(arr, index, target) {
    const y0 = Math.abs(arr[index - 1]);
    const y1 = Math.abs(arr[index]);
    
    // Handle equal values
    if (y0 === y1) {
        return Math.abs(target) === y0 ? index - 0.5 : null;
    }
    
    // Calculate interpolation index
    const t = (Math.abs(target) - y0) / (y1 - y0);
    return index - 1 + t;
}

function countSignChanges(arr) {
  let changes = 0;
  let positive = false;
  let negative = false;
  
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > 0){
      positive = true;
	  if (negative == true)
	  {
		changes ++;
		negative = false;
	  }
    }    
	else if (arr[i] < 0){
      negative = true;
	  if (positive == true)
	  {
		changes ++;
		positive = false;
	  }
    }
  }
  
  return changes;
}

function findSignChangeIndex(arr) {
  let positive = false;
  let negative = false;
  for (let i = 0; i < arr.length - 1; i++) {

    // Check if the sign changes between consecutive elements
    if (arr[i] > 0) {
      positive = true;
	  if (negative == true) {
      return i; // Return the index where the sign changes
    }
    }
	else if (arr[i] < 0) {
      negative = true;
	  if (positive == true) {
      return i; // Return the index where the sign changes
    }
    }
  }
  return -1; // Return -1 if no sign change is found
}
function cumulativeSumInRange(array, startIndex, endIndex, depletion_width_unit) {
    let cumulativeSum = 0;
    const e_charge = 1.60217663e-19;
    const factor = e_charge / (12 * 8.8541878188e-12) * depletion_width_unit * depletion_width_unit;

    // Helper function to get interpolated value at fractional index
    const getValue = (index) => {
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        
        if (lower < 0 || upper >= array.length) {
            throw new Error("Index out of array bounds");
        }
        
        // Handle integer indices
        if (lower === upper) return array[lower];
        
        // Linear interpolation for fractional indices
        const fraction = index - lower;
        return array[lower] * (1 - fraction) + array[upper] * fraction;
    };

    // Process continuous range
    const processSegment = (start, end) => {
        const fullLength = Math.floor(end) - Math.ceil(start);
        let sum = 0;

        // Handle fractional start segment
        if (start % 1 !== 0) {
            const value = getValue(start);
            sum += value * (Math.ceil(start) - start);
        }

        // Handle full integer segments
        for (let i = Math.ceil(start); i < Math.floor(end); i++) {
            sum += array[i];
        }

        // Handle fractional end segment
        if (end % 1 !== 0) {
            const value = getValue(end);
            sum += value * (end - Math.floor(end));
        }

        return sum;
    };

    // Outer loop (i values)
    for (let i = startIndex; i <= endIndex; i++) {
        // Inner loop (j values from startIndex to i)
        cumulativeSum += processSegment(startIndex, i) * factor;
    }

    return cumulativeSum;
}

function calculate_depletion_width(d1, d2){
		const e_charge = 1.60217663e-19;  // Elementary charge [C]
		
		
		// Doping profiles per cubic meter
		const Na_x = d2.map(pair => pair[1]);
		const Nd_x = d1.map(pair => pair[1]);

		const dx = d1[1][0] - d1[0][0];		// The unit of the x-axis is µm. Scale it correctly with dx.

		// Net doping concentration
		const N_tot = Na_x.map((na, i) => na - Nd_x[i]);
		if (countSignChanges(N_tot) != 1){
			alert("The junction is formed at NA = ND. Please make sure that there is only one junction in the given interval.");
			var options = {
			yaxis: {
			tickFormatter: function (val, axis) {
				return (val).toExponential(1); // 1 decimal place
			}
			}
			};
			junction_index = findClosestToZeroIndex(N_tot);
			var doping_profile = [{ data: d1, color: "rgb(0, 0, 255)", shadowSize:0, lines: {show:true}, label: "Donors"},
			{ data: d2, color: "rgb(255, 0, 0)", shadowSize:0, lines: {show:true}, label: "Acceptors"},
			{ data: d1.map((pair, index) => [pair[0], N_tot[index]]), color: "rgb(0, 0, 0)", shadowSize:0, lines: {show:true}, label: "total"}
			//,{ data: [[d1[junction_index][0], Math.min(...N_tot)], [d1[junction_index][0], Math.max(...N_tot)]], color: "rgb(255, 0, 0)", shadowSize: 0, lines: { show: true, lineWidth: 2 }, label: "Junction"
			];
			$.plot($("#doping_profile"), doping_profile, options_doping_profile);
			return -1;
		}
		
		// Find the start of the depletion width
		const minimum_doping = findSignChangeIndex(N_tot);

		// Material parameters
		const eps = 12 * 8.8541878188e-12;  // Permittivity [F/m]

		const depletion_width_unit = 1e-6 * dx; //1e-6 equals micrometers, 1e-3 milimeters, ...
		
		// start calculations
		let voltage_depletion_width_tot = [];
		let voltage_depletion_width_n = [];
		let voltage_depletion_width_p = [];
		let part_E_field_rightside = e_charge * N_tot[minimum_doping+1]/eps;
		let part_E_field_leftside = e_charge * N_tot[minimum_doping]/eps;
		let left_field_counter = 1;
		let right_field_counter = 1;
		
		tot_left_E_field = {
			E_field: [0],
			coordinate: [minimum_doping]
		};
		tot_right_E_field = {
			E_field: [0],
			coordinate: [minimum_doping]
		};
		tot_left_E_field.E_field.push(part_E_field_leftside);
		tot_left_E_field.coordinate.push((minimum_doping - left_field_counter) * dx);
		tot_right_E_field.E_field.push(part_E_field_rightside);
		tot_right_E_field.coordinate.push((minimum_doping + right_field_counter) * dx);
		while (minimum_doping - left_field_counter >= 0 && right_field_counter + minimum_doping <= 299) {
			if (Math.abs(part_E_field_leftside) <= Math.abs(part_E_field_rightside)){
				interpolated_right_counter = findInterpolatedIndex(tot_right_E_field.E_field, right_field_counter, part_E_field_leftside);
				voltage = Math.abs(cumulativeSumInRange(N_tot, minimum_doping - left_field_counter, minimum_doping + interpolated_right_counter, depletion_width_unit));
				voltage_depletion_width_n.push([(left_field_counter)*dx, voltage]);
				voltage_depletion_width_p.push([(interpolated_right_counter)*dx, voltage]);
				voltage_depletion_width_tot.push([(left_field_counter + interpolated_right_counter)*dx, voltage]);
				left_field_counter += 1;
				part_E_field_leftside += e_charge * N_tot[minimum_doping - left_field_counter]/eps;
				tot_left_E_field.E_field.push(part_E_field_leftside);
				tot_left_E_field.coordinate.push((minimum_doping - left_field_counter) * dx);
			}
			else{
				interpolated_left_counter = findInterpolatedIndex(tot_left_E_field.E_field, left_field_counter, part_E_field_rightside);
				voltage = Math.abs(cumulativeSumInRange(N_tot, minimum_doping - interpolated_left_counter, minimum_doping + right_field_counter, depletion_width_unit));
				voltage_depletion_width_n.push([(interpolated_left_counter)*dx, voltage]);
				voltage_depletion_width_p.push([(right_field_counter)*dx, voltage]);
				voltage_depletion_width_tot.push([(interpolated_left_counter + right_field_counter)*dx, voltage]);
				right_field_counter += 1;
				part_E_field_rightside += e_charge * N_tot[minimum_doping + right_field_counter]/eps;
				tot_right_E_field.E_field.push(part_E_field_rightside);
				tot_right_E_field.coordinate.push((minimum_doping + right_field_counter) * dx);
			}
		}
		
		// plot results
		var depletion_width = [{ data: voltage_depletion_width_tot, color: "rgb(0, 255, 0)", shadowSize:0, lines: {show:true}, label: "total"},
		{ data: voltage_depletion_width_p, color: "rgb(255, 0, 0)", shadowSize:0, lines: {show:true}, label: "p-side"},
		{ data: voltage_depletion_width_n, color: "rgb(0, 0, 255)", shadowSize:0, lines: {show:true}, label: "n-side"}];

		
		var lastIndex = voltage_depletion_width_tot.length - 1;
		var options_depletion_width = {
		  yaxis: {
		    min: voltage_depletion_width_tot[0][1],
		    max: voltage_depletion_width_tot[lastIndex][1]  // use last valid element
		  },
		};

		var options_doping_profile = {
		yaxis: {
        tickFormatter: function (val, axis) {
            return (val).toExponential(1); // 1 decimal place
        }
		}
		};
		junction_index = findClosestToZeroIndex(N_tot);
		var doping_profile = [{ data: d1, color: "rgb(0, 0, 255)", shadowSize:0, lines: {show:true}, label: "Donors"},
		{ data: d2, color: "rgb(255, 0, 0)", shadowSize:0, lines: {show:true}, label: "Acceptors"},
		{ data: d1.map((pair, index) => [pair[0], N_tot[index]]), color: "rgb(0, 0, 0)", shadowSize:0, lines: {show:true}, label: "total"}
		//,{ data: [[d1[junction_index][0], Math.min(...N_tot)], [d1[junction_index][0], Math.max(...N_tot)]], color: "rgb(255, 0, 0)", shadowSize: 0, lines: { show: true, lineWidth: 2 }, label: "Junction"
		];
		console.log(voltage_depletion_width_tot);
		console.log("deplwidthtot");
		$.plot($("#depletion_width"), depletion_width, options_depletion_width);
		$.plot($("#doping_profile"), doping_profile, options_doping_profile);
		console.log({firstArray: N_tot, secondArray: d1[0]});
		}
