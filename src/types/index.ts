export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  groups: string[];
  isAvailable: boolean;
  createdAt: Date;
  lastSeen: Date;
}

export interface Vibe {
  id: string;
  emoji: string;
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  participants: string[];
  createdBy: string;
  createdAt: Date;
}

export interface UserVibe {
  userId: string;
  vibeId: string;
  joinedAt: Date;
}