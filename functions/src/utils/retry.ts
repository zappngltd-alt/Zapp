
/**
 * Retries a promise-returning function with exponential backoff.
 * @param fn The function to retry.
 * @param retries Maximum number of retries (default: 3).
 * @param delay Initial delay in ms (default: 1000).
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    
    console.warn(`[Retry] Operation failed. Retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}
