/**
 * Physical Constants for PN Junction Calculations
 */

// Elementary charge in Coulombs
const ELEMENTARY_CHARGE = 1.60217663e-19;

// Permittivity of free space in F/m
const EPSILON_0 = 8.8541878188e-12;

// Relative permittivity (for silicon, typically 11.7, here using 12)
const EPSILON_R = 12;

// Combined permittivity in F/m
const PERMITTIVITY = EPSILON_R * EPSILON_0;

// Unit conversion factor from micrometers to meters
const MICROMETER_TO_METER = 1e-6;
