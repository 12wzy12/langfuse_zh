import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { zhMessages, type ZhMessages } from "./zh";

type Primitive = string | number | boolean | null | undefined;
type TranslationValues = Record<string, Primitive>;

type I18nContextValue = {
  locale: "zh-CN";
  t: (key: string, values?: TranslationValues) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const getMessage = (messages: ZhMessages, key: string): string | undefined => {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, messages);

  return typeof value === "string" ? value : undefined;
};

const interpolate = (message: string, values?: TranslationValues) => {
  if (!values) return message;

  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value ?? "")),
    message,
  );
};

export function I18nProvider({ children }: PropsWithChildren) {
  const t = useCallback((key: string, values?: TranslationValues) => {
    return interpolate(getMessage(zhMessages, key) ?? key, values);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale: "zh-CN",
      t,
    }),
    [t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
