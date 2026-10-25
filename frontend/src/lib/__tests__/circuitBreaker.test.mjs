import { CircuitBreaker, CircuitBreakerError, ApiError } from '../circuitBreaker.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Iniciando Suite de Verificación SRE Circuit Breaker...');

  // Test 1: Initial state is CLOSED
  console.log('\n--- Test 1: Estado inicial CLOSED ---');
  const cb = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 200,
    probeSuccessThreshold: 1,
    timeoutMs: 100,
  });
  assert(cb.getState() === 'CLOSED', 'Estado inicial es CLOSED');
  assert(cb.getStats().consecutiveFailures === 0, 'Fallos consecutivos iniciales son 0');

  // Test 2: Successful requests maintain CLOSED state
  console.log('\n--- Test 2: Peticiones exitosas mantienen CLOSED ---');
  const res1 = await cb.execute(async () => 'OK_SUCCESS');
  assert(res1 === 'OK_SUCCESS', 'Petición exitosa retorna resultado');
  assert(cb.getState() === 'CLOSED', 'Estado sigue siendo CLOSED tras éxito');

  // Test 3: Client errors (4xx) do not trip the circuit breaker
  console.log('\n--- Test 3: Errores de cliente (400, 404) no disparan el circuito ---');
  try {
    await cb.execute(async () => {
      const err = new ApiError('Not found', 'NOT_FOUND', 404);
      throw err;
    });
  } catch (e) {
    assert(e.code === 'NOT_FOUND', 'Lanza ApiError NOT_FOUND');
  }
  assert(cb.getState() === 'CLOSED', 'Estado sigue siendo CLOSED con error 404');
  assert(cb.getStats().consecutiveFailures === 0, 'Consecutive failures no se incrementaron con 404');

  // Test 4: Consecutive 5xx/network failures trip circuit to OPEN
  console.log('\n--- Test 4: 3 fallos consecutivos disparan circuito a OPEN ---');
  for (let i = 1; i <= 3; i++) {
    try {
      await cb.execute(async () => {
        throw new Error('Connection refused');
      });
    } catch (e) {
      assert(e instanceof ApiError, `Intento ${i}: lanza ApiError`);
    }
  }
  assert(cb.getState() === 'OPEN', 'El circuito cambió a OPEN tras 3 fallos');

  // Test 5: While OPEN, requests fail fast (0ms) without calling underlying fn
  console.log('\n--- Test 5: Modo Fail-Fast (0ms) mientras el circuito está OPEN ---');
  let fnCalled = false;
  const start = Date.now();
  try {
    await cb.execute(async () => {
      fnCalled = true;
      return 'SHOULD_NOT_EXECUTE';
    });
    assert(false, 'Debería haber lanzado CircuitBreakerError');
  } catch (e) {
    const elapsed = Date.now() - start;
    assert(e instanceof CircuitBreakerError, 'Lanza CircuitBreakerError');
    assert(e.code === 'CIRCUIT_OPEN', 'Código es CIRCUIT_OPEN');
    assert(e.statusCode === 503, 'Código HTTP es 503');
    assert(fnCalled === false, 'La función subyacente NUNCA fue llamada (fail-fast)');
    assert(elapsed < 20, `Ejecución inmediata (${elapsed}ms < 20ms)`);
  }

  // Test 6: Cooldown transitions to HALF_OPEN
  console.log('\n--- Test 6: Cooldown transiciona a HALF_OPEN ---');
  await new Promise((r) => setTimeout(r, 220));
  assert(cb.getState() === 'HALF_OPEN', 'Transición automática a HALF_OPEN tras resetTimeout');

  // Test 7: Successful probe in HALF_OPEN resets circuit to CLOSED
  console.log('\n--- Test 7: Sonda exitosa en HALF_OPEN recupera a CLOSED ---');
  const probeRes = await cb.execute(async () => 'PROBE_HEALTHY');
  assert(probeRes === 'PROBE_HEALTHY', 'Sonda retorna resultado');
  assert(cb.getState() === 'CLOSED', 'Circuito vuelve a CLOSED');
  assert(cb.getStats().consecutiveFailures === 0, 'Contador de fallos reseteado a 0');

  // Test 8: Failed probe in HALF_OPEN trips immediately back to OPEN
  console.log('\n--- Test 8: Sonda fallida en HALF_OPEN vuelve a OPEN inmediatamente ---');
  // Disparamos a OPEN nuevamente
  cb.trip();
  assert(cb.getState() === 'OPEN', 'Forzado a OPEN');
  await new Promise((r) => setTimeout(r, 220));
  assert(cb.getState() === 'HALF_OPEN', 'Pasó a HALF_OPEN');
  try {
    await cb.execute(async () => {
      throw new Error('Backend still failing');
    });
  } catch (e) {
    assert(e instanceof ApiError, 'Lanza error');
  }
  assert(cb.getState() === 'OPEN', 'Sonda fallida devuelve circuito a OPEN de inmediato');

  // Test 9: Listener subscription receives state changes
  console.log('\n--- Test 9: Suscripción a eventos onStateChange ---');
  const statesObserved = [];
  const unsubscribe = cb.onStateChange((state) => {
    statesObserved.push(state);
  });
  cb.reset(); // to CLOSED
  assert(statesObserved.includes('CLOSED'), 'Listener recibió evento CLOSED');
  unsubscribe();

  // Test 10: Request timeout enforcement
  console.log('\n--- Test 10: Enforzamiento de timeout de petición ---');
  try {
    await cb.execute(async () => {
      await new Promise((r) => setTimeout(r, 300));
      return 'SLOW_RESPONSE';
    }, 50); // 50ms timeout override
    assert(false, 'Debería haber lanzado error de timeout');
  } catch (e) {
    assert(e instanceof ApiError, 'Lanza ApiError por timeout');
    assert(e.code === 'TIMEOUT', 'Código es TIMEOUT');
    assert(e.statusCode === 504, 'Status code es 504');
  }

  console.log(`\n========================================`);
  console.log(`Resultados: ${passed} pasados, ${failed} fallidos`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Error no capturado:', err);
  process.exit(1);
});
