"use client";
import React from 'react';
import { ConvexProvider, ConvexReactClient } from "convex/react"; // Make sure these are imported
import { ThemeProvider } from "next-themes";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

const Provider = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </ThemeProvider>
  );
};

export default Provider;
