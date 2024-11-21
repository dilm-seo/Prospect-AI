export interface Prospect {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'pending' | 'contacted' | 'responded' | 'converted';
  lastContact: string;
  notes: string;
  industry?: string;
  position?: string;
  linkedinUrl?: string;
  language: string;
  tags: string[];
  interactions: Interaction[];
  score: number;
}

export interface Interaction {
  id: string;
  date: string;
  type: 'email' | 'message' | 'response' | 'note';
  content: string;
}