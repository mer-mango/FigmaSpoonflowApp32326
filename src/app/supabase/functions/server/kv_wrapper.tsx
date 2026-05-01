/**
 * KV Store Wrapper with Retry Logic
 * Wraps the protected kv_store.tsx with retry logic to handle connection resets
 */
import * as kvStore from "./kv_store.tsx";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Only log detailed errors on the last attempt
      if (attempt === MAX_RETRIES) {
        console.error(`❌ ${operationName} failed after ${MAX_RETRIES} attempts:`, error);
      } else {
        // Just log a brief retry message for intermediate attempts
        const delayTime = RETRY_DELAY_MS * attempt;
        console.log(`🔄 ${operationName} retry ${attempt}/${MAX_RETRIES} in ${delayTime}ms...`);
        await delay(delayTime);
      }
    }
  }
  
  throw new Error(`${operationName} failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

export const get = async (key: string): Promise<any> => {
  return withRetry(
    () => kvStore.get(key),
    `get(${key})`
  );
};

export const set = async (key: string, value: any): Promise<void> => {
  return withRetry(
    () => kvStore.set(key, value),
    `set(${key})`
  );
};

export const del = async (key: string): Promise<void> => {
  return withRetry(
    () => kvStore.del(key),
    `del(${key})`
  );
};

export const mget = async (keys: string[]): Promise<any[]> => {
  return withRetry(
    () => kvStore.mget(keys),
    `mget([${keys.join(', ')}])`
  );
};

export const mset = async (keys: string[], values: any[]): Promise<void> => {
  return withRetry(
    () => kvStore.mset(keys, values),
    `mset([${keys.join(', ')}])`
  );
};

export const mdel = async (keys: string[]): Promise<void> => {
  return withRetry(
    () => kvStore.mdel(keys),
    `mdel([${keys.join(', ')}])`
  );
};

export const getByPrefix = async (prefix: string): Promise<any[]> => {
  return withRetry(
    () => kvStore.getByPrefix(prefix),
    `getByPrefix(${prefix})`
  );
};