import citiesAndStates from './citiesAndState.json';


/**
 * Returns an array of all state names from the `citiesAndStates` object.
 *
 * @returns {string[]} Array of state names.
 */
export function getAllStates() {
  return Object.keys(citiesAndStates);
}

/**
 * Returns an array of cities for a given state name.
 *
 * @param {string} stateName - The name of the state to retrieve cities for.
 * @returns {string[]} An array of city names corresponding to the given state, or an empty array if the state is not found.
 */
export function getCitiesByState(stateName) {
  return citiesAndStates[stateName] || [];
}
