import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractPdfTextFromBuffer(buf: Buffer): Promise<string> {
  // Load the PDF from a Buffer
  const loadingTask = getDocument({
    data: new Uint8Array(buf),
  });

  const doc = await loadingTask.promise;
  let fullText = "";

  try {
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();

      const strings = (content.items as any[])
        .map((item: any) => {
          // Typical PDF.js text item has "str"
          if (typeof item?.str === "string") return item.str;
          // Fallbacks seen in some builds
          if (typeof item?.unicode === "string") return item.unicode;
          return "";
        })
        .filter(Boolean);

      fullText += strings.join(" ") + "\n";
    }
  } finally {
    await doc.destroy();
  }

  return fullText.trim();
}
