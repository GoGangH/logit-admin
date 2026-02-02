"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function UserGrowthChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">신규 가입자 추이 (30일)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ count: { label: "가입자", color: "var(--chart-1)" } }}
          className="h-[250px] w-full"
        >
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => v.slice(5)}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ProjectStatusChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">프로젝트 상태</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            active: { label: "활성", color: "var(--chart-1)" },
            deleted: { label: "삭제됨", color: "var(--chart-2)" },
          }}
          className="mx-auto h-[250px] w-full"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ExperienceTypeChart({
  data,
}: {
  data: { type: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">경험 유형별 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ count: { label: "건수", color: "var(--chart-3)" } }}
          className="h-[250px] w-full"
        >
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" fontSize={12} />
            <YAxis
              dataKey="type"
              type="category"
              width={80}
              fontSize={11}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ExperienceCategoryChart({
  data,
}: {
  data: { category: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">경험 역량별 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ count: { label: "건수", color: "var(--chart-4)" } }}
          className="h-[250px] w-full"
        >
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid />
            <PolarAngleAxis dataKey="category" fontSize={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar
              dataKey="count"
              stroke="var(--chart-4)"
              fill="var(--chart-4)"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function ChatUsageChart({
  data,
}: {
  data: { date: string; user: number; assistant: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">채팅 사용량 (30일)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            user: { label: "사용자", color: "var(--chart-1)" },
            assistant: { label: "어시스턴트", color: "var(--chart-2)" },
          }}
          className="h-[250px] w-full"
        >
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => v.slice(5)}
              fontSize={12}
            />
            <YAxis fontSize={12} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="user"
              stackId="1"
              stroke="var(--chart-1)"
              fill="var(--chart-1)"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="assistant"
              stackId="1"
              stroke="var(--chart-2)"
              fill="var(--chart-2)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
