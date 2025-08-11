"use client";

import { useEffect, useState } from "react";
import { Card, Text } from "@shopify/polaris";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { listEntities, moveEntityToStage } from "../../lib/data/entities";
import { listStageColumns } from "../../lib/data/pipelines";

export function EntitiesKanban() {
  const [columns, setColumns] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listStageColumns(), listEntities()]).then(([cols, ents]) => {
      setColumns(cols);
      setEntities(ents);
      setLoading(false);
    });
  }, []);

  if (loading) return <Text>Loading...</Text>;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={async (event) => {
        const { active, over } = event;
        if (!over || !active) return;
        if (active.id === over.id) return;
        // Move entity to new stage
        await moveEntityToStage(active.id as string, over.id as string);
      }}
    >
      <div style={{ display: "flex", gap: 24 }}>
        <SortableContext items={columns} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <Card key={col.id} sectioned style={{ minWidth: 260 }}>
              <Text variant="headingMd" as="h3">
                {col.name}
              </Text>
              <div style={{ minHeight: 100 }}>
                {entities
                  .filter((e) => e.stage_id === col.id)
                  .map((e) => (
                    <Card key={e.id} sectioned>
                      <Text>{e.name}</Text>
                    </Card>
                  ))}
              </div>
            </Card>
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}