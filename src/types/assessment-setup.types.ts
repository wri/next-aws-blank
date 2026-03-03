export enum TargetGeographyType {
  NATIONAL = 'national',
  SUBNATIONAL = 'subnational',
  LANDSCAPE = 'landscape',
  RESTORATION_SITE = 'restoration-site',
  TRANSBOUNDARY = 'transboundary',
}

export interface AssessmentSetupFormData {
  title: string;
  jobTitle: string;
  fullName: string;
  email: string;
  organization: string;
  role: string;
  country: string;
  countries?: string;
  subRegion: string;
  geographyType: TargetGeographyType;
  scope: string;
  gisUrl?: string;
  ecosystems: string[];
  terms: boolean;
  allowDataSharing: boolean;
  timeHorizon?: string;
  restorationGoals?: string;
  engagementStrategy?: string;
  materials?: string;
}

export interface AssessmentSetupFormErrors {
  title?: string;
  fullName?: string;
  email?: string;
  organization?: string;
  role?: string;
  country?: string;
  subRegion?: string;
  geographyType?: TargetGeographyType;
  scope?: string;
  gisUrl?: string;
  ecosystems?: string;
}
