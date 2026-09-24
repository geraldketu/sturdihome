import { readFile } from "node:fs/promises";
import path from "node:path";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

export async function renderBrandedDocument(title: string, content: string) {
  const logo = await readFile(path.join(process.cwd(), "public/images/sturdihome-logo.png"));
  const logoDataUri = `data:image/png;base64,${logo.toString("base64")}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      @page { margin: 0.7in; }
      body { color: #17233f; font-family: Georgia, serif; line-height: 1.6; margin: 0 auto; max-width: 7.2in; }
      header { border-bottom: 2px solid #c99419; margin-bottom: 2rem; padding-bottom: 1rem; }
      img { display: block; height: 1in; object-fit: contain; object-position: left center; width: auto; }
      h1 { font-size: 1.5rem; margin: 0 0 1.5rem; }
      pre { font: inherit; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <header><img src="${logoDataUri}" alt="SturdiHome Network LLC"></header>
    <h1>${escapeHtml(title)}</h1>
    <pre>${escapeHtml(content)}</pre>
  </body>
</html>`;
}