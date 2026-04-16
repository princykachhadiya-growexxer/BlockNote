import { prisma } from "../lib/prisma.js";
import { getDocumentSchemaSupport } from "../lib/document-schema.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";
import { normalizeBlockContent } from "../utils/richText.js";

const RENORM_THRESHOLD = 0.001;
const RENORM_STEP = 1000;

// ─── Ownership guard ──────────────────────────────────────────────────────────

async function assertDocumentOwner(documentId, userId) {
  // Hard guard: if routing is misconfigured these will be undefined and
  // Prisma will silently match nothing — catch it early with a clear error.
  if (!documentId || !userId) {
    throw new ApiError(HTTP.BAD_REQUEST, "Missing documentId or userId");
  }

  const schemaSupport = await getDocumentSchemaSupport();
  const doc = await prisma.document.findFirst({
    where: {
      id: documentId,
      user_id: userId,
      ...(schemaSupport.deletedAt ? { deleted_at: null } : {}),
    },
    select: { id: true },
  });
  if (!doc) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found");
  }
  return doc;
}

function mapBlockWithStar(block) {
  return {
    id: block.id,
    type: block.type,
    content: block.content,
    order_index: block.order_index,
    parent_id: block.parent_id,
    created_at: block.created_at,
    document_id: block.document_id,
    document: block.document,
    isStarred: Boolean(block.stars?.length),
  };
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getBlocks(documentId, userId) {
  await assertDocumentOwner(documentId, userId);

  const blocks = await prisma.block.findMany({
    where: { document_id: documentId },
    orderBy: { order_index: "asc" },
    select: {
      id: true,
      type: true,
      content: true,
      order_index: true,
      parent_id: true,
      created_at: true,
      document_id: true,
      stars: {
        where: { user_id: userId },
        select: { id: true },
      },
    },
  });

  return blocks.map(mapBlockWithStar);
}

// Read-only access for share token (no user check)
export async function getBlocksPublic(documentId) {
  return prisma.block.findMany({
    where: { document_id: documentId },
    orderBy: { order_index: "asc" },
    select: {
      id: true,
      type: true,
      content: true,
      order_index: true,
      parent_id: true,
    },
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createBlock(documentId, userId, { type, content, order_index, parent_id }) {
  await assertDocumentOwner(documentId, userId);

  const normalizedContent = normalizeBlockContent(type, content);

  const block = await prisma.block.create({
    data: {
      document_id: documentId,
      type,
      content: normalizedContent ?? {},
      order_index,
      parent_id: parent_id ?? null,
    },
    select: {
      id: true,
      type: true,
      content: true,
      order_index: true,
      parent_id: true,
      created_at: true,
      document_id: true,
    },
  });

  // Touch document updated_at
  await prisma.document.update({
    where: { id: documentId },
    data: { updated_at: new Date() },
  });

  return { ...block, isStarred: false };
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateBlock(blockId, documentId, userId, fields) {
  await assertDocumentOwner(documentId, userId);

  const current = await prisma.block.findFirst({
    where: { id: blockId, document_id: documentId },
    select: { id: true, type: true, content: true },
  });
  if (!current) {
    throw new ApiError(HTTP.NOT_FOUND, "Block not found");
  }

  const data = { ...fields };

  if (data.content) {
    data.content = normalizeBlockContent(data.type ?? current.type, data.content);
  }

  const updated = await prisma.block.update({
    where: { id: blockId },
    data,
    select: {
      id: true,
      type: true,
      content: true,
      order_index: true,
      parent_id: true,
      document_id: true,
      stars: {
        where: { user_id: userId },
        select: { id: true },
      },
    },
  });

  await prisma.document.update({
    where: { id: documentId },
    data: { updated_at: new Date() },
  });

  return mapBlockWithStar(updated);
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteBlock(blockId, documentId, userId) {
  await assertDocumentOwner(documentId, userId);

  const existing = await prisma.block.findFirst({
    where: { id: blockId, document_id: documentId },
    select: { id: true },
  });
  if (!existing) {
    throw new ApiError(HTTP.NOT_FOUND, "Block not found");
  }

  await prisma.block.delete({ where: { id: blockId } });

  await prisma.document.update({
    where: { id: documentId },
    data: { updated_at: new Date() },
  });
}

// ─── Batch reorder ────────────────────────────────────────────────────────────

export async function reorderBlocks(documentId, userId, blocks) {
  await assertDocumentOwner(documentId, userId);

  // Verify all block IDs belong to this document
  const ids = blocks.map((b) => b.id);
  const found = await prisma.block.findMany({
    where: { id: { in: ids }, document_id: documentId },
    select: { id: true },
  });
  if (found.length !== ids.length) {
    throw new ApiError(HTTP.UNPROCESSABLE_ENTITY, "One or more block IDs are invalid");
  }

  // Check for float precision collapse
  const indices = [...blocks]
    .sort((a, b) => a.order_index - b.order_index)
    .map((b) => b.order_index);
  const needsRenorm = indices.some((idx, i) => {
    if (i === 0) return false;
    return Math.abs(idx - indices[i - 1]) < RENORM_THRESHOLD;
  });

  if (needsRenorm) {
    // Renormalize all blocks in document with evenly spaced floats
    const allBlocks = await prisma.block.findMany({
      where: { document_id: documentId },
      orderBy: { order_index: "asc" },
      select: { id: true, order_index: true },
    });

    const updates = allBlocks.map((b, i) =>
      prisma.block.update({
        where: { id: b.id },
        data: { order_index: (i + 1) * RENORM_STEP },
      })
    );
    await prisma.$transaction(updates);
    const normalized = allBlocks.map((b, i) => ({
      id: b.id,
      order_index: (i + 1) * RENORM_STEP,
    }));
    return { renormalized: true, blocks: normalized };
  }

  // Normal batch update
  const updates = blocks.map((b) =>
    prisma.block.update({
      where: { id: b.id },
      data: { order_index: b.order_index },
    })
  );
  await prisma.$transaction(updates);

  await prisma.document.update({
    where: { id: documentId },
    data: { updated_at: new Date() },
  });

  return { renormalized: false, blocks };
}

// ─── Split block (atomic) ────────────────────────────────────────────────────

export async function splitBlock(blockId, documentId, userId, { leftContent, rightContent, rightOrderIndex }) {
  await assertDocumentOwner(documentId, userId);

  const existing = await prisma.block.findFirst({
    where: { id: blockId, document_id: documentId },
    select: { id: true, type: true, order_index: true },
  });
  if (!existing) {
    throw new ApiError(HTTP.NOT_FOUND, "Block not found");
  }

  // Only text-like blocks can be split
  const splittableTypes = ["paragraph", "heading_1", "heading_2", "todo", "code"];
  if (!splittableTypes.includes(existing.type)) {
    throw new ApiError(HTTP.UNPROCESSABLE_ENTITY, "Block type cannot be split");
  }

  const normalizedLeft = normalizeBlockContent(existing.type, leftContent);
  const normalizedRight = normalizeBlockContent(existing.type, rightContent);

  const [updatedLeft, newRight] = await prisma.$transaction([
    prisma.block.update({
      where: { id: blockId },
      data: { content: normalizedLeft },
      select: { id: true, type: true, content: true, order_index: true },
    }),
    prisma.block.create({
      data: {
        document_id: documentId,
        type: existing.type,
        content: normalizedRight,
        order_index: rightOrderIndex,
      },
      select: { id: true, type: true, content: true, order_index: true },
    }),
  ]);

  await prisma.document.update({
    where: { id: documentId },
    data: { updated_at: new Date() },
  });

  return { left: updatedLeft, right: newRight };
}

export async function getUserBlocks(userId, { starredOnly = false } = {}) {
  const schemaSupport = await getDocumentSchemaSupport();
  const blocks = await prisma.block.findMany({
    where: {
      document: {
        user_id: userId,
        ...(schemaSupport.deletedAt ? { deleted_at: null } : {}),
      },
      ...(starredOnly
        ? {
            stars: {
              some: { user_id: userId },
            },
          }
        : {}),
    },
    orderBy: [{ created_at: "desc" }],
    select: {
      id: true,
      type: true,
      content: true,
      order_index: true,
      parent_id: true,
      created_at: true,
      document_id: true,
      document: {
        select: {
          id: true,
          title: true,
        },
      },
      stars: {
        where: { user_id: userId },
        select: { id: true },
      },
    },
  });

  return blocks.map(mapBlockWithStar);
}

export async function toggleBlockStar(blockId, userId) {
  const schemaSupport = await getDocumentSchemaSupport();
  const block = await prisma.block.findFirst({
    where: {
      id: blockId,
      document: {
        user_id: userId,
        ...(schemaSupport.deletedAt ? { deleted_at: null } : {}),
      },
    },
    select: {
      id: true,
    },
  });

  if (!block) {
    throw new ApiError(HTTP.NOT_FOUND, "Block not found");
  }

  const existing = await prisma.blockStar.findUnique({
    where: {
      user_id_block_id: {
        user_id: userId,
        block_id: blockId,
      },
    },
  });

  if (existing) {
    await prisma.blockStar.delete({ where: { id: existing.id } });
    return { isStarred: false };
  }

  await prisma.blockStar.create({
    data: {
      user_id: userId,
      block_id: blockId,
    },
  });

  return { isStarred: true };
}
