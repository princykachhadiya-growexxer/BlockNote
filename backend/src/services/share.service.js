import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { getDocumentSchemaSupport } from "../lib/document-schema.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

async function assertOwner(documentId, userId) {
  const schemaSupport = await getDocumentSchemaSupport();
  const doc = await prisma.document.findFirst({
    where: {
      id: documentId,
      user_id: userId,
      ...(schemaSupport.deletedAt ? { deleted_at: null } : {}),
    },
    select: { id: true, share_token: true, is_public: true },
  });
  if (!doc) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found");
  }
  return doc;
}

export async function enableShare(documentId, userId) {
  const schemaSupport = await getDocumentSchemaSupport();
  await assertOwner(documentId, userId);

  // Regenerate token on every enable call (revoke-and-replace)
  const token = generateToken();

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: schemaSupport.shareCount
      ? {
          share_token: token,
          is_public: true,
          share_count: {
            increment: 1,
          },
        }
      : {
          share_token: token,
          is_public: true,
        },
    select: { id: true, share_token: true, is_public: true },
  });

  return updated;
}

export async function revokeShare(documentId, userId) {
  await assertOwner(documentId, userId);

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: { share_token: null, is_public: false },
    select: { id: true, share_token: true, is_public: true },
  });

  return updated;
}

export async function getDocumentByToken(token) {
  if (!token || typeof token !== "string") {
    throw new ApiError(HTTP.NOT_FOUND, "Invalid share token");
  }

  const schemaSupport = await getDocumentSchemaSupport();
  const doc = await prisma.document.findFirst({
    where: {
      share_token: token,
      ...(schemaSupport.deletedAt ? { deleted_at: null } : {}),
    },
    select: { id: true, title: true, is_public: true, updated_at: true },
  });

  if (!doc || !doc.is_public) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found or sharing disabled");
  }

  return doc;
}
