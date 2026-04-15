-- AddIndex: composite index for efficient ordered block queries
CREATE INDEX IF NOT EXISTS "Block_document_id_order_index_idx"
  ON "Block"("document_id", "order_index");

-- AddIndex: fast share_token lookups for public documents
CREATE INDEX IF NOT EXISTS "Document_share_token_idx"
  ON "Document"("share_token");
