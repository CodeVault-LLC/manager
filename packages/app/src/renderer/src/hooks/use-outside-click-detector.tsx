import React, { useEffect } from "react";

export const useOutsideClickDetector = (
  ref: React.RefObject<HTMLElement> | any,
  callback: () => void,
  useCapture = false
) => {
  const handleClick = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as any)) {
      const preventOutsideClickElement = (event.target as unknown as HTMLElement | undefined)?.closest(
        "[data-prevent-outside-click]"
      );
      if (preventOutsideClickElement) {
        return;
      }
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick, useCapture);
    return () => {
      document.removeEventListener("mousedown", handleClick, useCapture);
    };
  });
};