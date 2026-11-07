"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui";

export function SubmitButton({
  children,
  pendingLabel = "Se procesează…",
  variant = "primary",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} className={className} disabled={pending}>
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream"
          />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
