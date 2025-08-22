import apicache from "apicache";
import rateLimit from "express-rate-limit";

export function cacheMiddleware(seconds = 30) {
  const cache = apicache.options({
    statusCodes: { include: [200] }
  }).middleware;
  return cache(`${seconds} seconds`);
}

export function rateLimiter(windowMinutes = 1, maxReq = 120) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxReq,
    standardHeaders: true,
    legacyHeaders: false
  });
}

export function notFoundHandler(req, res, next) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal Server Error"
  });
}
