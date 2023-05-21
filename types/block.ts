export type Icon =
  | "whatsapp"
  | "github"
  | "instagram"
  | "youtube"
  | "twitter"
  | "discord"
  | "telegram"
  | "linkedin"
  | "nostr"
  | "url"
  | "voluntary";

export type BlockType = "text" | "link";

export interface Block {
  title: string;
  type?: BlockType;
  icon: Icon;
  url: string;
}
