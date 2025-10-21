export interface WebClip {
  id: string;
  title: string;
  url: string;
  content: string;
  excerpt?: string;
  image?: string;
  createdAt: Date;
  tags?: string[];
}

export interface WebClipRequest {
  url: string;
  title?: string;
  content: string;
  excerpt?: string;
  image?: string;

}