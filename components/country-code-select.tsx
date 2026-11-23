"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  countryCodes,
  defaultCountry,
  type CountryCode,
} from "@/lib/country-codes";

export function CountryCodeSelect({
  name = "countryCode",
  defaultValue = defaultCountry,
}: {
  name?: string;
  defaultValue?: CountryCode;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CountryCode>(defaultValue);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countryCodes;
    return countryCodes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <input type="hidden" name={name} value={selected.dial} />
      <input type="hidden" name="country" value={selected.name} />
      <input type="hidden" name="countryIso" value={selected.iso} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((value) => !value);
          setQuery("");
        }}
        className="flex w-full items-center justify-between gap-2 rounded-full border border-[#d8dde8] bg-white px-4 py-3.5 text-left text-[0.95rem] text-ink outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-ink/5"
      >
        <span className="truncate font-medium">{selected.dial}</span>
        <svg
          viewBox="0 0 12 8"
          aria-hidden="true"
          className={`h-2.5 w-3 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1.5 6 6.5 11 1.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Country dialing code"
          className="absolute top-[calc(100%+0.4rem)] left-0 z-30 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-[#d8dde8] bg-white shadow-[0_24px_60px_-24px_rgb(15_23_42_/_0.45)]"
        >
          <div className="border-b border-[#e8ebf2] p-2">
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search country or code"
              className="w-full rounded-xl border border-[#d8dde8] bg-[#f7f8fb] px-3 py-2.5 text-sm outline-none placeholder:text-[#9aa3b5] focus:border-ink/30 focus:bg-white"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted">No countries found</li>
            ) : (
              filtered.map((country) => {
                const active =
                  selected.iso === country.iso && selected.dial === country.dial;
                return (
                  <li key={`${country.iso}-${country.dial}-${country.name}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setSelected(country);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[#f4f5f8] ${
                        active ? "bg-[#f4f5f8] font-semibold" : ""
                      }`}
                    >
                      <span className="truncate text-ink">{country.name}</span>
                      <span className="shrink-0 text-muted">{country.dial}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
