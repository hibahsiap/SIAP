-- AlterTable: set default UUID generation for Channel.id
ALTER TABLE "Channel" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
