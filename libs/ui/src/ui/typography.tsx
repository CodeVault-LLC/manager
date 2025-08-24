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
    "font-[Segoe_UI,SegoeUI,Segoe UI Web,Segoe UI Symbol,-apple-system,BlinkMacSystemFont,Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif] text-gray-900";

  const variantStyles: Record<string, string> = {
    h1: "text-4xl font-bold leading-tight",
    h2: "text-3xl font-semibold leading-snug",
    h3: "text-2xl font-semibold leading-snug",
    h4: "text-xl font-medium leading-snug",
    h5: "text-lg font-medium leading-snug",
    h6: "text-base font-medium leading-snug",
    body: "text-base font-normal leading-relaxed",
    caption: "text-sm text-gray-700 leading-normal",
    small: "text-xs text-gray-700 leading-normal",
    strong: "font-semibold text-base text-gray-900",
    span: "text-sm text-gray-900 leading-normal",
  };

  return (
    <Component className={clsx(baseStyles, variantStyles[variant], className)}>
      {children}
    </Component>
  );
};
