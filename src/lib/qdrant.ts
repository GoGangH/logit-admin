import { QdrantClient } from "@qdrant/js-client-rest";
import type { ServerEnv } from "./prisma";

const clients: Partial<Record<ServerEnv, QdrantClient>> = {};

function createClient(env: ServerEnv): QdrantClient {
  const host =
    env === "production"
      ? process.env.PROD_QDRANT_HOST
      : process.env.DEV_QDRANT_HOST || process.env.QDRANT_HOST || "localhost";
  const port = parseInt(
    (env === "production"
      ? process.env.PROD_QDRANT_PORT
      : process.env.DEV_QDRANT_PORT || process.env.QDRANT_PORT) || "6333"
  );

  return new QdrantClient({ host, port });
}

export function getQdrant(env: ServerEnv = "dev"): QdrantClient {
  if (!clients[env]) {
    clients[env] = createClient(env);
  }
  return clients[env];
}

export function getCollectionName(env: ServerEnv = "dev"): string {
  if (env === "production") {
    return process.env.PROD_QDRANT_COLLECTION_NAME || "logit_embeddings";
  }
  return process.env.DEV_QDRANT_COLLECTION_NAME || process.env.QDRANT_COLLECTION_NAME || "logit_embeddings";
}

// 하위 호환
export const qdrant = getQdrant("dev");
export const QDRANT_COLLECTION = getCollectionName("dev");
