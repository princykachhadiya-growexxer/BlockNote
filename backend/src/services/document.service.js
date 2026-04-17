import { prisma } from "../lib/prisma.js";
import { getDocumentSchemaSupport } from "../lib/document-schema.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";
import { normalizeBlockContent } from "../utils/richText.js";

// ─── Select helpers ───────────────────────────────────────────────────────────

function buildDocumentSelect(userId, schemaSupport) {
  return {
    id: true,
    title: true,
    updated_at: true,
    ...(schemaSupport.shareCount ? { share_count: true } : {}),
    ...(schemaSupport.deletedAt ? { deleted_at: true } : {}),
    // Include block types so the dashboard can filter on them
    blocks: {
      select: { type: true },
    },
    _count: {
      select: {
        blocks: true,
      },
    },
    stars: {
      where: { user_id: userId },
      select: { id: true },
    },
  };
}

/**
 * Map a raw Prisma document to the API shape.
 * Adds `blockTypes` — a deduplicated list of block type strings present
 * in the document (e.g. ["paragraph", "heading", "code"]).
 */
function mapDocument(document, schemaSupport) {
  // Collect unique block types from the included blocks relation
  const blockTypes = document.blocks
    ? [...new Set(document.blocks.map((b) => b.type))]
    : [];

  return {
    id: document.id,
    title: document.title,
    updated_at: document.updated_at,
    shareCount: schemaSupport.shareCount ? (document.share_count ?? 0) : 0,
    // _count.blocks is the real count; blocks array length == same but is used for types
    blockCount: document._count?.blocks ?? 0,
    isDeleted: schemaSupport.deletedAt ? Boolean(document.deleted_at) : false,
    deleted_at: schemaSupport.deletedAt ? document.deleted_at : null,
    isStarred: Boolean(document.stars?.length),
    // ── NEW: block types for dashboard filtering ──
    blockTypes,
  };
}

// ─── Private helpers (unchanged) ─────────────────────────────────────────────

async function requireSoftDeleteSupport() {
  const schemaSupport = await getDocumentSchemaSupport();
  if (!schemaSupport.deletedAt) {
    throw new ApiError(
      HTTP.SERVICE_UNAVAILABLE,
      'Database schema is missing "deleted_at". Run the latest Prisma migration.'
    );
  }
  return schemaSupport;
}

async function assertOwnedDocument(id, userId, { allowDeleted = true } = {}) {
  const schemaSupport = await getDocumentSchemaSupport();
  const existing = await prisma.document.findFirst({
    where: {
      id,
      user_id: userId,
      ...(schemaSupport.deletedAt && !allowDeleted ? { deleted_at: null } : {}),
    },
    select: {
      id: true,
      ...(schemaSupport.deletedAt ? { deleted_at: true } : {}),
    },
  });

  if (!existing) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found");
  }

  return {
    existing,
    schemaSupport,
  };
}

// ─── Public service functions ─────────────────────────────────────────────────

export const getDocuments = async (
  userId,
  { starredOnly = false, trashedOnly = false } = {}
) => {
  const schemaSupport = await getDocumentSchemaSupport();

  const documents = await prisma.document.findMany({
    where: {
      user_id: userId,
      ...(schemaSupport.deletedAt
        ? { deleted_at: trashedOnly ? { not: null } : null }
        : {}),
      ...(starredOnly
        ? {
            stars: {
              some: { user_id: userId },
            },
          }
        : {}),
    },
    orderBy: [{ updated_at: "desc" }, { title: "asc" }],
    select: buildDocumentSelect(userId, schemaSupport),
  });

  if (trashedOnly && !schemaSupport.deletedAt) {
    return [];
  }

  return documents.map((document) => mapDocument(document, schemaSupport));
};

/**
 * getDashboardAnalytics
 *
 * Extended to include `blockTypes` on each document so the frontend
 * filter bar can offer block-type filtering without extra round-trips.
 *
 * Performance note: we fetch blocks.type in the same query via the
 * `blocks` relation select — no extra DB call per document.
 */
