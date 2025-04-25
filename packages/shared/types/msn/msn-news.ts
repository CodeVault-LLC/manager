export interface MsnNewsResponse {
  nextPageUrl: string;
  sections: Section[];
  pulseData: any[];
  isPartial: boolean;
  expirationDateTime: Date;
  authContext: AuthContext;
}

export interface AuthContext {
  muid: string;
  anid: string;
  at: string;
}

export interface Section {
  template: string;
  cards: Card[];
}

export interface Card {
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

export enum Status {
  On = "on",
}

export interface CommentSummary {
  totalCount: number;
}

export interface ExternalVideoFile {
  url: string;
  width?: number;
  height?: number;
  contentType?: ContentType;
  fileSize?: number;
}

export enum ContentType {
  VideoMp4 = "video/mp4",
}

export interface Feed {
  id?: string;
  feedName: string;
  lastFreActionTimestamp: number;
}

export interface Image {
  width: number;
  height: number;
  url: string;
  title: string;
  source: Source;
  caption?: string;
}

export enum Source {
  MSN = "msn",
}

export enum Locale {
  EnUs = "en-us",
}

export interface Provider {
  id: string;
  name: string;
  logoUrl: string;
  profileId: string;
  largeFaviconUrl: string;
  lightThemeSVGLogo?: ThemeSVGLogo;
  darkThemeSVGLogo?: ThemeSVGLogo;
}

export interface ThemeSVGLogo {
  width: number;
  height: number;
  url: string;
}

export interface ReactionSummary {
  totalCount: number;
  subReactionSummaries?: SubReactionSummary[];
}

export interface SubReactionSummary {
  totalCount: number;
  type: SubReactionSummaryType;
}

export enum SubReactionSummaryType {
  Downvote = "downvote",
  Upvote = "upvote",
}

export enum RecoID {
  GrJFaVuh9BmZUymPzci2ZVlPAa = "grJFaVuh9bmZUymPzci2zVlPAa",
}

export enum CardType {
  Article = "article",
  Video = "video",
}

export interface VideoMetadata {
  playTime: number;
  closedCaptions: ClosedCaption[];
}

export interface ClosedCaption {
  locale: Locale;
  href: string;
}
