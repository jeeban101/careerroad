import fs from "fs";
import path from "path";

const logDir = path.resolve(import.meta.dirname, "..", "logs");

function ensureLogDir() {
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (e) {
    // Still print to console if we can't create the directory
    console.error("Failed to create logs directory:", e);
  }
}
ensureLogDir();

function now() {
  return new Date();
}

function timeStamp() {
  return now().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function dateStamp() {
  const d = now();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function logFilePath() {
  return path.join(logDir, `express-${dateStamp()}.log`);
}

function writeToFile(line: string) {
  try {
    fs.appendFile(logFilePath(), line + "\n", (err) => {
      if (err) {
        console.error("Failed to write log file:", err);
      }
    });
  } catch (e) {
    console.error("Failed to append to log file:", e);
  }
}

/**
 * Log info lines to stdout (untruncated) and to logs/express-YYYY-MM-DD.log
 */
export function log(message: string, source = "express") {
  const line = `${timeStamp()} [${source}] ${message}`;
  console.log(line);
  writeToFile(line);
}

/**
 * Log error details (message + stack when available)
 */
export function logError(source: string, errorOrMessage: unknown) {
  let message: string;
  if (errorOrMessage instanceof Error) {
    message = `${errorOrMessage.message}\n${errorOrMessage.stack || ""}`;
  } else {
    message = String(errorOrMessage);
  }
  log(message, source);
}
