"use client";

import { createContext, useContext } from "react";

const ActionCloseContext = createContext<(() => void) | null>(null);

export const ActionCloseProvider = ActionCloseContext.Provider;

export function useActionClose(): (() => void) | null {
	return useContext(ActionCloseContext);
}
