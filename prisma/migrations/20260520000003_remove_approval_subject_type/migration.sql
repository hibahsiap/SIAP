-- Remove subjectType column and ApprovalSubject enum from Approval
ALTER TABLE "Approval" DROP COLUMN IF EXISTS "subjectType";
DROP TYPE IF EXISTS "ApprovalSubject";
