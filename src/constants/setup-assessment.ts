/**
 * Constants for the Setup Assessment form
 */

export const titleOptions = [
  { label: '--', value: '' },
  { label: 'Mr.', value: 'mr' },
  { label: 'Ms.', value: 'ms' },
  { label: 'Mrs.', value: 'mrs' },
  { label: 'Dr.', value: 'dr' },
  { label: 'Prof.', value: 'prof' },
  { label: 'Mx.', value: 'mx' },
];

export const countryOptions = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'Canada', value: 'CA' },
  { label: 'Brazil', value: 'BR' },
  { label: 'Indonesia', value: 'ID' },
  { label: 'Kenya', value: 'KE' },
];

export const geographyTypeOptions = [
  { label: 'National', value: 'national' },
  { label: 'Subnational', value: 'subnational' },
  { label: 'Municipal / District', value: 'municipal_district' },
  { label: 'Transboundary Areas', value: 'transboundary' },
  { label: 'Biome / District', value: 'biome_district' },
  { label: 'Watershed / Catchment', value: 'watershed_catchment' },
  { label: 'Protected Area or Buffer Zone', value: 'protected_area' },
  { label: 'Biological Corridor', value: 'biological_corridor' },
];

export const scopeOptions = [
  { label: 'Target landscape', value: 'target_landscape' },
  { label: 'Time horizon', value: 'time_horizon' },
  { label: 'Restoration Goals', value: 'restoration_goals' },
];

export const ecosystemOptions = [
  {
    id: 'forest',
    label: 'Forest',
    description: 'Tropical, temperate, or boreal forest ecosystems',
  },
  {
    id: 'grassland',
    label: 'Grassland',
    description: 'Savannas, prairies, and steppes',
  },
  {
    id: 'wetland',
    label: 'Wetland',
    description: 'Marshes, swamps, and floodplains',
  },
  {
    id: 'coastal',
    label: 'Coastal',
    description: 'Mangroves, estuaries, and coastal zones',
  },
  {
    id: 'peatland',
    label: 'Peatland',
    description: 'Bogs, fens, and peat swamp forests',
  },
];
