/**
 * Delays execution to simulate realistic clinical system latency.
 * @param ms - duration in milliseconds
 * @returns a promise that resolves after the given delay
 * @clinical-note realistic delays help surface loading states safely during mock-mode development
 */
export function delay(ms = 250): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
