function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function printDocument(imageUrl: string, alt: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Print coloring page</title>
    <style>
      @page { margin: 0; }
      html, body { width: 100%; height: 100%; margin: 0; background: white; }
      body { display: flex; align-items: center; justify-content: center; }
      img { display: block; width: 100%; height: 100%; object-fit: contain; }
    </style>
  </head>
  <body>
    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}" onload="window.focus(); window.print()">
    <script>window.addEventListener("afterprint", () => window.close());</script>
  </body>
</html>`;
}
