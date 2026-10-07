"use client";

import React, { createContext, useContext, useState, useCallback, useSyncExternalStore } from "react";
import { siteConfig, CurrencyConfig } from "@/config/config";

interface CurrencyContextType {
  currentCurrency: string;
  setCurrency: (code: string) => void;
  formatPrice: (amountInUSD: number) => string;
  currencyConfig: CurrencyConfig;
  availableCurrencies: Record<string, CurrencyConfig>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredCurrencySnapshot(): string {
  try {
    const val = localStorage.getItem("novva_currency");
    if (val && siteConfig.currencies[val]) {
      return val;
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return "USD";
}

function getServerCurrencySnapshot(): string {
  return "USD";
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const storedCurrency = useSyncExternalStore(
    subscribeToStorage,
    getStoredCurrencySnapshot,
    getServerCurrencySnapshot
  );

  const [activeCurrency, setActiveCurrency] = useState<string>("USD");

  // Keep active currency in sync with storage snapshot
  const currentCurrency = activeCurrency !== "USD" ? activeCurrency : storedCurrency;

  const setCurrency = useCallback((code: string) => {
    if (siteConfig.currencies[code]) {
      setActiveCurrency(code);
      try {
        localStorage.setItem("novva_currency", code);
      } catch {
        // Safe fallback
      }
    }
  }, []);

  const currencyConfig = siteConfig.currencies[currentCurrency] || siteConfig.currencies.USD;

  const formatPrice = useCallback(
    (amountInUSD: number) => {
      if (!amountInUSD || amountInUSD <= 0) return "Price on Request";
      return currencyConfig.format(amountInUSD);
    },
    [currencyConfig]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency,
        formatPrice,
        currencyConfig,
        availableCurrencies: siteConfig.currencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
