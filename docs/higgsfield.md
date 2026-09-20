# Higgsfield connection

Set `HF_CREDENTIALS="KEY_ID:KEY_SECRET"` in the project root `.env.local`.
Next.js loads `.env.local` before `.env`; update both if both contain credentials.
These files are ignored by Git. Never use a `NEXT_PUBLIC_` credential variable.

Run `npm run higgsfield:check` to check authentication without generating content.
The check compares a nonexistent request lookup with an invalid-key control.
A passed check establishes acceptance of the credential, not its account email,
available credits, or permission to use every model.

Server code can import `getHiggsfield` from `@/lib/higgsfield` and call
`getHiggsfield().subscribe(endpoint, { input, withPolling: false })` with the
endpoint and input from the selected model's official documentation. Save the
returned request ID and poll for results. Generation spends account credits;
authenticate the caller and check their permissions before submitting a job.
No public generation route is enabled by this setup.

For production, set `HF_CREDENTIALS` in your hosting provider's environment
settings and redeploy. Local environment files are not uploaded by Git.
Replace any credential shared in chat before production use.

References:
- https://github.com/higgsfield-ai/higgsfield-js
- https://docs.higgsfield.ai/docs/how-to/introduction
