/**
 * SRE Circuit Breaker Pattern for Allabout.skin API Communications
 * 
 * Implements the standard finite-state machine (CLOSED -> OPEN -> HALF_OPEN -> CLOSED)
 * to prevent cascading failures, fail fast (0ms) during backend outages,
 * and provide structured, typed error contracts.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type ApiErrorCode =
  | 'CIRCUIT_OPEN'
  | 'BACKEND_DOWN'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UNKNOWN';

export interface ApiErrorState {
  isError: boolean;
  code: ApiErrorCode;
  message: string;
  statusCode?: number;
  retryAfterSeconds?: number;
  canRetry: boolean;
}

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode?: number;
  readonly retryAfterSeconds?: number;
  readonly canRetry: boolean;

  constructor(
    message: string,
    code: ApiErrorCode = 'UNKNOWN',
    statusCode?: number,
    retryAfterSeconds?: number
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
    this.canRetry = code !== 'CIRCUIT_OPEN' || (retryAfterSeconds ?? 0) <= 0;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  toState(): ApiErrorState {
    return {
      isError: true,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      retryAfterSeconds: this.retryAfterSeconds,
      canRetry: this.canRetry,
    };
  }
}

export class CircuitBreakerError extends ApiError {
  constructor(retryAfterSeconds: number = 30) {
    super(
      `El circuito de comunicación está ABIERTO debido a fallos reiterados en el servidor central. Modo seguro activo (fail-fast 0ms). Reintentar en ${retryAfterSeconds} segundos.`,
      'CIRCUIT_OPEN',
      503,
      retryAfterSeconds
    );
    this.name = 'CircuitBreakerError';
    Object.setPrototypeOf(this, CircuitBreakerError.prototype);
  }
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;     // Number of consecutive failures to trip circuit (default: 5)
  resetTimeout?: number;          // Time in ms before transitioning from OPEN to HALF_OPEN (default: 30000)
  probeSuccessThreshold?: number; // Number of consecutive successes in HALF_OPEN to close circuit (default: 1)
  timeoutMs?: number;             // Default call timeout in ms (default: 8000)
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private consecutiveFailures: number = 0;
  private consecutiveSuccesses: number = 0;
  private lastFailureTime: number | null = null;
  private openedAt: number | null = null;
  private isHalfOpenProbeInProgress: boolean = false;

  private readonly failureThreshold: number;
  private readonly resetTimeout: number;
  private readonly probeSuccessThreshold: number;
  private readonly timeoutMs: number;

  private listeners: Set<(state: CircuitState) => void> = new Set();

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeout = options.resetTimeout ?? 30000;
    this.probeSuccessThreshold = options.probeSuccessThreshold ?? 1;
    this.timeoutMs = options.timeoutMs ?? 8000;
  }

  public getState(): CircuitState {
    if (this.state === 'OPEN' && this.openedAt) {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed >= this.resetTimeout) {
        this.transitionTo('HALF_OPEN');
      }
    }
    return this.state;
  }

  public getRetryAfterSeconds(): number {
    if (this.state !== 'OPEN' || !this.openedAt) {
      return 0;
    }
    const remainingMs = this.resetTimeout - (Date.now() - this.openedAt);
    return Math.max(1, Math.ceil(remainingMs / 1000));
  }

  public getStats() {
    return {
      state: this.getState(),
      consecutiveFailures: this.consecutiveFailures,
      totalFailures: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      retryAfterSeconds: this.getRetryAfterSeconds(),
      resetTimeout: this.resetTimeout,
      failureThreshold: this.failureThreshold,
    };
  }

  public onStateChange(listener: (state: CircuitState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private transitionTo(newState: CircuitState) {
    if (this.state === newState) return;
    this.state = newState;
    if (newState === 'OPEN') {
      this.openedAt = Date.now();
      this.isHalfOpenProbeInProgress = false;
    } else if (newState === 'CLOSED') {
      this.consecutiveFailures = 0;
      this.consecutiveSuccesses = 0;
      this.openedAt = null;
      this.isHalfOpenProbeInProgress = false;
    } else if (newState === 'HALF_OPEN') {
      this.consecutiveSuccesses = 0;
      this.isHalfOpenProbeInProgress = false;
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('[CircuitBreaker] Error in listener callback:', err);
      }
    }
  }

  public trip(): void {
    this.transitionTo('OPEN');
  }

  public reset(): void {
    this.transitionTo('CLOSED');
    this.failureCount = 0;
    this.consecutiveFailures = 0;
    this.lastFailureTime = null;
  }

  public recordSuccess(): void {
    const currentState = this.getState();
    if (currentState === 'HALF_OPEN') {
      this.consecutiveSuccesses++;
      this.isHalfOpenProbeInProgress = false;
      if (this.consecutiveSuccesses >= this.probeSuccessThreshold) {
        this.transitionTo('CLOSED');
      }
    } else if (currentState === 'CLOSED') {
      this.consecutiveFailures = 0;
    }
  }

  public recordFailure(error?: any): void {
    this.lastFailureTime = Date.now();
    this.failureCount++;
    this.consecutiveFailures++;

    const currentState = this.getState();
    if (currentState === 'HALF_OPEN') {
      // In HALF_OPEN, any failure immediately trips back to OPEN
      this.transitionTo('OPEN');
    } else if (currentState === 'CLOSED') {
      if (this.consecutiveFailures >= this.failureThreshold) {
        this.transitionTo('OPEN');
      }
    }
  }

  public async execute<T>(fn: () => Promise<T>, timeoutOverrideMs?: number): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      // Fail fast immediately (0ms) without attempting network call
      throw new CircuitBreakerError(this.getRetryAfterSeconds());
    }

    if (currentState === 'HALF_OPEN') {
      if (this.isHalfOpenProbeInProgress) {
        // Only one probe at a time allowed in HALF_OPEN
        throw new CircuitBreakerError(this.getRetryAfterSeconds());
      }
      this.isHalfOpenProbeInProgress = true;
    }

    const effectiveTimeout = timeoutOverrideMs ?? this.timeoutMs;
    let timeoutId: any = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new ApiError(`Timeout de ${effectiveTimeout}ms excedido al contactar backend`, 'TIMEOUT', 504));
      }, effectiveTimeout);
      if (timeoutId && typeof timeoutId.unref === 'function') {
        timeoutId.unref();
      }
    });

    try {
      const result = await Promise.race([fn(), timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      this.recordSuccess();
      return result;
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);

      // 4xx errors are client errors and should NOT trip the circuit breaker (except 429 rate limit)
      const statusCode = error?.statusCode || error?.status;
      const isClientError = typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500 && statusCode !== 429;

      if (!isClientError) {
        this.recordFailure(error);
      } else if (currentState === 'HALF_OPEN') {
        // Even client error in half-open indicates backend is alive and responding
        this.recordSuccess();
      }

      if (error instanceof ApiError) {
        throw error;
      }

      const message = error?.message || 'Error desconocido al comunicar con el servidor';
      const code: ApiErrorCode = error?.name === 'AbortError' || message.includes('Timeout') ? 'TIMEOUT' : 'BACKEND_DOWN';
      throw new ApiError(message, code, statusCode || 500);
    }
  }
}

// Global default circuit breaker for all frontend API calls
export const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000,
  probeSuccessThreshold: 1,
  timeoutMs: 8000,
});
