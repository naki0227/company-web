import { createContext, useContext } from "react";
import { copy, type Lang } from "./i18n";

export const LangContext = createContext<Lang>("en");

export function useLang() {
  return useContext(LangContext);
}

export function useCopy() {
  return copy[useContext(LangContext)];
}
