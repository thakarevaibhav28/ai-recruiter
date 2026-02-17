import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "../lib/utils";
import React from "react";

export const Dialog = RadixDialog.Root;

export const DialogTrigger = RadixDialog.Trigger;

export const DialogOverlay = ({
  className,
  ...props
}: RadixDialog.DialogOverlayProps) => (
  <RadixDialog.Overlay
    className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-40",
      className
    )}
    {...props}
  />
);

export const DialogContent = ({
  className,
  children,
  ...props
}: RadixDialog.DialogContentProps) => (
  <RadixDialog.Portal>
    <DialogOverlay />
    <RadixDialog.Content
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg max-h-[80vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </RadixDialog.Content>
  </RadixDialog.Portal>
);

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <RadixDialog.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";