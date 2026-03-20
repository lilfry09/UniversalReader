// Simple QA Service using DeepSeek API directly
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import type { SourceChunk, QAServiceStatus, QAStatus } from "../src/types.ts";

// Simple Document interface
interface Doc {
  pageContent: string;
  metadata: Record<string, unknown>;
}

// DeepSeek API Key from environment variable (read lazily for testability)
function getDeepSeekApiKey(): string {
  return process.env.DEEPSEEK_API_KEY || "";
}

function getDeepSeekBaseUrl(): string {
  return process.env.DEEPSEEK_API_URL || "https://api.deepseek.com";
}

// Simple in-memory vector store
interface DocChunk {
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

// Service state
let documents: DocChunk[] = [];
let currentBookPath: string | null = null;
let currentStatus: QAStatus = "idle";
let currentError: string | null = null;
let chunkCount = 0;

// Simple cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

// Call DeepSeek API for embeddings
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${getDeepSeekBaseUrl()}/v1/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getDeepSeekApiKey()}`
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text
    })
  });

  const data = await response.json() as { data?: { embedding: number[] }[] };
  return data.data?.[0]?.embedding || [];
}

// Call DeepSeek API for chat
async function chat(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch(`${getDeepSeekBaseUrl()}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getDeepSeekApiKey()}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.7
    })
  });
  
  const data = await response.json() as { choices?: { message: { content: string } }[] };
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
}

// Search similar documents
async function similaritySearch(query: string, k: number = 4): Promise<Doc[]> {
  const queryEmbedding = await getEmbedding(query);
  const similarities = documents.map((doc, idx) => ({
    idx,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
    doc
  }));
  
  similarities.sort((a, b) => b.score - a.score);
  
  return similarities.slice(0, k).map(s => ({
    pageContent: s.doc.content,
    metadata: s.doc.metadata
  }));
}

function updateStatus(status: QAStatus, error?: string): void {
  currentStatus = status;
  currentError = error || null;
}

function getStatus(): QAServiceStatus {
  return {
    status: currentStatus,
    currentBook: currentBookPath || undefined,
    error: currentError || undefined,
    chunkCount: chunkCount || undefined,
  };
}

// Extract text from different file formats
async function extractTextFromFile(
  filePath: string,
  format: string
): Promise<string> {
  switch (format.toLowerCase()) {
    case "txt":
    case "md":
      return fs.promises.readFile(filePath, "utf-8");

    case "pdf": {
      const pdfjs = await import("pdfjs-dist");
      
      // Set up worker - try multiple possible locations
      const possibleWorkerPaths = [
        path.join(process.cwd(), 'public', 'pdf.worker.min.mjs'),
        path.join(process.cwd(), 'dist', 'pdf.worker.min.mjs'),
        path.join(__dirname, '..', 'dist', 'pdf.worker.min.mjs'),
        path.join(process.cwd(), 'dist-electron', 'pdf.worker.mjs'),
        path.join(__dirname, '..', 'dist-electron', 'pdf.worker.mjs'),
      ];
      
      for (const workerPath of possibleWorkerPaths) {
        if (fs.existsSync(workerPath)) {
          pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
          break;
        }
      }
      
      const buffer = await fs.promises.readFile(filePath);
      // Convert Buffer to Uint8Array for pdfjs-dist
      const data = new Uint8Array(buffer);
      const pdf = await pdfjs.getDocument({ data }).promise;
      const textParts: string[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) => {
            if (typeof item === 'object' && item !== null && 'str' in item) {
              return (item as { str: string }).str;
            }
            return "";
          })
          .join(" ");
        textParts.push(pageText);
      }
      return textParts.join("\n\n");
    }

    case "epub": {
      const zip = new AdmZip(filePath);
      const entries = zip.getEntries();
      const htmlContents: string[] = [];
      
      for (const entry of entries) {
        if (
          entry.entryName.endsWith(".html") ||
          entry.entryName.endsWith(".xhtml") ||
          entry.entryName.endsWith(".htm")
        ) {
          const content = entry.getData().toString("utf-8");
          htmlContents.push(content);
        }
      }

      // Simple HTML tag stripping
      const text = htmlContents
        .map(html =>
          html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/\s+/g, " ")
            .trim()
        )
        .join("\n\n");

      return text;
    }

    case "azw3":
    case "azw":
    case "mobi": {
      throw new Error(
        `AZW3/Mobi format requires conversion to EPUB. ` +
        `Please convert the file to EPUB format using Calibre ` +
        `(https://calibre-ebook.com) or an online converter, ` +
        `then re-add the book to the library.`
      );
    }

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

// Load book for QA
async function loadBookForQA(
  bookPath: string,
  format: string
): Promise<{ success: boolean; error?: string }> {
  try {
    updateStatus("loading");

    // Check API key
    if (!getDeepSeekApiKey()) {
      throw new Error(
        "DEEPSEEK_API_KEY environment variable is not set. " +
        "Please set it in your .env file or system environment."
      );
    }

    if (!fs.existsSync(bookPath)) {
      throw new Error(`File not found: ${bookPath}`);
    }

    console.log(`[QA] Extracting text from ${bookPath}`);
    const text = await extractTextFromFile(bookPath, format);

    if (!text || text.trim().length === 0) {
      throw new Error("No text content extracted from file");
    }

    console.log(`[QA] Extracted ${text.length} characters`);

    // Split into chunks (simple approach)
    const chunkSize = 1000;
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    console.log(`[QA] Created ${chunks.length} text chunks`);

    // Create embeddings for all chunks
    documents = [];
    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk);
      documents.push({
        content: chunk,
        embedding,
        metadata: { source: path.basename(bookPath) }
      });
    }
    
    chunkCount = chunks.length;
    currentBookPath = bookPath;
    updateStatus("ready");

    console.log(`[QA] Ready with ${chunkCount} chunks`);

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[QA] Load error:", errorMessage);
    updateStatus("error", errorMessage);

    return { success: false, error: errorMessage };
  }
}

// Ask a question
async function askQuestion(
  question: string
): Promise<{ answer: string; sources: SourceChunk[] }> {
  if (documents.length === 0) {
    throw new Error("No book loaded. Please load a book first.");
  }

  if (currentStatus !== "ready") {
    throw new Error("QA service not ready. Please wait.");
  }

  console.log(`[QA] Question: ${question}`);

  // Get relevant documents
  const relevantDocs = await similaritySearch(question, 4);

  // Build context from relevant docs (limit context size)
  const context = relevantDocs.map(d => d.pageContent.slice(0, 2000)).join("\n\n");
  
  // Create a prompt with context
  const prompt = `You are a helpful assistant that answers questions about a book. Based only on the following context from the book, please answer the question. If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:`;

  const answer = await chat([
    { role: "user", content: prompt }
  ]);

  const sources: SourceChunk[] = relevantDocs.map((doc) => ({
    content: doc.pageContent,
    source: (doc.metadata.source as string) || "Unknown",
  }));

  console.log(`[QA] Answer length: ${answer.length}`);

  return {
    answer,
    sources,
  };
}

// Clear QA state
function clearQA(): void {
  documents = [];
  currentBookPath = null;
  chunkCount = 0;
  updateStatus("idle");
  console.log("[QA] Cleared");
}

export const qaService = {
  loadBookForQA,
  askQuestion,
  clearQA,
  getStatus,
};
