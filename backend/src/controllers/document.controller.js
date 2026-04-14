import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../services/document.service.js";

import { getUserIdFromRequest } from "../lib/api-auth.js";

export const getAllDocs = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const docs = await getDocuments(userId);
  res.json({ documents: docs });
};

export const createDoc = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const doc = await createDocument(userId);
  res.status(201).json({ document: doc });
};

export const updateDoc = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const updated = await updateDocument(
      req.params.id,
      userId,
      req.body.title
    );
    res.json({ document: updated });
  } catch {
    res.status(403).json({ message: "Document not found" });
  }
};

export const deleteDoc = async (req, res) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    await deleteDocument(req.params.id, userId);
    res.status(204).send();
  } catch {
    res.status(403).json({ message: "Document not found" });
  }
};