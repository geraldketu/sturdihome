// Local synthetic tests only. See docs/membership-review/README.md.
import { createRequire } from "node:module";
const testRequire = createRequire(new URL("../../node_modules/.cache/membership-tools/package.json", import.meta.url));
﻿const { PGlite } = testRequire('@electric-sql/pglite');
const { createServer } = testRequire('pglite-server');
import { createServer as httpServer } from 'node:http';
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
const db = new PGlite();
await db.waitReady;
await db.exec(readFileSync(new URL('../../node_modules/.cache/membership-tools/schema.sql',import.meta.url),'utf8'));
await db.exec(`ALTER TABLE "NetworkAgreement" ADD COLUMN "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT TIMESTAMP '2026-09-19 00:00:00';
ALTER TABLE "NetworkAgreement" ADD COLUMN "documentIdentifier" TEXT NOT NULL DEFAULT 'synthetic-agreement';
ALTER TABLE "AgreementAcceptance" ADD COLUMN "agreementType" TEXT NOT NULL DEFAULT 'SYNTHETIC';
ALTER TABLE "AgreementAcceptance" ADD COLUMN "agreementTitle" TEXT NOT NULL DEFAULT 'Synthetic Agreement';
ALTER TABLE "AgreementAcceptance" ADD COLUMN "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT TIMESTAMP '2026-09-19 00:00:00';
ALTER TABLE "AgreementAcceptance" ADD COLUMN "documentIdentifier" TEXT NOT NULL DEFAULT 'synthetic-agreement';
ALTER TABLE "AgreementAcceptance" ADD COLUMN "fullLegalName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AgreementAcceptance" ADD COLUMN "companyName" TEXT;
ALTER TABLE "AgreementAcceptance" ADD COLUMN "electronicSignature" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AgreementAcceptance" ADD COLUMN "consentToElectronicRecords" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AgreementAcceptance" ADD COLUMN "acceptanceStatus" TEXT NOT NULL DEFAULT 'ACCEPTED';
ALTER TABLE "AgreementAcceptance" ADD COLUMN "signedCopyContent" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AgreementAcceptance" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "AgreementAcceptance" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "User" ADD COLUMN "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN "canceledAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "cancellationReason" TEXT;
ALTER TABLE "User" ADD COLUMN "financingAccessStatus" TEXT NOT NULL DEFAULT 'ACTIVE';
CREATE TABLE "CharacterEntitlement" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"freeSecondsRemaining" INTEGER NOT NULL DEFAULT 60,"paidSecondsRemaining" INTEGER NOT NULL DEFAULT 0,"plan" TEXT,"purchasedAt" TIMESTAMP(3),"expiresAt" TIMESTAMP(3),"status" TEXT NOT NULL DEFAULT 'FREE',"stripeCheckoutSessionId" TEXT,"stripePaymentIntentId" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "CharacterEntitlement_pkey" PRIMARY KEY ("id"),CONSTRAINT "CharacterEntitlement_userId_key" UNIQUE ("userId"),CONSTRAINT "CharacterEntitlement_stripeCheckoutSessionId_key" UNIQUE ("stripeCheckoutSessionId"));
CREATE TABLE "CharacterUsage" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"character" TEXT NOT NULL,"seconds" INTEGER NOT NULL,"source" TEXT NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "CharacterUsage_pkey" PRIMARY KEY ("id"));
CREATE TABLE "MemberStandingAcceptance" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"version" TEXT NOT NULL,"effectiveDate" TIMESTAMP(3) NOT NULL,"documentIdentifier" TEXT NOT NULL,"fullLegalName" TEXT NOT NULL,"electronicSignature" TEXT NOT NULL,"signedCopyContent" TEXT NOT NULL,"acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "MemberStandingAcceptance_pkey" PRIMARY KEY ("id"),CONSTRAINT "MemberStandingAcceptance_userId_version_key" UNIQUE ("userId","version"));
CREATE TABLE "FinancePartnerReportingAcceptance" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"version" TEXT NOT NULL,"documentIdentifier" TEXT NOT NULL,"fullLegalName" TEXT NOT NULL,"electronicSignature" TEXT NOT NULL,"signedCopyContent" TEXT NOT NULL,"acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "FinancePartnerReportingAcceptance_pkey" PRIMARY KEY ("id"),CONSTRAINT "FinancePartnerReportingAcceptance_userId_version_key" UNIQUE ("userId","version"));
CREATE TABLE "FinancingStatusReport" ("id" TEXT NOT NULL,"financePartnerUserId" TEXT NOT NULL,"financePartnerProfileId" TEXT NOT NULL,"memberId" TEXT NOT NULL,"financingRequestId" TEXT NOT NULL,"status" TEXT NOT NULL,"relationshipReference" TEXT,"authorizationConfirmed" BOOLEAN NOT NULL,"accuracyConfirmed" BOOLEAN NOT NULL,"ownRelationshipConfirmed" BOOLEAN NOT NULL,"noCollectionConfirmed" BOOLEAN NOT NULL,"updateCommitmentConfirmed" BOOLEAN NOT NULL,"active" BOOLEAN NOT NULL DEFAULT true,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"resolvedAt" TIMESTAMP(3));
CREATE TABLE "FinancingStatusDispute" ("id" TEXT NOT NULL,"reportId" TEXT NOT NULL,"memberId" TEXT NOT NULL,"response" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'OPEN',"reviewedBy" TEXT,"reviewedAt" TIMESTAMP(3),"adminNotes" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "FinancingStatusAudit" ("id" TEXT NOT NULL,"reportId" TEXT NOT NULL,"actorUserId" TEXT NOT NULL,"action" TEXT NOT NULL,"reason" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "UserNotification" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"reportId" TEXT,"title" TEXT NOT NULL,"body" TEXT NOT NULL,"readAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "AccountCancellationAudit" ("id" TEXT NOT NULL,"userId" TEXT NOT NULL,"actorUserId" TEXT NOT NULL,"reason" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "VendorReferral" ("id" TEXT NOT NULL,"code" TEXT NOT NULL,"vendorUserId" TEXT NOT NULL,"customerId" TEXT,"status" TEXT NOT NULL DEFAULT 'SENT',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"acceptedAt" TIMESTAMP(3),CONSTRAINT "VendorReferral_pkey" PRIMARY KEY ("id"),CONSTRAINT "VendorReferral_code_key" UNIQUE ("code"),CONSTRAINT "VendorReferral_customerId_key" UNIQUE ("customerId"));`);
const hash=await bcrypt.hash('Review-only-Password42',10);
for (const [id,role,name] of [['test-member','HOMEOWNER','Felicia Member'],['test-vendor','VENDOR','Victor Vendor'],['test-finance','FINANCING_PARTNER','Fiona Finance'],['test-admin','ADMIN','Admin Test'],['test-pending','VENDOR','Pending Vendor']]) {
 await db.query('INSERT INTO "User" (id,email,"passwordHash",name,role,"firstLoginAt") VALUES ($1,$2,$3,$4,$5,now())',[id,id+'@example.test',hash,name,role]);
}
await db.exec(`INSERT INTO "VendorProfile" (id,"userId","companyName","serviceArea","servicesOffered",status,"membershipStatus") VALUES ('vp','test-vendor','Test Plumbing','Atlanta','Plumbing','APPROVED','ACTIVE'),('pending','test-pending','Pending Plumbing','Atlanta','Plumbing','PENDING','NONE');
INSERT INTO "FinancingPartnerProfile" (id,"userId","companyName","licenseInfo",status,"paymentStatus") VALUES ('fp','test-finance','Test Finance','Test','APPROVED','PAID');
INSERT INTO "FinancingRequest" (id,"homeownerId","projectDescription","amountRequested",status,"assignedPartnerId") VALUES ('fr-task4','test-member','Synthetic Task 4 financing relationship',1000,'ASSIGNED','fp');
INSERT INTO "MarketplaceListing" (id,"ownerId",kind,"companyName",description,services,categories,areas,website,published,"updatedAt") VALUES ('listing','test-vendor','vendor','Test Plumbing','Test description','Plumbing',ARRAY['Plumbing'],ARRAY['Atlanta'],'https://example.test',true,now());`);
// Synthetic partner text exists only inside this isolated test database.
await db.exec(`CREATE UNIQUE INDEX "NetworkAgreement_one_active_role" ON "NetworkAgreement" (role) WHERE active;`);
for(const role of ['HOMEOWNER','VENDOR','FINANCING_PARTNER']) await db.query(`INSERT INTO "NetworkAgreement" (id,role,version,title,content,"effectiveDate","documentIdentifier",active) VALUES ($1,$2,'test-v1','TEST Agreement','SYNTHETIC TEST ONLY - not legal terms',TIMESTAMP '2026-09-19 00:00:00',$3,true)`,[role,role,`synthetic-${role.toLowerCase()}-v1`]);
await db.exec(`UPDATE "User" SET "agreementAcceptedAt"=now(),"agreementVersion"='test-v1',"approvalStatus"='APPROVED' WHERE role <> 'ADMIN';
INSERT INTO "AgreementAcceptance" (id,"userId",role,version,"agreementType","agreementTitle","effectiveDate","documentIdentifier","fullLegalName","electronicSignature","consentToElectronicRecords","signedCopyContent") SELECT id,id,role,'test-v1',role,'TEST Agreement',TIMESTAMP '2026-09-19 00:00:00','synthetic-agreement-v1',name,name,true,'SYNTHETIC SIGNED COPY' FROM "User" WHERE role <> 'ADMIN';
UPDATE "User" SET "approvalStatus"='PENDING' WHERE id='test-pending';`);
createServer(db).listen(55439,'127.0.0.1',()=>console.log('Isolated membership test DB ready on 127.0.0.1:55439'));


httpServer(async(req,res)=>{
 try {let body='';for await(const chunk of req)body+=chunk;const {sql,params=[]}=JSON.parse(body);const data=await db.query(sql,params);res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data.rows));}
 catch(e){res.statusCode=500;res.end(JSON.stringify({error:e.message}))}
}).listen(55440,'127.0.0.1');
