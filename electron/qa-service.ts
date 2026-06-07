// Simple QA Service using OpenRouter API
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";
import type { SourceChunk, QAServiceStatus, QAStatus } from "../src/types.ts";
import * as secureStore from "./secure-store.js";

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple Document interface
interface Doc {
  pageContent: string;
  metadata: Record<string, unknown>;
}

type ApiStyle = "openai" | "anthropic";

// QA API configuration using secure storage
function getApiStyle(): ApiStyle {
  // In test environment, fallback to env vars
  if (process.env.NODE_ENV === 'test') {
    const value = (process.env.QA_API_STYLE || "").toLowerCase();
    return value === "anthropic" ? "anthropic" : "openai";
  }
  return secureStore.getApiStyle();
}

function getApiKey(): string {
  // In test environment, fallback to env vars
  if (process.env.NODE_ENV === 'test') {
    return (
      process.env.QA_API_KEY ||
      process.env.OPENROUTER_API_KEY ||
      process.env.DEEPSEEK_API_KEY ||
      ""
    );
  }
  return secureStore.getApiKey();
}

function getBaseUrl(): string {
  // In test environment, fallback to env vars
  if (process.env.NODE_ENV === 'test') {
    if (process.env.QA_BASE_URL) return process.env.QA_BASE_URL;
    if (process.env.OPENROUTER_BASE_URL) return process.env.OPENROUTER_BASE_URL;
    return getApiStyle() === "anthropic"
      ? "https://api.minimax.io/anthropic"
      : "https://openrouter.ai/api/v1";
  }
  return secureStore.getBaseUrl(getApiStyle());
}

function getChatModel(): string {
  // In test environment, fallback to env vars
  if (process.env.NODE_ENV === 'test') {
    return process.env.QA_MODEL ||
      (getApiStyle() === "anthropic" ? "MiniMax-M2.7" : "google/gemini-2.0-flash-thinking-exp:free");
  }
  return secureStore.getChatModel(getApiStyle());
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/g, "");
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

// Simple TF-IDF like vectorizer (no API needed)
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

function computeTfIdfVector(tokens: string[], vocab: Map<string, number>, idf: Map<string, number>): number[] {
  const vector = new Array(vocab.size).fill(0);
  const tf = new Map<string, number>();

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  for (const [token, count] of tf) {
    const idx = vocab.get(token);
    if (idx !== undefined) {
      const tfVal = count / tokens.length;
      const idfVal = idf.get(token) || 0;
      vector[idx] = tfVal * idfVal;
    }
  }

  return vector;
}

function buildVocabAndIdf(chunks: string[]): { vocab: Map<string, number>; idf: Map<string, number> } {
  const vocab = new Map<string, number>();
  const docFreq = new Map<string, number>();
  const allTokens = chunks.map(c => tokenize(c));

  for (const tokens of allTokens) {
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }

  let idx = 0;
  for (const token of docFreq.keys()) {
    vocab.set(token, idx++);
  }

  const idf = new Map<string, number>();
  const nDocs = chunks.length;
  for (const [token, freq] of docFreq) {
    idf.set(token, Math.log((nDocs + 1) / (freq + 1)) + 1);
  }

  return { vocab, idf };
}

// Simple keyword-based similarity (fallback)
function keywordSimilarity(query: string, content: string): number {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return 0;

  const contentTokens = new Set(tokenize(content));

  let matchCount = 0;
  for (const token of queryTokens) {
    if (contentTokens.has(token)) matchCount++;
  }

  return matchCount / queryTokens.size;
}

