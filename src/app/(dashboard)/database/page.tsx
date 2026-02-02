"use client";

import { useState, useMemo } from "react";
import { useDatabase } from "@/hooks/use-database";
import type { TableInfo } from "@/hooks/use-database";
import { ERDiagram } from "@/components/database/er-diagram";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Table2,
  HardDrive,
  Key,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Layers,
  Hash,
  Box,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Treemap,
} from "recharts";

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(199, 89%, 48%)",
  "hsl(316, 73%, 52%)",
  "hsl(25, 95%, 53%)",
];

function TypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    uuid: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    varchar: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
    text: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300",
    bool: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    int4: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    int8: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
    timestamptz: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
    date: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
    _varchar: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300",
  };

  const color =
    colorMap[type] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-mono font-medium ${color}`}
    >
      {type}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {sub && (
              <p className="text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TableCard({
  table,
  allTables,
}: {
  table: TableInfo;
  allTables: TableInfo[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [showIndexes, setShowIndexes] = useState(false);

  const referencedBy = allTables
    .filter((t) =>
      t.foreignKeys.some((fk) => fk.referencesTable === table.name)
    )
    .map((t) => ({
      table: t.name,
      columns: t.foreignKeys
        .filter((fk) => fk.referencesTable === table.name)
        .map((fk) => fk.column),
    }));

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Table2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-mono">{table.name}</CardTitle>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {table.rowCount.toLocaleString()} rows
                </span>
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {table.totalSize}
                </span>
                <span>{table.columns.length} columns</span>
                {table.foreignKeys.length > 0 && (
                  <span className="flex items-center gap-1">
                    <GitBranch className="h-3 w-3" />
                    {table.foreignKeys.length} FK
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Column table */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Column
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Nullable
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Key
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Default
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {table.columns.map((col) => (
                  <tr
                    key={col.name}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2 font-mono text-xs font-medium">
                      {col.name}
                    </td>
                    <td className="px-3 py-2">
                      <TypeBadge type={col.type} />
                      {col.maxLength && (
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          ({col.maxLength})
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {col.nullable ? (
                        <span className="text-muted-foreground/60">NULL</span>
                      ) : (
                        <span className="font-medium">NOT NULL</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {col.isPrimary && (
                          <Badge className="text-[9px] px-1.5 py-0 h-4 bg-primary/90">
                            PK
                          </Badge>
                        )}
                        {col.isForeignKey && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 h-4 border-orange-400 text-orange-600 dark:text-orange-400"
                          >
                            FK
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground max-w-[200px] truncate">
                      {col.default || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Relationships */}
          {(table.foreignKeys.length > 0 || referencedBy.length > 0) && (
            <div className="rounded-lg border p-3 space-y-3 bg-muted/20">
              {table.foreignKeys.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    References
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {table.foreignKeys.map((fk) => (
                      <div
                        key={fk.constraintName}
                        className="flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs shadow-sm"
                      >
                        <span className="font-mono font-medium">
                          {fk.column}
                        </span>
                        <ArrowRight className="h-3 w-3 text-orange-500" />
                        <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
                          {fk.referencesTable}.{fk.referencesColumn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {referencedBy.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    Referenced By
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {referencedBy.map((ref) => (
                      <Badge
                        key={ref.table}
                        variant="secondary"
                        className="text-xs font-mono py-1 px-2"
                      >
                        {ref.table}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Indexes */}
          {table.indexes.length > 0 && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs gap-1"
                onClick={() => setShowIndexes(!showIndexes)}
              >
                {showIndexes ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                Indexes ({table.indexes.length})
              </Button>
              {showIndexes && (
                <div className="mt-2 space-y-1.5">
                  {table.indexes.map((idx) => (
                    <div
                      key={idx.name}
                      className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-[10px] text-muted-foreground leading-relaxed"
                    >
                      {idx.definition}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Size breakdown */}
          <div className="flex gap-6 text-xs text-muted-foreground border-t pt-3">
            <span>
              Table: <strong className="text-foreground">{table.tableSize}</strong>
            </span>
            <span>
              Index: <strong className="text-foreground">{table.indexSize}</strong>
            </span>
            <span>
              Total: <strong className="text-foreground">{table.totalSize}</strong>
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// Custom treemap content for table sizes
function TreemapContent(props: Record<string, unknown>) {
  const { x, y, width, height, name, rowCount, index } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    rowCount: number;
    index: number;
  };
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill={COLORS[index % COLORS.length]}
        fillOpacity={0.85}
        stroke="hsl(var(--card))"
        strokeWidth={2}
      />
      {width > 60 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
            fontFamily="monospace"
          >
            {name}
          </text>
          {height > 45 && (
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="rgba(255,255,255,0.8)"
              fontSize={10}
            >
              {rowCount?.toLocaleString()} rows
            </text>
          )}
        </>
      )}
    </g>
  );
}

export default function DatabasePage() {
  const { data, isLoading } = useDatabase();

  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data.tables]
      .sort((a, b) => b.rowCount - a.rowCount)
      .map((t) => ({ name: t.name, rows: t.rowCount }));
  }, [data]);

  const treemapData = useMemo(() => {
    if (!data) return [];
    return data.tables.map((t) => ({
      name: t.name,
      size: Math.max(t.rowCount, 1),
      rowCount: t.rowCount,
    }));
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="데이터베이스" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  const totalRows = data.tables.reduce((sum, t) => sum + t.rowCount, 0);
  const totalColumns = data.tables.reduce(
    (sum, t) => sum + t.columns.length,
    0
  );
  const totalIndexes = data.tables.reduce(
    (sum, t) => sum + t.indexes.length,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="데이터베이스"
        description={`${data.environment.toUpperCase()} 환경 DB 테이블 구조 및 상태`}
      />

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Database}
          label="DB 크기"
          value={data.databaseSize}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Table2}
          label="테이블"
          value={`${data.tables.length}개`}
          sub={`${totalColumns} columns`}
          color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Layers}
          label="전체 레코드"
          value={totalRows.toLocaleString()}
          color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          icon={Key}
          label="인덱스"
          value={`${totalIndexes}개`}
          color="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      <Tabs defaultValue="diagram" className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="diagram" className="gap-1.5">
            <GitBranch className="h-3.5 w-3.5" />
            ER 다이어그램
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            테이블 통계
          </TabsTrigger>
          <TabsTrigger value="tables" className="gap-1.5">
            <Table2 className="h-3.5 w-3.5" />
            테이블 상세
          </TabsTrigger>
          {data.qdrant && (
            <TabsTrigger value="qdrant" className="gap-1.5">
              <Box className="h-3.5 w-3.5" />
              Qdrant
            </TabsTrigger>
          )}
        </TabsList>

        {/* ER Diagram */}
        <TabsContent value="diagram">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Entity-Relationship 다이어그램
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                테이블 노드를 드래그하여 이동할 수 있습니다. 화살표는 FK
                관계를 나타냅니다.
              </p>
            </CardHeader>
            <CardContent>
              <ERDiagram tables={data.tables} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts */}
        <TabsContent value="charts" className="space-y-4">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                테이블별 레코드 수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      fontFamily="monospace"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      fontSize={11}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [
                        value.toLocaleString(),
                        "Rows",
                      ]}
                    />
                    <Bar dataKey="rows" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          fillOpacity={0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Treemap */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                테이블 크기 비율 (Treemap)
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                레코드 수 기준으로 테이블 크기를 시각적으로 비교합니다
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    nameKey="name"
                    content={<TreemapContent />}
                  />
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Table size comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                테이블 디스크 사용량
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.tables
                  .sort((a, b) => b.rowCount - a.rowCount)
                  .map((table, idx) => {
                    const maxCount = Math.max(
                      ...data.tables.map((t) => t.rowCount),
                      1
                    );
                    const pct = (table.rowCount / maxCount) * 100;
                    return (
                      <div
                        key={table.name}
                        className="flex items-center gap-3"
                      >
                        <span className="w-24 text-xs font-mono text-right shrink-0 text-muted-foreground">
                          {table.name}
                        </span>
                        <div className="flex-1 h-8 bg-muted/50 rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, 3)}%`,
                              backgroundColor:
                                COLORS[idx % COLORS.length],
                              opacity: 0.85,
                            }}
                          >
                            {pct > 20 && (
                              <span className="text-xs text-white font-medium">
                                {table.rowCount.toLocaleString()} rows
                              </span>
                            )}
                          </div>
                        </div>
                        {pct <= 20 && (
                          <span className="text-xs text-muted-foreground shrink-0 w-20">
                            {table.rowCount.toLocaleString()} rows
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground shrink-0 w-16 text-right">
                          {table.totalSize}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Table Details */}
        <TabsContent value="tables" className="space-y-4">
          {data.tables.map((table) => (
            <TableCard
              key={table.name}
              table={table}
              allTables={data.tables}
            />
          ))}
        </TabsContent>

        {/* Qdrant */}
        {data.qdrant && (
          <TabsContent value="qdrant">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5">
                    <Box className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Qdrant Vector DB</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Collection:{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {data.qdrant.collectionName}
                      </code>
                    </p>
                  </div>
                  <Badge
                    variant={
                      data.qdrant.status === "green" ? "default" : "secondary"
                    }
                    className="ml-auto"
                  >
                    {data.qdrant.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs text-muted-foreground">Points</p>
                      <p className="text-2xl font-bold tracking-tight">
                        {data.qdrant.pointsCount.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs text-muted-foreground">Vectors</p>
                      <p className="text-2xl font-bold tracking-tight">
                        {data.qdrant.vectorsCount?.toLocaleString() ?? "-"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs text-muted-foreground">
                        Vector Size
                      </p>
                      <p className="text-2xl font-bold tracking-tight">
                        {data.qdrant.vectorSize ?? "-"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs text-muted-foreground">
                        Distance Metric
                      </p>
                      <p className="text-2xl font-bold tracking-tight">
                        {data.qdrant.distance ?? "-"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4 rounded-lg border p-4 bg-muted/20">
                  <h4 className="text-sm font-semibold mb-2">Payload Fields (Experience)</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      "user_id",
                      "title",
                      "experience_type",
                      "category",
                      "situation",
                      "task",
                      "action",
                      "result",
                      "tags",
                      "start_date",
                      "end_date",
                      "created_at",
                      "updated_at",
                    ].map((field) => (
                      <div
                        key={field}
                        className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-xs"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                        <span className="font-mono">{field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
