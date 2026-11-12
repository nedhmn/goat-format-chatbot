import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils.ts";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-ui text-sm whitespace-nowrap no-underline transition-colors outline-none focus-visible:border-border-bright focus-visible:ring-[3px] focus-visible:ring-brand-bg-strong disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "rounded-pill border border-ink bg-ink text-paper hover:bg-ink-hover",
        secondary:
          "rounded-pill border border-transparent bg-bg-hover text-text-primary hover:bg-bg-hover-strong",
        outline:
          "rounded-pill border border-border-bright bg-transparent text-text-primary hover:bg-bg-hover",
        ghost:
          "rounded-none border border-transparent bg-transparent text-text-primary hover:bg-bg-hover",
      },
      size: {
        sm: "pt-[5.6px] pb-[5.88px] pl-[10.5px] pr-[10.5px]",
        md: "pt-[9px] pb-[9.5px] pl-[18px] pr-[18px]",
        lg: "pt-[13px] pb-[13.5px] pl-[24px] pr-[24px] text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  },
);

function Button({
  className,
  variant = "primary",
  size = "sm",
  render,
  ref,
  ...props
}: useRender.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return useRender({
    defaultTagName: "button",
    render,
    ref,
    props: {
      "data-slot": "button",
      "data-variant": variant,
      "data-size": size,
      ...(render === undefined && { type: "button" as const }),
      ...props,
      className: cn(buttonVariants({ variant, size, className })),
    },
  });
}

export { Button, buttonVariants };
