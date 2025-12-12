import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { handleDemo } from "./routes/demo";

// Rate limiting configuration for DDoS protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiting (stricter for premium key operations)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware to prevent injection attacks
function validateInput(req: Request, res: Response, next: NextFunction) {
  // Validate JSON payload
  if (req.body && typeof req.body === "object") {
    for (const key in req.body) {
      const value = req.body[key];

      // Check for suspicious patterns
      if (typeof value === "string") {
        // Prevent Firestore injection-like patterns
        if (value.includes("__proto__") || value.includes("constructor")) {
          return res.status(400).json({ error: "Invalid input detected" });
        }

        // Trim and validate string length
        req.body[key] = value.trim();
        if (req.body[key].length > 5000) {
          return res.status(400).json({ error: "Input too long" });
        }
      }
    }
  }

  next();
}

export function createServer() {
  const app = express();

  // Security middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  }));

  app.use(express.json({ limit: "10kb" })); // Limit request size to prevent large payload attacks
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));

  // Apply rate limiting
  app.use(limiter);
  app.use(validateInput);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", apiLimiter, handleDemo);

  // Handle 404s
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
