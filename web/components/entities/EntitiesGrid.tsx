"use client";

import { useEffect, useState } from "react";
import { Card, Text } from "@shopify/polaris";
import { listEntities } from "../../lib/data/entities";

export function EntitiesGrid() {
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEntities().then((rows) => {
      setEntities(rows);
      setLoading(false);
    });
  }, []);

  if (loading) return <Text>Loading...</Text>;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      {entities.map((e) => (
        <Card key={e.id} sectioned style={{ minWidth: 240, maxWidth: 340 }}>
          <Text variant="headingMd" as="h3">
            {e.name}
          </Text>
          <div>{e.type_name}</div>
          <div>Status: {e.status || "-"}</div>
        </Card>
      ))}
    </div>
  );
}