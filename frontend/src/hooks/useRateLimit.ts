import { useCallback, useState } from "react";
import axios from "axios";
import { testRateLimit } from "../services/api";

const RATE_LIMIT_REQUESTS = 11;

export function useRateLimit() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const run = useCallback(async () => {
    setTesting(true);
    setResults([]);

    const next: string[] = [];

    try {
      for (let i = 1; i <= RATE_LIMIT_REQUESTS; i++) {
        try {
          await testRateLimit();
          next.push(`Request ${i}: HTTP 200`);
        } catch (error) {
          if (
            axios.isAxiosError(error) &&
            error.response?.status === 429
          ) {
            next.push(`Request ${i}: HTTP 429 - Rate limited`);
          } else {
            next.push(`Request ${i}: Failed`);
          }
        }

        setResults([...next]);
      }
    } finally {
      setTesting(false);
    }
  }, []);

  return { results, testing, run };
}
