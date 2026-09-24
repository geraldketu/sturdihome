// All integrations explicitly synthetic; no paid services or production DB.
import { spawn } from 'node:child_process';
const env={...process.env,
 DATABASE_URL:'postgresql://postgres:postgres@127.0.0.1:55439/postgres?connection_limit=1',
 DATABASE_URL_UNPOOLED:'postgresql://postgres:postgres@127.0.0.1:55439/postgres?connection_limit=1',
 SYNTHETIC_TEST_DB:'true',
 JWT_SECRET:'local-membership-review-only-secret-2026',
 STRIPE_SECRET_KEY:'sk_test_synthetic_not_real', STRIPE_WEBHOOK_SECRET:'whsec_synthetic_not_real',
 OPENAI_API_KEY:'synthetic-disabled',GROQ_API_KEY:'synthetic-disabled',
 RESEND_API_KEY:'synthetic-resend', PASSWORD_RESET_FROM:'Test <test@example.test>', APP_BASE_URL:'http://127.0.0.1:3000',
 LOCAL_RESET_EMAIL_ENDPOINT:'http://127.0.0.1:55441/emails',
 PRIVATE_S3_BUCKET:'synthetic-private',PRIVATE_S3_REGION:'us-east-1',PRIVATE_S3_ACCESS_KEY_ID:'synthetic-access',PRIVATE_S3_SECRET_ACCESS_KEY:'synthetic-secret',PRIVATE_S3_ENDPOINT:'http://127.0.0.1:55441',
 UPLOAD_SCAN_URL:'http://127.0.0.1:55441/scan',UPLOAD_SCAN_TOKEN:'synthetic-scanner',
};
const providers=spawn(process.execPath,['tests/membership/providers.mjs'],{env:{...env,TEST_PROVIDER_PORT:'55441'},stdio:'inherit',windowsHide:true});
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1'],{env,stdio:'inherit',windowsHide:true});
const shutdown=()=>{providers.kill();child.kill();};
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);child.on('exit',code=>{providers.kill();process.exit(code??1);});
