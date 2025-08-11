"use client";

import "@shopify/polaris/build/esm/styles.css";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { ReactNode } from "react";
import { Shell } from "../components/Shell";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider i18n={enTranslations}>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}