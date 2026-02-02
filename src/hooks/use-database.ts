import { useQuery } from "@tanstack/react-query";

export interface ColumnDetail {
  name: string;
  type: string;
  dataType: string;
  nullable: boolean;
  default: string | null;
  maxLength: number | null;
  isPrimary: boolean;
  isForeignKey: boolean;
}

export interface ForeignKey {
  column: string;
  referencesTable: string;
  referencesColumn: string;
  constraintName: string;
}

export interface IndexDetail {
  name: string;
  definition: string;
}

export interface TableInfo {
  name: string;
  columns: ColumnDetail[];
  foreignKeys: ForeignKey[];
  indexes: IndexDetail[];
  rowCount: number;
  totalSize: string;
  tableSize: string;
  indexSize: string;
}

export interface QdrantInfo {
  collectionName: string;
  pointsCount: number;
  vectorsCount: number;
  segmentsCount: number;
  status: string;
  vectorSize: number | null;
  distance: string | null;
}

export interface DatabaseInfo {
  environment: string;
  databaseSize: string;
  tables: TableInfo[];
  qdrant: QdrantInfo | null;
}

export function useDatabase() {
  return useQuery<DatabaseInfo>({
    queryKey: ["database"],
    queryFn: async () => {
      const res = await fetch("/api/database");
      if (!res.ok) throw new Error("Failed to fetch database info");
      return res.json();
    },
  });
}
