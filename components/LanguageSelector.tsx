// ============================================================
// LANGUAGE SELECTOR
// ============================================================
// Selector de idioma en el Header.
// ============================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, Language } from '@/lib/language';

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-neutral-text hover:text-accent-coral transition-colors text-sm"
        aria-label="Cambiar idioma"
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium">{currentLang.code.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 bg-white border border-neutral-border rounded-lg shadow-lg py-1 w-44 z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code as Language);
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-soft transition-colors flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              {language === lang.code && (
                <Check className="w-4 h-4 text-accent-coral" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}