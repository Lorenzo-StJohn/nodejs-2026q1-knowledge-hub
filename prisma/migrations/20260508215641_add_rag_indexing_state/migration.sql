-- CreateTable
CREATE TABLE "RagIndexingState" (
    "id" SERIAL NOT NULL,
    "lastFullIndexAt" TIMESTAMP(3),
    "lastIncrementalIndexAt" TIMESTAMP(3),

    CONSTRAINT "RagIndexingState_pkey" PRIMARY KEY ("id")
);
