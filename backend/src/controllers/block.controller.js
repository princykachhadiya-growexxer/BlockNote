import {
  getBlocks,
  getUserBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
  splitBlock,
  toggleBlockStar,
} from "../services/block.service.js";
import {
  createBlockSchema,
  updateBlockSchema,
  reorderBlocksSchema,
} from "../validations/block.validation.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";

// GET /api/documents/:docId/blocks
export const listBlocks = async (req, res, next) => {
  try {
    const blocks = await getBlocks(req.params.docId, req.userId);
    res.json({ blocks });
  } catch (err) {
    next(err);
  }
};

// GET /api/blocks?starred=true
export const listUserBlocks = async (req, res, next) => {
  try {
    const blocks = await getUserBlocks(req.userId, {
      starredOnly: req.query.starred === "true",
    });
    res.json({ blocks });
  } catch (err) {
    next(err);
  }
};

// POST /api/documents/:docId/blocks
export const addBlock = async (req, res, next) => {
  try {
    const parsed = createBlockSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new ApiError(
          HTTP.UNPROCESSABLE_ENTITY,
          parsed.error.errors[0]?.message ?? "Invalid block data"
        )
      );
    }

    const block = await createBlock(req.params.docId, req.userId, parsed.data);
    res.status(HTTP.CREATED).json({ block });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/documents/:docId/blocks/:blockId
export const modifyBlock = async (req, res, next) => {
  try {
    const parsed = updateBlockSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new ApiError(
          HTTP.UNPROCESSABLE_ENTITY,
          parsed.error.errors[0]?.message ?? "Invalid block data"
        )
      );
    }

    const block = await updateBlock(
      req.params.blockId,
      req.params.docId,
      req.userId,
      parsed.data
    );
    res.json({ block });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/documents/:docId/blocks/:blockId
export const removeBlock = async (req, res, next) => {
  try {
    await deleteBlock(req.params.blockId, req.params.docId, req.userId);
    res.status(HTTP.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
};

// POST /api/documents/:docId/blocks/reorder
export const reorder = async (req, res, next) => {
  try {
    const parsed = reorderBlocksSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(
        new ApiError(
          HTTP.UNPROCESSABLE_ENTITY,
          parsed.error.errors[0]?.message ?? "Invalid reorder data"
        )
      );
    }

    const result = await reorderBlocks(
      req.params.docId,
      req.userId,
      parsed.data.blocks
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/documents/:docId/blocks/:blockId/split
export const split = async (req, res, next) => {
  try {
    const { leftContent, rightContent, rightOrderIndex } = req.body ?? {};

    if (
      leftContent == null ||
      rightContent == null ||
      typeof rightOrderIndex !== "number" ||
      !isFinite(rightOrderIndex)
    ) {
      return next(
        new ApiError(
          HTTP.UNPROCESSABLE_ENTITY,
          "leftContent, rightContent and rightOrderIndex are required"
        )
      );
    }

    const result = await splitBlock(
      req.params.blockId,
      req.params.docId,
      req.userId,
      { leftContent, rightContent, rightOrderIndex }
    );
    res.status(HTTP.CREATED).json(result);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/blocks/:blockId/star
export const toggleStar = async (req, res, next) => {
  try {
    const result = await toggleBlockStar(req.params.blockId, req.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
