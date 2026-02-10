import { useRef, useCallback } from 'react';

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export const useRateLimiter = ({ maxRequests, windowMs }: RateLimiterOptions) => {
  const requestTimestamps = useRef<number[]>([]);

  const checkLimit = useCallback(() => {
    const now = Date.now();
    requestTimestamps.current = requestTimestamps.current.filter(
      timestamp => now - timestamp < windowMs
    );

    if (requestTimestamps.current.length >= maxRequests) {
      const oldestRequest = requestTimestamps.current[0];
      const waitTime = windowMs - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)}s`);
    }

    requestTimestamps.current.push(now);
  }, [maxRequests, windowMs]);

  const withRateLimit = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    checkLimit();
    return await fn();
  }, [checkLimit]);

  return { withRateLimit, checkLimit };
};
