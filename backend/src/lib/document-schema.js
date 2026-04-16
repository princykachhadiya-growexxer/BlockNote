import { prisma } from "./prisma.js";

let schemaSupportPromise;

async function loadDocumentSchemaSupport() {
  const columns = await prisma.$queryRaw`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Document'
      AND column_name IN ('deleted_at', 'share_count')
  `;

  const names = new Set(columns.map((column) => column.column_name));

  return {
    deletedAt: names.has("deleted_at"),
    shareCount: names.has("share_count"),
  };
}

export async function getDocumentSchemaSupport() {
  if (!schemaSupportPromise) {
    schemaSupportPromise = loadDocumentSchemaSupport().catch((error) => {
      schemaSupportPromise = null;
      throw error;
    });
  }

  return schemaSupportPromise;
}
