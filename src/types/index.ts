export interface Name {
  id: number;
  name: string;
  category: string;
  meaning: string;
  score: number;
  domainIdea: string | null;
  domainStatus: string;
  status: string;
  notes: string | null;
  riskNotes: string | null;
  rank: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedName {
  name: string;
  meaning: string;
  category: string;
  score: number;
  riskNotes: string;
  domainIdea: string;
}

export type NamingStyle =
  | 'invented'
  | 'trust'
  | 'visibility'
  | 'operations'
  | 'modern'
  | 'biblical';

export type NameStatus =
  | 'New'
  | 'Like'
  | 'Maybe'
  | 'Reject'
  | 'Shortlist'
  | 'Domain Taken'
  | 'Trademark Concern';

export type DomainStatus =
  | 'Unknown'
  | 'Available'
  | 'Taken'
  | 'Premium'
  | 'Needs Check';

export interface StatsData {
  total: number;
  shortlisted: number;
  liked: number;
  rejected: number;
  averageScore: number;
  recent: Name[];
}

export interface NamesFilter {
  search?: string;
  status?: string;
  category?: string;
  minScore?: number;
  maxScore?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
