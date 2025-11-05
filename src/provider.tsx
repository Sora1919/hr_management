"use client"

import { ThemeProvider } from "./components/ui/theme-provider"
import { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="dashboard-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
