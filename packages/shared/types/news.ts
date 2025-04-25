export interface INews {
  id: string;
  title: string;
  summary: string;

  category: string;
  keywords: string[];

  homepageUrl: string;

  provider: INewsProvider;
  thumbnail: INewsThumbnail;

  publishedDate: Date;
}

export interface INewsProvider {
  brandId: string;
  brandName: string;
  brandUrl: string;
  brandLogoUrl: string;
}

export interface INewsThumbnail {
  url: string;
  width: number;
  height: number;
  caption?: string;
}
