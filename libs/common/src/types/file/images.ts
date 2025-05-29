import { IFileAsBuffer } from "./file";

export interface IOutput {
  width: number;
  height: number;
  format: "ico" | "icns" | "png";
  name: string;
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
