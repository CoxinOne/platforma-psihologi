"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ro">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f6f1e9", color: "#51453c" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px" }}>
          <h1 style={{ fontSize: 30, marginBottom: 12 }}>Aplicația nu a putut fi încărcată</h1>
          <p style={{ color: "#6e6255", marginBottom: 24 }}>
            A apărut o eroare la nivelul aplicației. Reîncarcă pagina sau revino mai târziu.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#5f684a",
                color: "#f6f1e9",
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
