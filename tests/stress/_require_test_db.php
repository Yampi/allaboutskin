<?php
/**
 * Guarda de seguridad para los harness que ESCRIBEN datos.
 *
 * Se incluye justo después de `$kernel->bootstrap()`. Aborta si la conexión no apunta
 * a una base de datos de pruebas (nombre terminado en `_test`), para no ensuciar la BD
 * de desarrollo con tiendas y productos de prueba.
 *
 * Uso (desde la raíz del repo):
 *   DB_DATABASE=allaboutskin_test php tests/stress/acid_stress_harness.php
 */

$database = Illuminate\Support\Facades\DB::connection()->getDatabaseName();

if (!str_ends_with($database, '_test')) {
    fwrite(STDERR, "ABORTADO: este harness escribe datos y la BD activa es '{$database}'.\n");
    fwrite(STDERR, "Ejecútalo contra la BD de pruebas, por ejemplo:\n");
    fwrite(STDERR, "  DB_DATABASE=allaboutskin_test php " . ($_SERVER['argv'][0] ?? 'tests/stress/<harness>.php') . "\n");
    exit(1);
}
