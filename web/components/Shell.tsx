"use client";

import { TopBar, Frame, Navigation } from "@shopify/polaris";
import { useState } from "react";
import { MapDrawer } from "./map/MapDrawer";
import { useMapDrawerStore } from "./map/mapDrawerStore";
import Link from "next/link";

export default function Shell({ children }: { children: React.ReactNode }) {
  // ...component code...
} = useMapDrawerStore();

  const navigationMarkup = (
    <Navigation location="/">
      <Navigation.Section
        items={[
          {
            label: "Dashboard",
            url: "/app"
          },
          {
            label: "Entities",
            url: "/app/entities"
          }
        ]}
      />
    </Navigation>
  );

  const topBarMarkup = (
    <TopBar
      showNavigationToggle
      onNavigationToggle={() => setMobileNavActive((a) => !a)}
    />
  );

  return (
    <Frame
      navigation={navigationMarkup}
      topBar={topBarMarkup}
      showMobileNavigation={mobileNavActive}
      onNavigationDismiss={() => setMobileNavActive(false)}
    >
      <div style={{ display: "flex", height: "100vh" }}>
        <main
          style={{
            flex: 1,
            padding: 24,
            overflow: "auto",
            background: "#f6f6f7"
          }}
        >
          {children}
        </main>
        <MapDrawer />
      </div>
    </Frame>
  );
}