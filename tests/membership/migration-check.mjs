import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../../node_modules/.cache/membership-tools/package.json',import.meta.url));
const {PGlite}=require('@electric-sql/pglite');
const db=new PGlite();await db.waitReady;
try {
 await db.exec(readFileSync('node_modules/.cache/security-before.sql','utf8'));
 await db.exec(`INSERT INTO "User" (id,email,"passwordHash",name,role,"agreementAcceptedAt") VALUES ('legacy','legacy@example.test','synthetic-hash','Legacy','HOMEOWNER','2025-01-01'); INSERT INTO "Document" (id,"userId",label,"fileName") VALUES ('legacy-doc','legacy','Legacy file','old.pdf');`);
 await db.exec(readFileSync('prisma/security-approval-additive.sql','utf8'));
 const user=(await db.query('SELECT * FROM "User" WHERE id=\'legacy\'')).rows[0];assert.equal(user.approvalStatus,'PENDING');assert.equal(user.agreementVersion,null);assert.ok(user.agreementAcceptedAt);assert.equal(user.passwordHash,'synthetic-hash');
 assert.equal((await db.query('SELECT "fileName" FROM "Document"')).rows[0].fileName,'old.pdf');
 assert.equal((await db.query(`SELECT count(*)::int n FROM "NetworkAgreement" WHERE role IN ('VENDOR','FINANCING_PARTNER')`)).rows[0].n,0);
 assert.equal((await db.query('SELECT count(*)::int n FROM "AgreementAcceptance"')).rows[0].n,0);
 await assert.rejects(db.exec(`INSERT INTO "NetworkAgreement" (id,role,version,title,content,active) VALUES ('duplicate','HOMEOWNER','v2','Test','Test',true)`));
 const original=readFileSync('src/app/member/agreement/page.tsx','utf8');
 const paragraphs=[...original.matchAll(/<p(?: className="mt-3")?>([\s\S]*?)<\/p>/g)].map(x=>x[1].replaceAll('&quot;','"').replace(/\s+/g,' ').trim());
 const terms=(await db.query('SELECT content FROM "NetworkAgreement"')).rows[0].content;
 assert.equal(terms,paragraphs.join('\n\n'));
 const results=['Additive migration applies to old schema','Legacy user, password hash, acceptance timestamp and file record preserved','No auto-approval or invented partner agreements','Only one active agreement per role','Homeowner terms match existing text exactly'];
 writeFileSync('docs/security-review/migration-results.json',JSON.stringify({testedAt:new Date().toISOString(),results},null,2));console.log(results.map(s=>'PASS '+s).join('\n'));
}finally{await db.close()}
