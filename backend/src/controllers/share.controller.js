import {
  enableShare,
  revokeShare,
  getDocumentByToken,
} from "../services/share.service.js";
import { getBlocksPublic } from "../services/block.service.js";
import { shareDocSchema } from "../validations/block.validation.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../utils/httpStatus.js";

// POST /api/documents/:docId/share  { action: "enable" | "revoke" }
export const manageShare = async (req, res) => {
  const parsed = shareDocSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(HTTP.UNPROCESSABLE_ENTITY, 'action must be "enable" or "revoke"');
  }

  const { action } = parsed.data;

  if (action === "enable") {
    const result = await enableShare(req.params.docId, req.userId);
    return res.json({ shareToken: result.share_token, isPublic: result.is_public });
  }

  if (action === "revoke") {
    await revokeShare(req.params.docId, req.userId);
    return res.json({ shareToken: null, isPublic: false });
  }

  // Guard: zod should prevent this, but just in case
  throw new ApiError(HTTP.UNPROCESSABLE_ENTITY, "Invalid action");
};

// GET /api/share/:token
export const viewSharedDocument = async (req, res) => {
  const { token } = req.params;
  const doc = await getDocumentByToken(token);
  const blocks = await getBlocksPublic(doc.id);
  res.json({ document: doc, blocks });
};
