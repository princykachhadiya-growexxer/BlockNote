import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  toggleDocumentStar,
} from "../services/document.service.js";

export const getAllDocs = async (req, res, next) => {
  try {
    const docs = await getDocuments(req.userId, {
      starredOnly: req.query.starred === "true",
    });
    res.json({ documents: docs });
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

export const toggleStar = async (req, res, next) => {
  try {
    const result = await toggleDocumentStar(req.params.id, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
