"use client";

import { useState } from "react";
import { Card, Tabs, Button, Layout, Text } from "@shopify/polaris";
import { useMapDrawerStore } from "../../components/map/mapDrawerStore";
import { EntitiesTable } from "../../components/entities/EntitiesTable";
import { EntitiesGrid } from "../../components/entities/EntitiesGrid";
import { EntitiesKanban } from "../../components/entities/EntitiesKanban";

const VIEWS = ["Table", "Grid", "Kanban"] as const;

export default function AppHomePage() {
  const [selected, setSelected] = useState(0);
  const { toggle } = useMapDrawerStore();

  return (
    <Layout>
      <Layout.Section>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Tabs
              tabs={VIEWS.map((v) => ({ id: v, content: v }))}
              selected={selected}
              onSelect={(i) => setSelected(i)}
            />
            <div style={{ display: "flex", gap: 12 }}>
              <Button onClick={toggle}>Map</Button>
              <Button primary url="/app/entities/new">
                New Entity
              </Button>
            </div>
          </div>
        </Card>
        <div style={{ marginTop: 24 }}>
          {selected === 0 && <EntitiesTable />}
          {selected === 1 && <EntitiesGrid />}
          {selected === 2 && <EntitiesKanban />}
        </div>
      </Layout.Section>
    </Layout>
  );
}