'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, DEFAULT_LOCALE, translate, getStoredLocale, setStoredLocale, localizedField } from './i18n';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    lf: (obj: Record<string, any>, field: string) => string;
    toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
    locale: DEFAULT_LOCALE,
    setLocale: () => {},
    t: (key) => key,
    lf: (obj, field) => obj[field] || '',
    toggleLocale: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setLocaleState(getStoredLocale());
        setMounted(true);
    }, []);

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale);
        setStoredLocale(newLocale);
    }, []);

    const toggleLocale = useCallback(() => {
        const next = locale === 'pt-BR' ? 'en' : 'pt-BR';
        setLocale(next);
    }, [locale, setLocale]);

    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        return translate(locale, key, params);
    }, [locale]);

    const lf = useCallback((obj: Record<string, any>, field: string) => {
        return localizedField(obj, field, locale);
    }, [locale]);

    // Avoid hydration mismatch — render default locale on server
    if (!mounted) {
        return (
            <LanguageContext.Provider value={{
                locale: DEFAULT_LOCALE,
                setLocale,
                t: (key, params) => translate(DEFAULT_LOCALE, key, params),
                lf: (obj, field) => localizedField(obj, field, DEFAULT_LOCALE),
                toggleLocale,
            }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t, lf, toggleLocale }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
