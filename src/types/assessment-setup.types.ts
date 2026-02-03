export interface AssessmentSetupFormData {
  title: string;
  fullName: string;
  email: string;
  organization: string;
  role: string;
  country: string;
  subRegion: string;
  geographyType: string;
  scope: string;
  gisLink: string;
  ecosystems: string[];
}

export interface AssessmentSetupFormErrors {
  title?: string;
  fullName?: string;
  email?: string;
  organization?: string;
  role?: string;
  country?: string;
  subRegion?: string;
  geographyType?: string;
  scope?: string;
  gisLink?: string;
  ecosystems?: string;
}
