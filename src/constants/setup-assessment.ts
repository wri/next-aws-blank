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

export const genderOptions = [
  { label: 'Woman', value: 'woman' },
  { label: 'Man', value: 'man' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Intersex', value: 'intersex' },
  { label: 'I prefer not to say', value: 'prefer_not_to_say' },
  { label: "My identity isn't listed", value: 'identity_not_listed' },
];

export const ageRangeOptions = [
  { label: 'Under 25', value: 'under_25' },
  { label: '25–34', value: '25_34' },
  { label: '35–44', value: '35_44' },
  { label: '45–54', value: '45_54' },
  { label: '55–64', value: '55_64' },
  { label: '65+', value: '65_plus' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

export const identityOptions = [
  { value: 'indigenous_peoples', children: 'Indigenous Peoples' },
  { value: 'local_communities', children: 'Local communities' },
  { value: 'both', children: 'Both Indigenous Peoples and Local communities' },
  { value: 'prefer_not_to_say', children: 'Prefer not to say' },
  { value: 'none', children: 'None of the above' },
];
