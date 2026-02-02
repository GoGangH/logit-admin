"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Env = "dev" | "production";

export function EnvSwitch() {
  const [env, setEnv] = useState<Env>("dev");
  const [prodConfigured, setProdConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetch("/api/env")
      .then((r) => r.json())
      .then((data) => {
        setEnv(data.env);
        setProdConfigured(data.prodConfigured);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = async (value: string) => {
    const newEnv = value as Env;
    const res = await fetch("/api/env", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ env: newEnv }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "환경 변경에 실패했습니다.");
      return;
    }

    setEnv(newEnv);
    queryClient.invalidateQueries();
    toast.success(
      newEnv === "production"
        ? "Production 환경으로 전환했습니다."
        : "Dev 환경으로 전환했습니다."
    );
  };

  if (loading) return null;

  return (
    <div className="flex items-center gap-2">
      <Select value={env} onValueChange={handleChange}>
        <SelectTrigger className="h-8 w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dev">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Dev
            </div>
          </SelectItem>
          <SelectItem value="production" disabled={!prodConfigured}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Production
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <Badge
        variant={env === "production" ? "destructive" : "secondary"}
        className="text-xs"
      >
        {env === "production" ? "PROD" : "DEV"}
      </Badge>
    </div>
  );
}
