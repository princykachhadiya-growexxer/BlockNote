import {
  getDocuments,
  getDashboardAnalytics,
  createDocument,
  updateDocument,
  deleteDocument,
  restoreDocument,
  permanentlyDeleteDocument,
  getDocument,
  toggleDocumentStar,
} from "../services/document.service.js";
import { parseBooleanQuery } from "../utils/query.js";

export const getAllDocs = async (req, res, next) => {
  try {
    const starredOnly = parseBooleanQuery(req.query.starred, "starred");
    const trashedOnly = parseBooleanQuery(req.query.trashed, "trashed");
    const docs = await getDocuments(req.userId, {
      starredOnly,
      trashedOnly,
    });
    res.json({ documents: docs });
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await getDashboardAnalytics(req.userId);
    res.json(analytics);
  } catch (err) {
    next(err);
  }
};

export const createDoc = async (req, res, next) => {
  try {
    const doc = await createDocument(req.userId);
    res.status(201).json({ document: doc });
  } catch (err) {
    next(err);
  }
};

export const getDoc = async (req, res, next) => {
  try {
    const document = await getDocument(req.params.id, req.userId);
    res.json({ document });
  } catch (err) {
    next(err);
  }
};

export const updateDoc = async (req, res, next) => {
  try {
    const updated = await updateDocument(req.params.id, req.userId, req.body.title);
    res.json({ document: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteDoc = async (req, res, next) => {
  try {
    await deleteDocument(req.params.id, req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const restoreDoc = async (req, res, next) => {
  try {
    const document = await restoreDocument(req.params.id, req.userId);
    res.json({ document });
  } catch (err) {
    next(err);
  }
};

export const permanentlyDeleteDoc = async (req, res, next) => {
  try {
    await permanentlyDeleteDocument(req.params.id, req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const toggleStar = async (req, res, next) => {
  try {
    const result = await toggleDocumentStar(req.params.id, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
