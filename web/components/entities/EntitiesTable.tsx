"use client";

import { useEffect, useState } from "react";
import { Card, DataTable, Spinner } from "@shopify/polaris";
import { listEntities } from "../../lib/data/entities";

export function EntitiesTable() {
  // For MVP, just fetch and show minimal entity data.
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEntities().then((rows) => {
      setEntities(rows);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner accessibilityLabel="Loading entities" size="large" />;

  return (
    <Card>
      <DataTable
        columnContentTypes={["text", "text", "text"]}
        headings={["Name", "Type", "Status"]}
        rows={entities.map((e) => [e.name, e.type_name || "", e.status || ""])}
      />
    </Card>
  );
}