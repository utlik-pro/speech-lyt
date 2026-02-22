import time
from collections import defaultdict

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory IP-based rate limiter.

    Tracks requests per IP using a sliding window approach.
    When the limit is exceeded, returns HTTP 429 Too Many Requests.
    """

    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        # {ip: [timestamp, timestamp, ...]}
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, respecting X-Forwarded-For."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _cleanup(self, ip: str, now: float) -> None:
        """Remove expired timestamps for the given IP."""
        cutoff = now - self.window_seconds
        self._requests[ip] = [ts for ts in self._requests[ip] if ts > cutoff]
        if not self._requests[ip]:
            del self._requests[ip]

    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip rate limiting for health check
        if request.url.path == "/health":
            return await call_next(request)

        ip = self._get_client_ip(request)
        now = time.time()

        self._cleanup(ip, now)

        timestamps = self._requests.get(ip, [])
        if len(timestamps) >= self.max_requests:
            retry_after = int(self.window_seconds - (now - timestamps[0])) + 1
            return JSONResponse(
                status_code=429,
                content={
                    "detail": "Too many requests. Please try again later.",
                },
                headers={"Retry-After": str(retry_after)},
            )

        self._requests[ip].append(now)

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.max_requests)
        response.headers["X-RateLimit-Remaining"] = str(
            self.max_requests - len(self._requests.get(ip, []))
        )
        response.headers["X-RateLimit-Reset"] = str(
            int(now + self.window_seconds)
        )
        return response
