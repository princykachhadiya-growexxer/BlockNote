ALTER TABLE "Document"
ADD COLUMN "share_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "deleted_at" TIMESTAMP(3);

CREATE INDEX "Document_user_id_deleted_at_idx" ON "Document"("user_id", "deleted_at");
