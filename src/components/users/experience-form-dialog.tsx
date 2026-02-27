"use client";

import { useState, useEffect } from "react";
import { Experience, ExperienceFormat, ExperienceType, ExperienceCategory } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPERIENCE_TYPES: ExperienceType[] = [
  "아르바이트", "인턴", "정규직", "계약직", "봉사 활동",
  "수상경력", "동아리 활동", "연구 활동", "군복무", "개인 활동",
];

const CATEGORIES: ExperienceCategory[] = [
  "고객 가치 지향", "기술적 전문성", "협력적 소통", "주도적 실행력",
  "논리적 분석력", "창의적 문제해결", "유연한 적응력", "끈기있는 책임감",
];

type FormData = {
  title: string;
  experience_type: ExperienceType;
  category: ExperienceCategory;
  format: ExperienceFormat;
  start_date: string;
  end_date: string;
  tags: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  problem: string;
  solution: string;
  impact: string;
  content: string;
};

const defaultForm: FormData = {
  title: "",
  experience_type: "개인 활동",
  category: "주도적 실행력",
  format: "STAR",
  start_date: "",
  end_date: "",
  tags: "",
  situation: "",
  task: "",
  action: "",
  result: "",
  problem: "",
  solution: "",
  impact: "",
  content: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience?: Experience | null;
  userId: string;
  onSuccess: () => void;
}

export function ExperienceFormDialog({ open, onOpenChange, experience, userId, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);

  const isEdit = !!experience;

  useEffect(() => {
    if (open) {
      if (experience) {
        setForm({
          title: experience.title ?? "",
          experience_type: experience.experience_type ?? "개인 활동",
          category: experience.category ?? "주도적 실행력",
          format: experience.format ?? "STAR",
          start_date: experience.start_date ?? "",
          end_date: experience.end_date ?? "",
          tags: experience.tags ?? "",
          situation: experience.situation ?? "",
          task: experience.task ?? "",
          action: experience.action ?? "",
          result: experience.result ?? "",
          problem: experience.problem ?? "",
          solution: experience.solution ?? "",
          impact: experience.impact ?? "",
          content: experience.content ?? "",
        });
      } else {
        setForm(defaultForm);
      }
    }
  }, [open, experience]);

  const set = (key: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const payload: Record<string, string> = {
        title: form.title,
        experience_type: form.experience_type,
        category: form.category,
        format: form.format,
        start_date: form.start_date,
        end_date: form.end_date,
        tags: form.tags,
      };

      if (form.format === "STAR") {
        payload.situation = form.situation;
        payload.task = form.task;
        payload.action = form.action;
        payload.result = form.result;
      } else if (form.format === "PSI") {
        payload.problem = form.problem;
        payload.solution = form.solution;
        payload.impact = form.impact;
      } else {
        payload.content = form.content;
      }

      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/experiences/${experience!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/users/${userId}/experiences`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error();
      onSuccess();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "경험 수정" : "경험 추가"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 기본 정보 */}
          <div className="space-y-2">
            <Label>제목</Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="경험 제목"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>경험 유형</Label>
              <Select value={form.experience_type} onValueChange={(v) => set("experience_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>형식</Label>
              <Select value={form.format} onValueChange={(v) => set("format", v as ExperienceFormat)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STAR">STAR</SelectItem>
                  <SelectItem value="PSI">PSI</SelectItem>
                  <SelectItem value="FREE">자유양식</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>시작일</Label>
              <Input
                type="month"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>종료일</Label>
              <Input
                type="month"
                value={form.end_date}
                onChange={(e) => set("end_date", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>태그</Label>
            <Input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="쉼표로 구분 (예: 리더십, 문제해결)"
            />
          </div>

          {/* 형식별 필드 */}
          {form.format === "STAR" && (
            <div className="space-y-3 pt-2 border-t">
              {(["situation", "task", "action", "result"] as const).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label className="capitalize">{key === "situation" ? "Situation" : key === "task" ? "Task" : key === "action" ? "Action" : "Result"}</Label>
                  <Textarea
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {form.format === "PSI" && (
            <div className="space-y-3 pt-2 border-t">
              {(["problem", "solution", "impact"] as const).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label>{key === "problem" ? "Problem" : key === "solution" ? "Solution" : "Impact"}</Label>
                  <Textarea
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {form.format === "FREE" && (
            <div className="space-y-1.5 pt-2 border-t">
              <Label>내용</Label>
              <Textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={handleSubmit} disabled={loading || !form.title.trim()}>
            {loading ? "저장 중..." : isEdit ? "수정" : "추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
