export interface SpecialDate {
  id: string;
  title: string;
  date: string; // ISO string
  type: 'anniversary' | 'first_meet' | 'first_kiss' | 'proposal' | 'custom';
  imageUrl?: string;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  imageUrl?: string;
}

export interface UserProfile {
  partner1Name: string;
  partner2Name: string;
  startDate: string; // ISO string
  coupleImageUrl?: string;
  pin?: string;
  backgroundPreference?: 'personal' | 'curated';
  musicUrl?: string;
  musicPreference?: 'personal' | 'curated';
}

export interface AppState {
  profile: UserProfile;
  specialDates: SpecialDate[];
  memories: Memory[];
}
