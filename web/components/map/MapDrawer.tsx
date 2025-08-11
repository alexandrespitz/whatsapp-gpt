"use client";

import { useMapDrawerStore } from "./mapDrawerStore";
import clsx from "clsx";
import { MapLibreMap } from "./MapLibreMap";
import { useEffect, useRef } from "react";

export function MapDrawer() {
  const { open, setOpen } = useMapDrawerStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Optionally, focus trap or click-outside to close could go here.
  }, [open]);

  return (
    <div
      ref={drawerRef}
      className={clsx(
        "map-drawer",
        open ? "map-drawer-open" : "map-drawer-closed"
      )}
      style={{
        transition: "right 0.3s cubic-bezier(.4,0,.2,1)",
        position: "fixed",
        top: 0,
        right: open ? 0 : "-48vw",
        height: "100vh",
        width: "48vw",
        minWidth: 400,
        maxWidth: 900,
        background: "#fff",
        boxShadow: open
          ? "0 0 40px rgba(0,0,0,0.18)"
          : "0 0 0 rgba(0,0,0,0)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          height: 48,
          borderBottom: "1px solid #ececec",
          display: "flex",
          alignItems: "center",
          padding: "0 16px"
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 18 }}>Map</span>
        <button
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            fontWeight: 600,
            fontSize: 18,
            cursor: "pointer"
          }}
          aria-label="Close map"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <MapLibreMap />
      </div>
    </div>
  );
}