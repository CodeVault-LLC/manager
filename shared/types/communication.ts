import { TErrorInfo } from "helpers";

export type TCommunicationResponse<TData> =
  | { data: TData; error: never }
  | { error: TErrorInfo; data?: never };
