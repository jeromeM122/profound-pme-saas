-- CreateEnum
CREATE TYPE "RoutineStepType" AS ENUM ('PRE_POO', 'CLEANSE', 'CONDITION', 'MASK', 'LEAVE_IN', 'SEAL', 'STYLE');

-- CreateTable
CREATE TABLE "RoutineChoice" (
    "userId" TEXT NOT NULL,
    "step" "RoutineStepType" NOT NULL,
    "productId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineChoice_pkey" PRIMARY KEY ("userId","step")
);

-- CreateIndex
CREATE INDEX "RoutineChoice_productId_idx" ON "RoutineChoice"("productId");

-- AddForeignKey
ALTER TABLE "RoutineChoice" ADD CONSTRAINT "RoutineChoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineChoice" ADD CONSTRAINT "RoutineChoice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
