export type UserRole =
  | 'MP'
  | 'DISTRICT_AUTHORITY'
  | 'IMPLEMENTING_AGENCY'
  | 'MONITORING_OFFICER'
  | 'MINISTRY'
  | 'ADMIN'
  | 'PUBLIC';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  mpName?: string;
  districtId?: string;
  constituencyId?: string;
  constituencyName?: string;
  agencyId?: string;
}
