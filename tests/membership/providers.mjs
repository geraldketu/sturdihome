// Loopback-only synthetic adapters. NEVER run on a public host or deploy.
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../../node_modules/.cache/security-storage/', import.meta.url);
await mkdir(root, { recursive: true });
let mail = [], failEmail = false, clean = true, privateBucket = true;
createServer(async (req,res) => {
 try {
  const url=new URL(req.url,'http://127.0.0.1:55441');
  let chunks=[]; for await(const chunk of req) chunks.push(chunk);
  const bytes=Buffer.concat(chunks);
  if(url.pathname==='/control' && req.method==='POST') { const v=JSON.parse(bytes);if('failEmail' in v)failEmail=v.failEmail;if('clean' in v)clean=v.clean;if('privateBucket' in v)privateBucket=v.privateBucket;res.end('{}');return; }
  if(url.pathname==='/mail') {res.setHeader('Content-Type','application/json');res.end(JSON.stringify(mail));return;}
  if(url.pathname==='/emails') {if(req.headers.authorization!=='Bearer synthetic-resend'){res.writeHead(403).end();return;}if(failEmail){res.writeHead(503).end();return;}mail.push(JSON.parse(bytes));res.setHeader('Content-Type','application/json');res.end('{"id":"local-only"}');return;}
  if(url.pathname==='/scan') {if(req.headers.authorization!=='Bearer synthetic-scanner'){res.writeHead(403).end();return;}res.setHeader('Content-Type','application/json');res.end(JSON.stringify({clean:clean&&!bytes.includes(Buffer.from('synthetic-malware'))}));return;}
  if(!req.headers.authorization?.includes('Credential=synthetic-access/')) {res.writeHead(403).end();return;}
  if(url.searchParams.has('publicAccessBlock')) {res.setHeader('Content-Type','application/xml');res.end(`<PublicAccessBlockConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><BlockPublicAcls>${privateBucket}</BlockPublicAcls><IgnorePublicAcls>true</IgnorePublicAcls><BlockPublicPolicy>true</BlockPublicPolicy><RestrictPublicBuckets>true</RestrictPublicBuckets></PublicAccessBlockConfiguration>`);return;}
  const file=new URL(createHash('sha256').update(url.pathname).digest('hex'),root);
  if(req.method==='PUT') {if(req.headers['x-amz-server-side-encryption']!=='AES256')throw Error('Encryption required');await writeFile(file,bytes);res.setHeader('ETag','"test"');res.end();return;}
  if(req.method==='GET'){const data=await readFile(file);res.setHeader('Content-Length',data.length);res.end(data);return;}
  res.writeHead(405).end();
 }catch {res.writeHead(404).end();}
}).listen(Number(process.env.TEST_PROVIDER_PORT ?? 55441),'127.0.0.1',()=>console.log('Synthetic providers ready on loopback'));
