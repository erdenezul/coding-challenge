-- AlterTable
ALTER TABLE "Maze" ADD COLUMN     "user_id" TEXT NOT NULL DEFAULT 'clrrsez1m0000hg1ky5ki889i';

-- AddForeignKey
ALTER TABLE "Maze" ADD CONSTRAINT "Maze_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
