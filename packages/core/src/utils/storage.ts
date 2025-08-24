export const formatStorageLabel = (bytes: number) => {
  const terabytes = bytes / 1024 ** 4;
  const gigabytes = bytes / 1024 ** 3;
  const megabytes = bytes / 1024 ** 2;
  const kilobytes = bytes / 1024;

  if (terabytes > 1) {
    return `${terabytes.toFixed(2)} TB`;
  }

  if (gigabytes > 1) {
    return `${gigabytes.toFixed(2)} GB`;
  }

  if (megabytes > 1) {
    return `${megabytes.toFixed(2)} MB`;
  }

  return `${kilobytes.toFixed(2)} KB`;
};

export const formatStorage = (
  bytes: number,
  type: "storage" | "ram" = "storage"
) => {
  const terabytes = bytes / 1024 ** 4;
  const gigabytes = bytes / 1024 ** 3;
  const megabytes = bytes / 1024 ** 2;
  const kilobytes = bytes / 1024;

  if (type === "ram") {
    if (terabytes > 1) {
      return `${terabytes.toFixed(2)} TiB`;
    }
    if (gigabytes > 1) {
      return `${gigabytes.toFixed(2)} GiB`;
    }
    if (megabytes > 1) {
      return `${megabytes.toFixed(2)} MiB`;
    }
    return `${kilobytes.toFixed(2)} KiB`;
  }

  if (terabytes > 1) {
    return `${terabytes.toFixed(2)}`;
  }
  if (gigabytes > 1) {
    return `${gigabytes.toFixed(2)}`;
  }
  if (megabytes > 1) {
    return `${megabytes.toFixed(2)}`;
  }
  return `${kilobytes.toFixed(2)}`;
};
