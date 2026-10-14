export interface Profile {
  alias: string;
  createdAt: number;
}
export type ReactionKind = "love" | "dislike" | "heart" | "relate";

export interface Reaction {
  kind: ReactionKind;
  count: number;
  selected?: boolean;
  users?: string[];
  baseCount?: number;
}
export interface Reply {
  id: string;
  alias: string;
  body: string;
  createdAt: number;
  likes?: number;
  liked?: boolean;
  likedUsers?: string[];
  baseLikes?: number;
}
export interface Post {
  id: string;
  alias: string;
  body: string;
  topic: string;
  createdAt: number;
  expiresAt: number;
  reactions: Reaction[];
  replies: Reply[];
  tone: string;
  isEdited?: boolean;
  creatorId?: string;
  reportCount?: number;
  reports?: string[];
  deleted?: boolean;
}
export interface Topic {
  name: string;
  description: string;
  tone: string;
  icon: string;
}
export interface Report {
  postId: string;
  reason: string;
  details?: string;
}

export interface PrivacyAlert {
  id: string;
  creatorId: string;
  postId: string;
  postSnippet: string;
  reason: string;
  createdAt: number;
  read: boolean;
}
