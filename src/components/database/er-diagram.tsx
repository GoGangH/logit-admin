"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { TableInfo } from "@/hooks/use-database";

function TableNode({ data }: NodeProps) {
  const { label, columns, rowCount } = data as {
    label: string;
    columns: { name: string; type: string; isPrimary: boolean; isForeignKey: boolean }[];
    rowCount: number;
  };

  return (
    <div className="min-w-[220px] rounded-lg border bg-card shadow-md overflow-hidden">
      <div className="bg-primary px-3 py-2 text-primary-foreground">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold">{label}</span>
          <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px]">
            {rowCount.toLocaleString()} rows
          </span>
        </div>
      </div>
      <div className="divide-y">
        {columns.map((col) => (
          <div
            key={col.name}
            className="relative flex items-center gap-2 px-3 py-1.5 text-xs"
          >
            {col.isForeignKey && (
              <Handle
                type="source"
                position={Position.Right}
                id={`${col.name}-source`}
                className="!w-2 !h-2 !bg-orange-500 !border-orange-600"
              />
            )}
            {col.isPrimary && (
              <Handle
                type="target"
                position={Position.Left}
                id={`${col.name}-target`}
                className="!w-2 !h-2 !bg-primary !border-primary"
              />
            )}
            <span className="shrink-0">
              {col.isPrimary && (
                <span className="mr-1 inline-block rounded bg-primary/10 px-1 py-0.5 text-[9px] font-bold text-primary">
                  PK
                </span>
              )}
              {col.isForeignKey && (
                <span className="mr-1 inline-block rounded bg-orange-100 dark:bg-orange-900 px-1 py-0.5 text-[9px] font-bold text-orange-600 dark:text-orange-400">
                  FK
                </span>
              )}
            </span>
            <span className="flex-1 font-mono truncate">{col.name}</span>
            <span className="shrink-0 text-muted-foreground font-mono">
              {col.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = { tableNode: TableNode };

// Layout positions for known logit tables
const tablePositions: Record<string, { x: number; y: number }> = {
  users: { x: 0, y: 150 },
  projects: { x: 350, y: 0 },
  questions: { x: 700, y: 0 },
  chats: { x: 700, y: 350 },
};

export function ERDiagram({ tables }: { tables: TableInfo[] }) {
  const initialNodes = useMemo<Node[]>(() => {
    return tables.map((table, i) => {
      const pos = tablePositions[table.name] || {
        x: (i % 3) * 380,
        y: Math.floor(i / 3) * 400,
      };
      return {
        id: table.name,
        type: "tableNode",
        position: pos,
        data: {
          label: table.name,
          columns: table.columns.map((c) => ({
            name: c.name,
            type: c.type,
            isPrimary: c.isPrimary,
            isForeignKey: c.isForeignKey,
          })),
          rowCount: table.rowCount,
        },
      };
    });
  }, [tables]);

  const initialEdges = useMemo<Edge[]>(() => {
    const edges: Edge[] = [];
    for (const table of tables) {
      for (const fk of table.foreignKeys) {
        edges.push({
          id: `${table.name}-${fk.column}-${fk.referencesTable}`,
          source: table.name,
          target: fk.referencesTable,
          sourceHandle: `${fk.column}-source`,
          targetHandle: `${fk.referencesColumn}-target`,
          type: "smoothstep",
          animated: true,
          style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
          label: fk.column,
          labelStyle: { fontSize: 10, fill: "hsl(var(--muted-foreground))" },
          labelBgStyle: {
            fill: "hsl(var(--card))",
            fillOpacity: 0.9,
          },
        });
      }
    }
    return edges;
  }, [tables]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback(() => {}, []);

  return (
    <div className="h-[500px] w-full rounded-lg border bg-muted/30">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background gap={16} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
