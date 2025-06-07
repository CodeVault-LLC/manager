export interface MsnNewsResponse {
  nextPageUrl: string;
  sections: Section[];
  pulseData: any[];
  isPartial: boolean;
  expirationDateTime: Date;
  authContext: AuthContext;
}

interface AuthContext {
  muid: string;
  anid: string;
  at: string;
}

interface Section {
  template: string;
  cards: Card[];
}

interface Card {
  id: string;
  type: CardType;
  title: string;
  abstract: string;
  url: string;
  locale: Locale;
  isLocalContent: boolean;
  galleryItemCount: number;
  publishedDateTime: Date;
  isFeatured: boolean;
  images: Image[];
  provider: Provider;
  category: string;
  reactionSummary: ReactionSummary;
  reactionStatus: Status;
  commentSummary: CommentSummary;
  commentStatus: Status;
  recoDocMetadata: null;
  feed: Feed;
  isWorkNewsContent: boolean;
  recoId: RecoID;
  source: Source;
  videoMetadata?: VideoMetadata;
  externalVideoFiles?: ExternalVideoFile[];
  readTimeMin?: number;
}

enum Status {
  On = "on",
}

interface CommentSummary {
  totalCount: number;
}

interface ExternalVideoFile {
  url: string;
  width?: number;
  height?: number;
  contentType?: ContentType;
  fileSize?: number;
}

enum ContentType {
  VideoMp4 = "video/mp4",
}

interface Feed {
  id?: string;
  feedName: string;
  lastFreActionTimestamp: number;
}

interface Image {
  width: number;
  height: number;
  url: string;
  title: string;
  source: Source;
  caption?: string;
}

enum Source {
  MSN = "msn",
}

enum Locale {
  EnUs = "en-us",
}

interface Provider {
  id: string;
  name: string;
  logoUrl: string;
  profileId: string;
  largeFaviconUrl: string;
  lightThemeSVGLogo?: ThemeSVGLogo;
  darkThemeSVGLogo?: ThemeSVGLogo;
}

interface ThemeSVGLogo {
  width: number;
  height: number;
  url: string;
}

interface ReactionSummary {
  totalCount: number;
  subReactionSummaries?: SubReactionSummary[];
}

interface SubReactionSummary {
  totalCount: number;
  type: SubReactionSummaryType;
}

enum SubReactionSummaryType {
  Downvote = "downvote",
  Upvote = "upvote",
}

enum RecoID {
  GrJFaVuh9BmZUymPzci2ZVlPAa = "grJFaVuh9bmZUymPzci2zVlPAa",
}

enum CardType {
  Article = "article",
  Video = "video",
}

interface VideoMetadata {
  playTime: number;
  closedCaptions: ClosedCaption[];
}

interface ClosedCaption {
  locale: Locale;
  href: string;
}
