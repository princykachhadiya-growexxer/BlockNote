import { z } from "zod";

export const VALID_BLOCK_TYPES = [
  "paragraph",
  "heading_1",
  "heading_2",
  "todo",
  "code",
  "divider",
  "image",
];

export const blockContentSchema = z.object({}).catchall(z.unknown()).default({});

export const createBlockSchema = z.object({
  type: z.enum(VALID_BLOCK_TYPES),
  content: blockContentSchema,
  order_index: z.number().finite(),
  parent_id: z.string().uuid().nullable().optional(),
});

export const updateBlockSchema = z.object({
  type: z.enum(VALID_BLOCK_TYPES).optional(),
  content: blockContentSchema.optional(),
  order_index: z.number().finite().optional(),
});

export const reorderBlocksSchema = z.object({
  // array of { id, order_index } pairs
  blocks: z
    .array(
      z.object({
        id: z.string().uuid(),
        order_index: z.number().finite(),
      })
    )
    .min(1),
});

export const shareDocSchema = z.object({
  // optional: client can pass nothing; token is server-generated
  action: z.enum(["enable", "revoke"]),
});
