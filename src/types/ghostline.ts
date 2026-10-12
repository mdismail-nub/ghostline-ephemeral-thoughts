export interface Profile {
  alias: string;
  createdAt: number;
}
export interface Reaction {
  kind: "heart" | "relate";
  count: number;
  selected: boolean;
}
export interface Reply {
  id: string;
  alias: string;
  body: string;
  createdAt: number;
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
}
