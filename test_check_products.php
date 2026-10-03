<?php

require 'backend/vendor/autoload.php';
$app = require_once 'backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;

$count = Product::count();
echo "Total Real Products in PostgreSQL: {$count}\n";

$products = Product::with(['brand', 'storeOffers.store', 'ingredients'])->take(15)->get();
foreach ($products as $p) {
    echo sprintf(
        "ID %-3d | %-45s | %-15s | Offers: %d | Actives: %d\n",
        $p->id,
        substr($p->name, 0, 45),
        substr($p->brand?->name ?? 'N/A', 0, 15),
        $p->storeOffers->count(),
        $p->ingredients->count()
    );
}
