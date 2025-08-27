import { ReactNode } from "react";
import clsx from "clsx";

export type TypographyProps = {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "caption"
    | "small"
    | "span"
    | "strong";
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements; // allows overriding the rendered tag
};

/**
 * Typography component for consistent text rendering.
 * - Uses Windows-like system fonts (Segoe UI, Tahoma, Verdana)
 * - Accessible contrast following WCAG 2.1
 * - Centralized text sizing & weights
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  children,
  className,
  as,
}) => {
  const Component =
    as ||
    (variant.startsWith("h")
      ? variant
      : variant === "strong"
      ? "strong"
      : variant === "small"
      ? "small"
      : variant === "span"
      ? "span"
      : "p");

  const baseStyles =
    "font-[Segoe_UI,SegoeUI,Segoe UI Web,Segoe UI Symbol,-apple-system,BlinkMacSystemFont,Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif] text-gray-900 dark:text-gray-100";

  const variantStyles: Record<string, string> = {
    h1: "text-4xl font-bold leading-tight dark:text-white",
    h2: "text-3xl font-semibold leading-snug dark:text-white",
    h3: "text-2xl font-semibold leading-snug dark:text-white",
    h4: "text-xl font-medium leading-snug dark:text-white",
    h5: "text-lg font-medium leading-snug dark:text-white",
    h6: "text-base font-medium leading-snug dark:text-white",
    body: "text-base font-normal leading-relaxed",
    caption: "text-sm text-gray-700 dark:text-gray-100 leading-normal",
    small: "text-xs text-gray-700 dark:text-gray-100 leading-normal",
    strong: "font-semibold text-base text-gray-900 dark:text-white",
    span: "text-sm text-gray-900 dark:text-gray-200 leading-normal",
  };

  return (
    <Component className={clsx(baseStyles, variantStyles[variant], className)}>
      {children}
    </Component>
  );
};
