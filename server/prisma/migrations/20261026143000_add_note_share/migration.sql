-- CreateTable
CREATE TABLE "NoteShare" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "noteId" INTEGER NOT NULL,
    "includeAttachments" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NoteShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NoteShare_token_key" ON "NoteShare"("token");

-- CreateIndex
CREATE UNIQUE INDEX "NoteShare_noteId_key" ON "NoteShare"("noteId");

-- AddForeignKey
ALTER TABLE "NoteShare" ADD CONSTRAINT "NoteShare_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
