import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn, initials } from "@/lib/utils";
import { publicEnv } from "@/lib/public-env";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-brand text-cream hover:bg-brand-strong",
    secondary: "border border-brand-line bg-surface text-brand hover:bg-brand-soft",
    ghost: "text-brand hover:bg-brand-soft",
    danger: "bg-danger text-cream hover:bg-danger-strong",
    subtle: "bg-brand-soft text-brand-strong hover:bg-beige",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: "px-3.5 py-2 text-sm",
    md: "px-5 py-2.5 text-[0.95rem]",
    lg: "px-6 py-3 text-base",
  };
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-brand-line bg-surface p-6 shadow-[0_1px_0_rgba(81,69,60,0.04),0_20px_44px_-34px_rgba(81,69,60,0.32)]",
        className,
      )}
      {...props}
    />
  );
}

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "sand";

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  const tones: Record<BadgeTone, string> = {
    neutral: "bg-brand-soft text-muted",
    brand: "bg-brand-soft text-brand-strong",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    sand: "bg-sand text-cocoa",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const tones = {
    info: "border-brand-line bg-brand-soft/60 text-brand-strong",
    success: "border-success/25 bg-success-soft text-success",
    warning: "border-warning/25 bg-warning-soft text-warning",
    danger: "border-danger/25 bg-danger-soft text-danger",
  } as const;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("rounded-2xl border px-4 py-3 text-sm", tones[tone], className)}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={cn(title && "mt-1")}>{children}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-brand-line bg-surface/70 px-6 py-12 text-center">
      {icon ? <div className="mx-auto mb-4 text-brand">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Avatar({
  name,
  photoPath,
  size = 56,
  className,
}: {
  name: string;
  photoPath?: string | null;
  size?: number;
  className?: string;
}) {
  const url =
    photoPath && publicEnv.supabaseUrl
      ? `${publicEnv.supabaseUrl}/storage/v1/object/public/avatars/${photoPath}`
      : null;

  if (url) {
    return (
      <Image
        src={url}
        alt={`Fotografia lui ${name}`}
        width={size}
        height={size}
        className={cn("rounded-full border border-brand-line object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-brand-soft font-display font-semibold text-brand",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials(name) || "PS"}
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const describedBy =
    [hint ? `${htmlFor}-hint` : null, error ? `${htmlFor}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        "aria-describedby": describedBy,
        ...(error ? { "aria-invalid": true } : {}),
      })
    : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
        {!required ? <span className="ml-2 text-xs font-normal text-muted">(opțional)</span> : null}
      </label>
      {control}
      {hint ? (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function inputClasses(hasError?: boolean): string {
  return cn(
    "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-[0.95rem] text-ink shadow-[inset_0_1px_2px_rgba(81,69,60,0.05)] placeholder:text-muted",
    "focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10",
    hasError ? "border-danger" : "border-line",
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-[1.02rem] text-muted">{description}</p> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-semibold text-ink sm:text-[2.6rem]">{title}</h1>
        {description ? <p className="mt-3 text-muted">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </>
  );
  return href ? (
    <Link
      href={href}
      className="block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand-line hover:bg-brand-soft/40"
    >
      {content}
    </Link>
  ) : (
    <div className="rounded-2xl border border-line bg-surface p-5">{content}</div>
  );
}

export function Spinner({ label = "Se încarcă" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-muted">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-brand-line border-t-brand"
      />
      {label}
    </span>
  );
}