export const getDashboardAnalytics = async (userId) => {
  const schemaSupport = await getDocumentSchemaSupport();

  const [documents, totalDocuments, deletedDocuments, totalBlocks] = await Promise.all([
    prisma.document.findMany({
      where: {
        user_id: userId,
        ...(schemaSupport.deletedAt ? { deleted_at: null } : {}),
      },
      orderBy: { updated_at: "desc" },
      select: buildDocumentSelect(userId, schemaSupport),
    }),
    prisma.document.count({
      where: {
        user_id: userId,
        ...(schemaSupport.deletedAt ? { deleted_at: null } : {}),
      },
    }),
    schemaSupport.deletedAt
      ? prisma.document.count({
          where: {
            user_id: userId,
            deleted_at: { not: null },
          },
        })
      : Promise.resolve(0),
    prisma.block.count({
      where: {
        document: {
          user_id: userId,
          ...(schemaSupport.deletedAt ? { deleted_at: null } : {}),
        },
      },
    }),
  ]);

  return {
    totals: {
      documents: totalDocuments,
      deletedDocuments,
      blocks: totalBlocks,
    },
    documents: documents.map((document) => mapDocument(document, schemaSupport)),
  };
};

// ─── All remaining functions are UNCHANGED ───────────────────────────────────

export const createDocument = async (userId) => {
  const schemaSupport = await getDocumentSchemaSupport();
  const document = await prisma.$transaction(async (tx) => {
    const created = await tx.document.create({
      data: { user_id: userId, title: "Untitled" },
      select: { id: true },
    });

    await tx.block.create({
      data: {
        document_id: created.id,
        type: "paragraph",
        content: normalizeBlockContent("paragraph", { text: "", html: "" }),
        order_index: 1000,
      },
    });

    return tx.document.findUnique({
      where: { id: created.id },
      select: buildDocumentSelect(userId, schemaSupport),
    });
  });

  return mapDocument(document, schemaSupport);
};

export const updateDocument = async (id, userId, title) => {
  const { schemaSupport } = await assertOwnedDocument(id, userId, { allowDeleted: false });

  const document = await prisma.document.update({
    where: { id },
    data: { title },
    select: buildDocumentSelect(userId, schemaSupport),
  });

  return mapDocument(document, schemaSupport);
};

export const getDocument = async (id, userId) => {
  const schemaSupport = await getDocumentSchemaSupport();
  const document = await prisma.document.findFirst({
    where: {
      id,
      user_id: userId,
      ...(schemaSupport.deletedAt ? { deleted_at: null } : {}),
    },
    select: buildDocumentSelect(userId, schemaSupport),
  });

  if (!document) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found");
  }

  return mapDocument(document, schemaSupport);
};

export const deleteDocument = async (id, userId) => {
  await requireSoftDeleteSupport();
  await assertOwnedDocument(id, userId, { allowDeleted: false });

  await prisma.document.update({
    where: { id },
    data: {
      deleted_at: new Date(),
      is_public: false,
      share_token: null,
    },
  });
};

export const restoreDocument = async (id, userId) => {
  const schemaSupport = await requireSoftDeleteSupport();
  const { existing } = await assertOwnedDocument(id, userId);

  if (!existing.deleted_at) {
    throw new ApiError(HTTP.UNPROCESSABLE_ENTITY, "Document is not in trash");
  }

  const restored = await prisma.document.update({
    where: { id },
    data: {
      deleted_at: null,
      updated_at: new Date(),
    },
    select: buildDocumentSelect(userId, schemaSupport),
  });

  return mapDocument(restored, schemaSupport);
};

export const permanentlyDeleteDocument = async (id, userId) => {
  await assertOwnedDocument(id, userId);
  await prisma.document.delete({ where: { id } });
};

export const toggleDocumentStar = async (id, userId) => {
  await assertOwnedDocument(id, userId, { allowDeleted: false });

  const existingStar = await prisma.documentStar.findUnique({
    where: {
      user_id_document_id: {
        user_id: userId,
        document_id: id,
      },
    },
  });

  if (existingStar) {
    await prisma.documentStar.delete({ where: { id: existingStar.id } });
    return { isStarred: false };
  }

  await prisma.documentStar.create({
    data: {
      user_id: userId,
      document_id: id,
    },
  });

  return { isStarred: true };
};
