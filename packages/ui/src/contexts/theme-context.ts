import { createContext } from "react";
import { ThemeContextValue } from "../types/theme";

export const ThemeContext = createContext<ThemeContextValue | null>(null)
