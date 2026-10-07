<?php

namespace App\Console\Commands;

use App\Domain\Auth\Enums\UserRole;
use App\Domain\Store\Enums\StoreSubscriptionTier;
use App\Models\AffiliateStore;
use App\Models\Product;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use App\Models\StoreLeadInteraction;
use App\Models\User;
use App\Models\UserRoutineItem;
use App\Models\UserSkinProfile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SetupTestUsersCommand extends Command
{
    protected $signature = 'app:setup-test-users';

    protected $description = 'Configura los 3 usuarios de prueba para validar la triada de dashboards (Paciente, Tienda, Super Admin).';

    public function handle(): int
    {
        $this->info('Iniciando configuración de usuarios de prueba para Allabout.skin...');
        $password = 'Password123!';

        // -------------------------------------------------------------
        // 1. PACIENTE / CONSUMIDOR (standard_user) -> /dashboard/usuario
        // -------------------------------------------------------------
        $pacienteEmail = 'paciente@allaboutskin.com';
        $paciente = User::firstOrNew(['email' => $pacienteEmail]);
        $paciente->name = 'Valentina Ramos (Paciente)';
        $paciente->password = Hash::make($password);
        $paciente->role = UserRole::STANDARD_USER;
        $paciente->is_active = true;
        $paciente->email_verified_at = now();
        $paciente->save();

        UserSkinProfile::updateOrCreate(
            ['user_id' => $paciente->id],
            [
                'skin_type' => 'COMBINATION',
                'fitzpatrick_type' => 3,
                'barrier_status' => 'HEALTHY',
                'active_conditions' => ['DESHIDRATACION', 'BARRERA_COMPROMETIDA'],
                'known_allergens' => ['FRAGRANCE', 'ESSENTIAL_OILS'],
                'sun_exposure_level' => 'MODERATE',
            ]
        );

        // Rutinas de muestra con productos del catálogo
        UserRoutineItem::where('user_id', $paciente->id)->delete();
        $products = Product::limit(5)->get();

        if ($products->count() >= 4) {
            UserRoutineItem::create([
                'user_id' => $paciente->id,
                'product_id' => $products[3]->id, // CeraVe Gel Limpiador
                'custom_name' => $products[3]->name,
                'slot' => 'AM',
                'cycle_type' => 'EVERYDAY',
                'step_order' => 1,
                'opened_at' => now()->subDays(25),
                'notes' => 'Paso 1: Limpieza suave sin sulfatos',
            ]);

            UserRoutineItem::create([
                'user_id' => $paciente->id,
                'product_id' => $products[0]->id, // Niacinamide 10%
                'custom_name' => $products[0]->name,
                'slot' => 'AM',
                'cycle_type' => 'EVERYDAY',
                'step_order' => 2,
                'opened_at' => now()->subDays(18),
                'notes' => 'Paso 2: Seborregulación y soporte de barrera',
            ]);

            UserRoutineItem::create([
                'user_id' => $paciente->id,
                'product_id' => $products[1]->id, // BHA Liquid Exfoliant
                'custom_name' => $products[1]->name,
                'slot' => 'PM',
                'cycle_type' => 'EXFOLIATION_NIGHT',
                'step_order' => 2,
                'opened_at' => now()->subDays(12),
                'notes' => 'Noche 1 del Skin Cycling: Exfoliación química suave',
            ]);

            UserRoutineItem::create([
                'user_id' => $paciente->id,
                'product_id' => $products[2]->id, // Retinol 0.5%
                'custom_name' => $products[2]->name,
                'slot' => 'PM',
                'cycle_type' => 'RETINOID_NIGHT',
                'step_order' => 2,
                'opened_at' => now()->subDays(5),
                'notes' => 'Noche 2 del Skin Cycling: Renovación celular retinoides',
            ]);

            UserRoutineItem::create([
                'user_id' => $paciente->id,
                'product_id' => $products[4]->id, // Neutrogena Hydro Boost
                'custom_name' => $products[4]->name,
                'slot' => 'PM',
                'cycle_type' => 'RECOVERY_NIGHT',
                'step_order' => 3,
                'opened_at' => now()->subDays(20),
                'notes' => 'Noches 3 y 4: Sellado de barrera cutánea',
            ]);
        }
        $this->line("  [✓] Paciente: {$pacienteEmail} | Password: {$password} | Rol: standard_user");

        // -------------------------------------------------------------
        // 2. COMERCIO / FARMACIA (business_owner) -> /dashboard/empresa
        // -------------------------------------------------------------
        $tiendaEmail = 'tienda@allaboutskin.com';
        $comercioUser = User::firstOrNew(['email' => $tiendaEmail]);
        $comercioUser->name = 'Carlos Mendoza (Comercio)';
        $comercioUser->password = Hash::make($password);
        $comercioUser->role = UserRole::BUSINESS_OWNER;
        $comercioUser->is_active = true;
        $comercioUser->email_verified_at = now();
        $comercioUser->save();

        $store = AffiliateStore::firstOrNew(['slug' => 'farmacia-dermapiel-express']);
        $store->name = 'Farmacia Dermapiel Express';
        $store->owner_id = $comercioUser->id;
        $store->website_url = 'https://dermapielexpress.com';
        $store->logo_url = 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=150';
        $store->store_type = 'HYBRID';
        $store->country_code = 'VE';
        $store->instagram_handle = 'dermapielexpress';
        $store->whatsapp_contact = '+584121234567';
        $store->is_independent = true;
        $store->is_featured = true;
        $store->verification_status = 'VERIFIED';
        $store->is_active = true;
        $store->verified_at = now();
        $store->subscription_tier = StoreSubscriptionTier::PRO_LOCAL;
        $store->subscription_expires_at = now()->addMonths(6);
        $store->save();

        $branch = StoreBranch::firstOrNew([
            'store_id' => $store->id,
            'name' => 'Sede Principal Calle Real',
        ]);
        $branch->slug = 'sede-principal-calle-real';
        $branch->city = 'Valle de la Pascua';
        $branch->state = 'Guárico';
        $branch->address = 'Av. Rómulo Gallegos cruce con Calle Real, Local 4';
        $branch->reference_point = 'Frente a la Plaza Bolívar';
        $branch->phone = '+58 235 341 5566';
        $branch->whatsapp = '+58 412 123 4567';
        $branch->opening_hours = 'Lunes a Sábado: 8:00 AM - 7:00 PM';
        $branch->latitude = 9.2150;
        $branch->longitude = -66.0100;
        $branch->is_active = true;
        $branch->is_verified = true;
        $branch->last_verified_at = now();
        $branch->save();

        // Crear ofertas vinculadas a la tienda y sucursal
        if ($products->count() > 0) {
            $samplePrices = [
                ['price' => 14.50, 'price_ves' => 652.50],
                ['price' => 38.00, 'price_ves' => 1710.00],
                ['price' => 16.00, 'price_ves' => 720.00],
                ['price' => 19.50, 'price_ves' => 877.50],
                ['price' => 22.00, 'price_ves' => 990.00],
            ];

            foreach ($products as $idx => $prod) {
                $pricing = $samplePrices[$idx % count($samplePrices)];
                ProductStoreOffer::updateOrCreate(
                    [
                        'store_id' => $store->id,
                        'product_id' => $prod->id,
                        'branch_id' => $branch->id,
                    ],
                    [
                        'product_url' => 'https://dermapielexpress.com/p/' . $prod->slug,
                        'affiliate_url' => 'https://dermapielexpress.com/p/' . $prod->slug,
                        'price' => $pricing['price'],
                        'price_ves' => $pricing['price_ves'],
                        'currency' => 'USD',
                        'in_stock' => true,
                        'last_checked_at' => now(),
                    ]
                );
            }
        }

        // Generar leads interactivos de muestra en los últimos 7 días
        for ($i = 0; $i < 14; $i++) {
            StoreLeadInteraction::create([
                'store_id' => $store->id,
                'branch_id' => $branch->id,
                'user_id' => $paciente->id,
                'interaction_type' => $i % 3 === 0 ? 'WHATSAPP_CLICK' : ($i % 2 === 0 ? 'STORE_PROFILE_VIEW' : 'OFFER_CLICK'),
                'created_at' => now()->subDays(rand(0, 6))->subHours(rand(1, 12)),
            ]);
        }
        $this->line("  [✓] Comercio: {$tiendaEmail} | Password: {$password} | Rol: business_owner");

        // -------------------------------------------------------------
        // 3. SUPER ADMIN (super_admin) -> /admin
        // -------------------------------------------------------------
        $adminEmail = 'admin@allaboutskin.com';
        $adminUser = User::firstOrNew(['email' => $adminEmail]);
        $adminUser->name = 'Super Administrador';
        $adminUser->password = Hash::make($password);
        $adminUser->role = UserRole::SUPER_ADMIN;
        $adminUser->is_active = true;
        $adminUser->email_verified_at = now();
        $adminUser->save();
        $this->line("  [✓] Super Admin: {$adminEmail} | Password: {$password} | Rol: super_admin");

        $this->info('Todos los perfiles de prueba han sido configurados correctamente.');

        return self::SUCCESS;
    }
}
