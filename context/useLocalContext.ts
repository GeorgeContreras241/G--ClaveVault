"use client";

import { useContext } from "react";
import { LocalContext } from "@/context/localProvider";
import type { LocalContextValue } from "@/types";

export function useLocalContext(): LocalContextValue {
  const context = useContext(LocalContext);
  if (!context) {
    throw new Error("useLocalContext must be used within LocalProvider");
  }
  return context;
}


export const useOnlineContext = () => {
  return false
}