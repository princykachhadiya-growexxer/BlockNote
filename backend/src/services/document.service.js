import { prisma } from "../lib/prisma.js";

import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";

export const getDocuments = (userId) => {
  return prisma.document.findMany({
    where: { user_id: userId },
    orderBy: { updated_at: "desc" },
    select: { id: true, title: true, updated_at: true },
  });
};

export const createDocument = (userId) => {
  return prisma.document.create({
    data: { user_id: userId, title: "Untitled" },
    select: { id: true, title: true, updated_at: true },
  });
};

export const updateDocument = async (id, userId, title) => {
  const existing = await prisma.document.findFirst({
    where: { id, user_id: userId },
  });

  if (!existing) {
    throw new ApiError(HTTP.NOT_FOUND, "Document not found");
  }

  return prisma.document.update({
    where: { id },
    data: { title },
    select: { id: true, title: true, updated_at: true },
  });
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