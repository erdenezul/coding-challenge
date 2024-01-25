-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maze" (
    "id" SERIAL NOT NULL,
    "entrance" TEXT NOT NULL,
    "walls" TEXT[],
    "col" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "min_paths" TEXT[],
    "max_paths" TEXT[],

    CONSTRAINT "Maze_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