async function chatOpenAICompatible(
  messages: { role: string; content: string }[],
  signal?: AbortSignal
): Promise<string> {
  const baseUrl = trimTrailingSlash(getBaseUrl());
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getApiKey()}`
  };

  // These headers are OpenRouter specific and harmless when omitted for other providers.
  if (baseUrl.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = "https://github.com";
    headers["X-Title"] = "UniversalReader";
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({
      model: getChatModel(),
      messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI-compatible API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as { choices?: { message: { content: string } }[] };
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
}

async function chatAnthropicCompatible(
  messages: { role: string; content: string }[],
  signal?: AbortSignal
): Promise<string> {
  const baseUrl = trimTrailingSlash(getBaseUrl());

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      "anthropic-version": "2023-06-01"
    },
    signal,
    body: JSON.stringify({
      model: getChatModel(),
      max_tokens: 1024,
      messages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic-compatible API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = data.content
    ?.filter(block => block.type === "text")
    .map(block => block.text || "")
    .join("\n")
    .trim();

  return text || "Sorry, I couldn't generate a response.";
}

// Call configured chat API for answer generation with retry logic
async function chat(
  messages: { role: string; content: string }[],
  retries = 3
): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Create abort controller with 30s timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const result = getApiStyle() === "anthropic"
        ? await chatAnthropicCompatible(messages, controller.signal)
        : await chatOpenAICompatible(messages, controller.signal);

      clearTimeout(timeoutId);
      return result;

    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Log the error
      console.error(`[QA] Chat API error (attempt ${attempt + 1}/${retries}):`, errorMessage);

      // If this is the last attempt, throw the error
      if (isLastAttempt) {
        throw new Error(`Chat API failed after ${retries} attempts: ${errorMessage}`);
      }

      // Determine retry delay based on error type
      let retryDelay = 1000 * (attempt + 1); // Base: 1s, 2s, 3s

      // Check for rate limit (429) or server errors (5xx)
      if (errorMessage.includes('429')) {
        retryDelay = 2000 * (attempt + 2); // Longer wait for rate limits: 4s, 6s
        console.log(`[QA] Rate limit detected, waiting ${retryDelay}ms before retry...`);
      } else if (errorMessage.includes('50') || errorMessage.includes('503')) {
        retryDelay = 1500 * (attempt + 1); // Server errors: 1.5s, 3s
        console.log(`[QA] Server error detected, waiting ${retryDelay}ms before retry...`);
      } else if (errorMessage.includes('abort')) {
        retryDelay = 500; // Quick retry for timeouts
        console.log(`[QA] Request timeout, retrying in ${retryDelay}ms...`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // This should never be reached due to throw in last attempt, but TypeScript needs it
  throw new Error('Unexpected error in retry loop');
}

// Search similar documents using TF-IDF
async function similaritySearch(query: string, k: number = 4): Promise<Doc[]> {
  if (documents.length === 0) return [];

  // Find documents with keyword overlap first
  const scored = documents.map((doc, idx) => ({
    idx,
    score: keywordSimilarity(query, doc.content),
    doc
  }));

  // Sort by score and return top k
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, k).map(s => ({
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
  // For web blob URLs, we can't read them directly in Node
  // This is handled at a higher level
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
    // Immediately clear old data to free memory
    documents = [];
    currentBookPath = null;
    chunkCount = 0;
    updateStatus("loading");

    // Check memory usage before loading
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    console.log(`[QA] Memory before load: ${heapUsedMB}MB heap used`);

    // Force GC if memory usage is high (>500MB) and GC is available
    if (memUsage.heapUsed > 500 * 1024 * 1024) {
      console.warn(`[QA] High memory usage (${heapUsedMB}MB), attempting GC...`);
      if (global.gc) {
        global.gc();
        const afterGC = process.memoryUsage();
        const afterGCMB = Math.round(afterGC.heapUsed / 1024 / 1024);
        console.log(`[QA] Memory after GC: ${afterGCMB}MB heap used`);
      } else {
        console.warn('[QA] GC not available (run with --expose-gc flag)');
      }
    }

    // Check API key
    if (!getApiKey()) {
      throw new Error(
        "QA_API_KEY (or OPENROUTER_API_KEY) environment variable is not set. " +
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

    // Build TF-IDF index
    const { vocab, idf } = buildVocabAndIdf(chunks);

    documents = chunks.map((content, idx) => {
      const tokens = tokenize(content);
      return {
        content,
        embedding: computeTfIdfVector(tokens, vocab, idf),
        metadata: { source: path.basename(bookPath), chunkIndex: idx }
      };
    });

    chunkCount = chunks.length;
    currentBookPath = bookPath;
    updateStatus("ready");

    // Log final memory usage
    const finalMem = process.memoryUsage();
    const finalMemMB = Math.round(finalMem.heapUsed / 1024 / 1024);
    console.log(`[QA] Ready with ${chunkCount} chunks, memory: ${finalMemMB}MB`);

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
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    throw new Error("Question cannot be empty.");
  }

  if (documents.length === 0) {
    throw new Error("No book loaded. Please load a book first.");
  }

  if (currentStatus !== "ready") {
    throw new Error("QA service not ready. Please wait.");
  }

  console.log(`[QA] Question: ${trimmedQuestion}`);

  // Get relevant documents using TF-IDF
  const relevantDocs = await similaritySearch(trimmedQuestion, 4);

  // Build context from relevant docs
  const context = relevantDocs.map(d => d.pageContent.slice(0, 2000)).join("\n\n");

  // Create a prompt with context
  const prompt = `You are a helpful assistant that answers questions about a book. Based only on the following context from the book, please answer the question. If the answer is not in the context, say so.

Context:
${context}

Question: ${trimmedQuestion}

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

  // Suggest GC after clearing large data
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  console.log(`[QA] Cleared, memory: ${heapUsedMB}MB`);

  if (global.gc && memUsage.heapUsed > 200 * 1024 * 1024) {
    console.log('[QA] Triggering GC after clear...');
    global.gc();
  }
}

export const qaService = {
  loadBookForQA,
  askQuestion,
  clearQA,
  getStatus,
};
