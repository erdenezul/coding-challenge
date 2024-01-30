-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('buyer', 'sellerId');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "deposit" INTEGER NOT NULL DEFAULT 0,
    "role" TEXT NOT NULL DEFAULT 'buyer',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "available" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maze" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL DEFAULT 'clrrsez1m0000hg1ky5ki889i',
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

-- CreateIndex
CREATE UNIQUE INDEX "Session_user_id_key" ON "Session"("user_id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maze" ADD CONSTRAINT "Maze_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
