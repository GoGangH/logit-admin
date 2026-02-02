import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getQdrant, getCollectionName } from "@/lib/qdrant";
import { getServerEnv } from "@/lib/env";

interface ColumnInfo {
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
}

interface ForeignKeyInfo {
  constraint_name: string;
  column_name: string;
  foreign_table: string;
  foreign_column: string;
}

interface IndexInfo {
  indexname: string;
  indexdef: string;
}

interface TableSizeInfo {
  table_name: string;
  row_count: bigint;
  total_size: string;
  table_size: string;
  index_size: string;
}

export async function GET() {
  try {
    const env = await getServerEnv();
    const prisma = getPrisma(env);

    // 1. Get all tables
    const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    // 2. Get columns for all tables
    const columns = await prisma.$queryRawUnsafe<
      (ColumnInfo & { table_name: string })[]
    >(`
      SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // 3. Get foreign keys
    const foreignKeys = await prisma.$queryRawUnsafe<
      (ForeignKeyInfo & { table_name: string })[]
    >(`
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);

    // 4. Get indexes
    const indexes = await prisma.$queryRawUnsafe<
      (IndexInfo & { tablename: string })[]
    >(`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);

    // 5. Get row counts and table sizes
    const tableSizes = await prisma.$queryRawUnsafe<TableSizeInfo[]>(`
      SELECT
        relname AS table_name,
        n_live_tup AS row_count,
        pg_size_pretty(pg_total_relation_size(quote_ident(relname))) AS total_size,
        pg_size_pretty(pg_table_size(quote_ident(relname))) AS table_size,
        pg_size_pretty(pg_indexes_size(quote_ident(relname))) AS index_size
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY relname
    `);

    // 6. Get primary keys
    const primaryKeys = await prisma.$queryRawUnsafe<
      { table_name: string; column_name: string }[]
    >(`
      SELECT
        tc.table_name,
        kcu.column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name
    `);

    // 7. Get total database size
    const dbSize = await prisma.$queryRawUnsafe<{ size: string }[]>(`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS size
    `);

    // Assemble per-table data
    const tableData = tables.map((t) => {
      const sizeInfo = tableSizes.find((s) => s.table_name === t.table_name);
      return {
        name: t.table_name,
        columns: columns
          .filter((c) => c.table_name === t.table_name)
          .map((c) => ({
            name: c.column_name,
            type: c.udt_name,
            dataType: c.data_type,
            nullable: c.is_nullable === "YES",
            default: c.column_default,
            maxLength: c.character_maximum_length,
            isPrimary: primaryKeys.some(
              (pk) =>
                pk.table_name === t.table_name &&
                pk.column_name === c.column_name
            ),
            isForeignKey: foreignKeys.some(
              (fk) =>
                fk.table_name === t.table_name &&
                fk.column_name === c.column_name
            ),
          })),
        foreignKeys: foreignKeys
          .filter((fk) => fk.table_name === t.table_name)
          .map((fk) => ({
            column: fk.column_name,
            referencesTable: fk.foreign_table,
            referencesColumn: fk.foreign_column,
            constraintName: fk.constraint_name,
          })),
        indexes: indexes
          .filter((idx) => idx.tablename === t.table_name)
          .map((idx) => ({
            name: idx.indexname,
            definition: idx.indexdef,
          })),
        rowCount: Number(sizeInfo?.row_count ?? 0),
        totalSize: sizeInfo?.total_size ?? "0 bytes",
        tableSize: sizeInfo?.table_size ?? "0 bytes",
        indexSize: sizeInfo?.index_size ?? "0 bytes",
      };
    });

    // Qdrant info
    let qdrantInfo = null;
    try {
      const qdrantClient = getQdrant(env);
      const collection = getCollectionName(env);
      const info = await qdrantClient.getCollection(collection);
      qdrantInfo = {
        collectionName: collection,
        pointsCount: info.points_count ?? 0,
        vectorsCount: (info as Record<string, unknown>).vectors_count as number ?? 0,
        segmentsCount: info.segments_count ?? 0,
        status: info.status,
        vectorSize: typeof info.config?.params?.vectors === "object" && "size" in info.config.params.vectors
          ? (info.config.params.vectors as { size: number }).size
          : null,
        distance: typeof info.config?.params?.vectors === "object" && "distance" in info.config.params.vectors
          ? (info.config.params.vectors as { distance: string }).distance
          : null,
      };
    } catch {
      // Qdrant unavailable
    }

    return NextResponse.json({
      environment: env,
      databaseSize: dbSize[0]?.size ?? "unknown",
      tables: tableData,
      qdrant: qdrantInfo,
    });
  } catch (error) {
    console.error("Database info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch database info" },
      { status: 500 }
    );
  }
}
