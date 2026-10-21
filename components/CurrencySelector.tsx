// ============================================================
// CURRENCY SELECTOR
// ============================================================
// Selector de moneda en el Header.
// ============================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { DollarSign, Check } from 'lucide-react';
import { useLanguage, Currency } from '@/lib/language';

const CURRENCIES = [
  { code: 'CAD', label: 'CAD', symbol: 'CA$' },
  { code: 'USD', label: 'USD', symbol: 'US$' },
  { code: 'EUR', label: 'EUR', symbol: '€' },
];

export default function CurrencySelector() {
  const { currency, setCurrency } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentCurrency =
    CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-neutral-text hover:text-accent-coral transition-colors text-sm"
        aria-label="Cambiar moneda"
      >
        <DollarSign className="w-4 h-4" />
        <span className="font-medium">{currentCurrency.code}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-neutral-border rounded-lg shadow-lg py-1 min-w-[120px] z-50">
          {CURRENCIES.map((curr) => (
            <button
              key={curr.code}
              onClick={() => {
                setCurrency(curr.code as Currency);
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-soft transition-colors flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <span>{curr.symbol}</span>
                <span>{curr.label}</span>
              </span>
              {currency === curr.code && (
                <Check className="w-4 h-4 text-accent-coral" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}