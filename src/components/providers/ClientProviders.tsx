"use client";

import React from "react";
import { AppProvider } from "@/context/AppContext";
import { ToastContainer } from "@/components/ui/ToastContainer";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      {children}
      <ToastContainer />
    </AppProvider>
  );
}
