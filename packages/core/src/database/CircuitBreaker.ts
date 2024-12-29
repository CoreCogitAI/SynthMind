/**
 * Represents the possible states of a circuit breaker.
 * - CLOSED: Indicates that the circuit is functioning normally
 * - OPEN: Indicates that the circuit is open and requests are being blocked
 * - HALF_OPEN: Indicates that the circuit is partially open and allowing some requests through
 */
export type CircuitBreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

/**
 * Represents a circuit breaker that can protect operations from failing under extreme conditions.
 * 
 * @class
 */

export class CircuitBreaker {
    private state: CircuitBreakerState = "CLOSED";
    private failureCount: number = 0;
    private lastFailureTime?: number;
    private halfOpenSuccesses: number = 0;

    private readonly failureThreshold: number;
    private readonly resetTimeout: number;
    private readonly halfOpenMaxAttempts: number;

/**
 * Constructs a new instance of a CircuitBreakerConfig.
 * @param {Object} config - Configuration object for the CircuitBreaker.
 * @param {number} config.failureThreshold - Number of failures to trigger circuit breaker.
 * @param {number} config.resetTimeout - Time in milliseconds before attempting to close the circuit.
 * @param {number} config.halfOpenMaxAttempts - Maximum number of attempts in half-open state.
 */
    constructor(
        private readonly config: {
            failureThreshold?: number;
            resetTimeout?: number;
            halfOpenMaxAttempts?: number;
        } = {}
    ) {
        this.failureThreshold = config.failureThreshold ?? 5;
        this.resetTimeout = config.resetTimeout ?? 60000;
        this.halfOpenMaxAttempts = config.halfOpenMaxAttempts ?? 3;
    }

/**
 * Executes the provided asynchronous operation within the circuit breaker logic.
 * If the circuit is OPEN, it checks if the reset timeout has passed to move to the HALF_OPEN state.
 * If the operation is successful while in HALF_OPEN state, it increments the halfOpenSuccesses count and resets the circuit if the count exceeds the maximum attempts.
 * If the operation fails, it handles the failure by invoking the handleFailure method and rethrows the error.
 * @template T
 * @param {() => Promise<T>} operation - The asynchronous operation to be executed
 * @returns {Promise<T>} - A promise that resolves with the result of the operation
 */
    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === "OPEN") {
            if (Date.now() - (this.lastFailureTime || 0) > this.resetTimeout) {
                this.state = "HALF_OPEN";
                this.halfOpenSuccesses = 0;
            } else {
                throw new Error("Circuit breaker is OPEN");
            }
        }

        try {
            const result = await operation();

            if (this.state === "HALF_OPEN") {
                this.halfOpenSuccesses++;
                if (this.halfOpenSuccesses >= this.halfOpenMaxAttempts) {
                    this.reset();
                }
            }

            return result;
        } catch (error) {
            this.handleFailure();
            throw error;
        }
    }

/**
 * Increments failure count and updates last failure time.
 * If failure count exceeds threshold, changes state to OPEN.
 */
    private handleFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.state !== "OPEN" && this.failureCount >= this.failureThreshold) {
            this.state = "OPEN";
        }
    }

/**
 * Resets the state to "CLOSED", sets the failure count to 0, and clears the last failure time.
 */
    private reset(): void {
        this.state = "CLOSED";
        this.failureCount = 0;
        this.lastFailureTime = undefined;
    }

/**
 * Get the current state of the system.
 * @returns {"CLOSED" | "OPEN" | "HALF_OPEN"} The current state of the system.
 */
    getState(): "CLOSED" | "OPEN" | "HALF_OPEN" {
        return this.state;
    }
}
