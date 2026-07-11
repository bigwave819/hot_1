"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowLeft } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center
                    bg-[--bg] px-6 text-center"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 h-125 w-125
                        -translate-x-1/2 -translate-y-1/2
                        rounded-full bg-red-500/3 blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md">
        {/* Icon */}
        <div
          className="mb-8 flex h-20 w-20 items-center justify-center
                        rounded-full bg-red-500/8"
        >
          <RefreshCw size={28} className="text-red-400" />
        </div>

        {/* Heading */}
        <h1
          className="font-display text-[44px] font-light
                       text-[--text-color] leading-none mb-4"
        >
          Something went wrong.
        </h1>

        {/* Gold divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-12 bg-gold/30" />
          <div className="h-1.5 w-1.5 rotate-45 bg-gold/60" />
          <div className="h-px w-12 bg-gold/30" />
        </div>

        <p className="text-[--muted] text-base font-light leading-relaxed mb-3">
          An unexpected error occurred. Our team has been notified.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p
            className="mb-8 rounded-full bg-[--surface]
                        px-4 py-1.5 text-[11px] text-[--muted]"
          >
            Error ID: <span className="font-mono">{error.digest}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-md
                       bg-teal px-6 py-3.5
                       text-[11px] tracking-[0.2em] uppercase
                       font-medium text-white hover:bg-teal-light
                       transition-colors"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-md
                       bg-[--surface] px-6 py-3.5
                       text-[11px] tracking-[0.2em] uppercase
                       font-medium text-[--muted]
                       hover:text-[--text-color] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
        </div>

        <p className="mt-14 font-display text-[20px] font-light text-teal/25">
          Peponi Living Spaces
        </p>
      </div>
    </div>
  );
}
