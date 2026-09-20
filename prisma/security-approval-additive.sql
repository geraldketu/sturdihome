-- LOCAL REVIEW ONLY: additive migration; no auto-approval or deletion. Apply once after backup and owner deployment approval.
BEGIN;
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agreementVersion" TEXT,
ADD COLUMN     "approvalReviewedAt" TIMESTAMP(3),
ADD COLUMN     "approvalReviewedBy" TEXT,
ADD COLUMN     "approvalStatus" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "NetworkAgreement" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NetworkAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgreementAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "version" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgreementAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApprovalAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NetworkAgreement_role_version_key" ON "NetworkAgreement"("role", "version");

-- CreateIndex
CREATE UNIQUE INDEX "AgreementAcceptance_userId_role_version_key" ON "AgreementAcceptance"("userId", "role", "version");

-- CreateIndex
CREATE INDEX "ApprovalAudit_userId_idx" ON "ApprovalAudit"("userId");

-- AddForeignKey
ALTER TABLE "AgreementAcceptance" ADD CONSTRAINT "AgreementAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "NetworkAgreement_one_active_role" ON "NetworkAgreement" ("role") WHERE active;
INSERT INTO "NetworkAgreement" (id,role,version,title,content,active) VALUES ('homeowner-existing-v1','HOMEOWNER','existing-v1','Member Agreement',$terms$SturdiHome Network LLC ("SturdiHome") operates a referral network connecting homeowners with independent, third-party home-service vendors and financing partners. SturdiHome does not perform home-improvement work and is not a lender. All financing is provided solely by independent financing partners, and all home-service work is performed solely by independent vendors. SturdiHome is not a party to any financing agreement or service contract between a member and a vendor or financing partner.

As a member, you authorize SturdiHome to share your request details with relevant vetted vendors and/or financing partners in order to fulfill your requests.$terms$,true);
-- Preserve legacy agreementAcceptedAt values, but require a versioned acceptance
-- and manual admin review for every non-admin. No partner terms are invented.
COMMIT;
