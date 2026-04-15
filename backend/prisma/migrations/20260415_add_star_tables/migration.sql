CREATE TABLE "DocumentStar" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "DocumentStar_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlockStar" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "block_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BlockStar_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DocumentStar_user_id_document_id_key" ON "DocumentStar"("user_id", "document_id");
CREATE INDEX "DocumentStar_user_id_idx" ON "DocumentStar"("user_id");
CREATE INDEX "DocumentStar_document_id_idx" ON "DocumentStar"("document_id");

CREATE UNIQUE INDEX "BlockStar_user_id_block_id_key" ON "BlockStar"("user_id", "block_id");
CREATE INDEX "BlockStar_user_id_idx" ON "BlockStar"("user_id");
CREATE INDEX "BlockStar_block_id_idx" ON "BlockStar"("block_id");

ALTER TABLE "DocumentStar"
ADD CONSTRAINT "DocumentStar_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentStar"
ADD CONSTRAINT "DocumentStar_document_id_fkey"
FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlockStar"
ADD CONSTRAINT "BlockStar_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BlockStar"
ADD CONSTRAINT "BlockStar_block_id_fkey"
FOREIGN KEY ("block_id") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;
