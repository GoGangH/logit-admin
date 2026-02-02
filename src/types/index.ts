export type ExperienceType =
  | "아르바이트"
  | "인턴"
  | "정규직"
  | "계약직"
  | "봉사 활동"
  | "수상경력"
  | "동아리 활동"
  | "연구 활동"
  | "군복무"
  | "개인 활동";

export type ExperienceCategory =
  | "고객 가치 지향"
  | "기술적 전문성"
  | "협력적 소통"
  | "주도적 실행력"
  | "논리적 분석력"
  | "창의적 문제해결"
  | "유연한 적응력"
  | "끈기있는 책임감";

export interface Experience {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  experience_type: ExperienceType;
  situation: string;
  task: string;
  action: string;
  result: string;
  category: ExperienceCategory;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface ExperienceWithUser extends Experience {
  user_email?: string;
  user_name?: string;
}

export interface StatsData {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalProjects: number;
  totalExperiences: number;
  totalChats: number;
  userGrowth: { date: string; count: number }[];
  projectStatus: { name: string; value: number }[];
  experienceTypes: { type: string; count: number }[];
  experienceCategories: { category: string; count: number }[];
  chatUsage: { date: string; user: number; assistant: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
