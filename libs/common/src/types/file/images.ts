import { IFileAsBuffer } from "./file";

export interface IOutput {
  width: number;
  height: number;
  format: "ico" | "icns" | "png";
  name: string;
  grayscale?: boolean;
  preserve_aspect?: boolean;
}

export interface IConvertedImageData {
  image: IFileAsBuffer;
  outputs: IOutput[];
}

export interface IConvertedImageResponse {
  buffer: number[];
  filename: string;
  mime: "application/zip";
}
