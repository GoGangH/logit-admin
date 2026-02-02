import { useQuery } from "@tanstack/react-query";
import type { StatsData } from "@/types";

export function useStats() {
  return useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
}
