"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";

import {
  BASE_UI_PREFS,
  loadUiPrefs,
  persistUiPrefs,
} from "@/utils/uiPrefsStorage";
import type { UiPrefs } from "@/types";

const UI_ACTIONS = Object.freeze({
  hydrate: "hydrate",
  patch: "patch",
  reset: "reset",
} as const);

type UiActionType = keyof typeof UI_ACTIONS;

interface UiAction {
  type: UiActionType;
  payload?: Partial<UiPrefs>;
}

function uiReducer(state: UiPrefs, action: UiAction): UiPrefs {
  switch (action.type) {
    case UI_ACTIONS.hydrate:
      return { ...BASE_UI_PREFS, ...action.payload };
    case UI_ACTIONS.patch:
      return { ...state, ...action.payload };
    case UI_ACTIONS.reset:
      return { ...BASE_UI_PREFS };
    default:
      return state;
  }
}

function syncUiToDom(uiState: UiPrefs): void {
  const root = document.documentElement;
  const body = document.body;
  const darkTheme = uiState.theme === "dark";

  root.classList.toggle("dark", darkTheme);
  root.style.colorScheme = darkTheme ? "dark" : "light";

  body.classList.toggle("layout-wide", uiState.layoutWidth === "wide");
  body.classList.toggle("layout-compact", uiState.compactSpacing);
}

interface UiStateBridgeValue {
  uiState: UiPrefs;
  patchUiState: (delta: Partial<UiPrefs>) => void;
  resetUiState: () => void;
}

const UiStateBridgeContext = createContext<UiStateBridgeValue | null>(null);

export function UiStateBridgeProvider({ children }: { children: ReactNode }) {
  const [uiState, dispatch] = useReducer(uiReducer, BASE_UI_PREFS, () => loadUiPrefs());

  useEffect(() => {
    dispatch({ type: UI_ACTIONS.hydrate, payload: loadUiPrefs() });
  }, []);

  useEffect(() => {
    syncUiToDom(uiState);
    persistUiPrefs(uiState);
  }, [uiState]);

  const value = useMemo<UiStateBridgeValue>(
    () => ({
      uiState,
      patchUiState: (delta: Partial<UiPrefs>) => {
        dispatch({ type: UI_ACTIONS.patch, payload: delta });
      },
      resetUiState: () => {
        dispatch({ type: UI_ACTIONS.reset });
      },
    }),
    [uiState],
  );

  return (
    <UiStateBridgeContext.Provider value={value}>
      {children}
    </UiStateBridgeContext.Provider>
  );
}

export function useUiStateBridge(): UiStateBridgeValue {
  const ctx = useContext(UiStateBridgeContext);
  if (!ctx) {
    throw new Error("useUiStateBridge must be used within a UiStateBridgeProvider");
  }
  return ctx;
}
