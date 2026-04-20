import { Request, Response, NextFunction } from "express";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean);
const NODE_ENV = process.env.NODE_ENV || "development";

const DANGEROUS_HEADERS = [
  "x-powered-by",
  "x-frontend",
  "server",
  "x-request-id",
];

const MAX_REQUEST_SIZE = 10 * 1024 * 1024;

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'"
  );
  next();
}

export function corsMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const origin = _req.headers.origin;

  if (NODE_ENV === "development") {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && ALLOWED_ORIGINS.length > 0) {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-API-Key"
  );
  res.setHeader("Access-Control-Max-Age", "86400");

  if (_req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}

export function sanitizeRequest(_req: Request, res: Response, next: NextFunction): void {
  for (const header of DANGEROUS_HEADERS) {
    res.removeHeader(header);
  }

  if (_req.headers["x-forwarded-host"]) {
    delete _req.headers["x-forwarded-host"];
  }

  next();
}

export function ddosProtection(_req: Request, res: Response, next: NextFunction): void {
  if (_req.method === "TRACE" || _req.method === "CONNECT") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const contentLength = parseInt(_req.headers["content-length"] || "0", 10);
  if (contentLength > MAX_REQUEST_SIZE) {
    res.status(413).json({ error: "Payload too large" });
    return;
  }

  next();
}

export function securityMiddleware(_req: Request, res: Response, next: NextFunction): void {
  securityHeaders(_req, res, () => {
    corsMiddleware(_req, res, () => {
      sanitizeRequest(_req, res, () => {
        ddosProtection(_req, res, next);
      });
    });
  });
}

export default securityMiddleware;