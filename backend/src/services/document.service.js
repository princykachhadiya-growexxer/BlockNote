import { prisma } from "../lib/prisma.js";

import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";

function mapDocument(document) {
  return {
    id: document.id,
    title: document.title,
    updated_at: document.updated_at,
    isStarred: Boolean(document.stars?.length),
  };
}

export const getDocuments = async (userId, { starredOnly = false } = {}) => {
  const documents = await prisma.document.findMany({
    where: {
      user_id: userId,
      ...(starredOnly
        ? {
            stars: {
              some: { user_id: userId },
            },
          }
        : {}),
    },
    orderBy: { updated_at: "desc" },
    select: {
      id: true,
      title: true,
      updated_at: true,
      stars: {
        where: { user_id: userId },
        select: { id: true },
      },
    },
  });

  return documents.map(mapDocument);
};

export const createDocument = async (userId) => {
  const document = await prisma.document.create({
    data: { user_id: userId, title: "Untitled" },
    select: { id: true, title: true, updated_at: true },
  });

  return { ...document, isStarred: false };
};

export const updateDocument = async (id, userId, title) => {
  const existing = await prisma.document.findFirst({
    where: { id, user_id: userId },
  });

  if (!existing) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found");
  }

  const document = await prisma.document.update({
    where: { id },
    data: { title },
    select: {
      id: true,
      title: true,
      updated_at: true,
      stars: {
        where: { user_id: userId },
        select: { id: true },
      },
    },
  });

  return mapDocument(document);
};

export const getDocument = async (id, userId) => {
  const document = await prisma.document.findFirst({
    where: { id, user_id: userId },
    select: {
      id: true,
      title: true,
      updated_at: true,
      stars: {
        where: { user_id: userId },
        select: { id: true },
      },
    },
  });

  if (!document) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found");
  }

  return mapDocument(document);
};

export const deleteDocument = async (id, userId) => {
  const existing = await prisma.document.findFirst({
    where: { id, user_id: userId },
  });

  if (!existing) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found");
  }

  return prisma.document.delete({ where: { id } });
};

export const toggleDocumentStar = async (id, userId) => {
  const existingDocument = await prisma.document.findFirst({
    where: { id, user_id: userId },
    select: { id: true },
  });

  if (!existingDocument) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found");
  }

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
