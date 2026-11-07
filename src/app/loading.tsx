export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6" role="status" aria-live="polite">
      <div className="h-4 w-32 animate-pulse rounded bg-brand-soft" />
      <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-brand-soft" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-40 animate-pulse rounded-[var(--radius-card)] bg-surface/70" />
        ))}
      </div>
      <span className="sr-only">Se încarcă pagina…</span>
    </div>
  );
}
