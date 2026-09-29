"use client";

import { useSyncExternalStore } from "react";
import { LANGUAGE_KEY, resolveLanguage, type Language } from "@/lib/i18n";

const changeEvent = "apocalypse-clock-language-change";
let memoryLanguage: Language | null = null;

function readLanguage(): Language {
  if (memoryLanguage !== null) return memoryLanguage;
  try {
    return resolveLanguage(localStorage.getItem(LANGUAGE_KEY));
  } catch {
    return "en";
  }
}

function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === LANGUAGE_KEY || event.key === null) {
      memoryLanguage = null;
      notify();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, notify);
  };
}

function chooseLanguage(language: Language) {
  memoryLanguage = language;
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Selection remains usable when browser storage is disabled.
  }
  window.dispatchEvent(new Event(changeEvent));
}

export function useLanguage() {
  const language = useSyncExternalStore(
    subscribe,
    readLanguage,
    () => "en" as const,
  );
  return [language, chooseLanguage] as const;
}
