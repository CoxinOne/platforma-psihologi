"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ro">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f6f3ec", color: "#1c2a27" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px" }}>
          <h1 style={{ fontSize: 30, marginBottom: 12 }}>Aplicația nu a putut fi încărcată</h1>
          <p style={{ color: "#5e6c67", marginBottom: 24 }}>
            A apărut o eroare la nivelul aplicației. Reîncarcă pagina sau revino mai târziu.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#1f4f49",
                color: "white",
                border: 0,
                borderRadius: 999,
                padding: "10px 20px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reîncearcă
            </button>
            <Link
              href="/"
              className={buttonClasses("secondary", "md")}
              style={{ textDecoration: "none" }}
            >
              Pagina principală
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
