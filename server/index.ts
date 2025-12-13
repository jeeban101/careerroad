import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log, logError } from "./logger";
import path from "path";
import cors from 'cors';


const app = express();

const allowedOrigins = [process.env.CLIENT_ORIGIN || "http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
}));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

console.log('✅ EXPRESS SERVER STARTING')
// add cors
// const corsOption = {
//   origin: 'http://localhost:5173',
// }



app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    logError("express", err);

    res.status(status).json({ message });
    throw err;
  });

  // Serve static client in production. In development, run client dev server separately.
  // not needed to have client

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.NODE_PORT || 8005;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
        log(`serving on port http://localhost:${port}`);
    }
  );


  // Graceful shutdown on Ctrl+C
  process.on("SIGINT", () => {
    console.info("SIGINT signal received (Ctrl+C).");
    console.log("Closing http server.");
    server.close(() => {
      console.log("Http server closed.");
      process.exit(0);
    });
    // Fallback: force exit if server doesn't close in time
    setTimeout(() => {
      console.warn("Forcing shutdown after 10s timeout.");
      process.exit(1);
    }, 10000).unref?.();

    process.exit(0);
  });
})();
