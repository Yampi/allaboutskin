<?php

namespace Database\Seeders;

use App\Models\AffiliateStore;
use App\Models\Brand;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ValleDeLaPascuaStoresSeeder extends Seeder
{
    /**
     * Seed stores and branches for Valle de la Pascua, Edo. Guárico, Venezuela.
     */
    public function run(): void
    {
        // 1. Crear marcas y productos populares en anaqueles venezolanos si no existen
        $cerave = Brand::firstOrCreate(['slug' => 'cerave'], [
            'name' => 'CeraVe',
            'country_origin' => 'US',
            'is_verified' => true,
        ]);

        $neutrogena = Brand::firstOrCreate(['slug' => 'neutrogena'], [
            'name' => 'Neutrogena',
            'country_origin' => 'US',
            'is_verified' => true,
        ]);

        $nivea = Brand::firstOrCreate(['slug' => 'nivea'], [
            'name' => 'Nivea',
            'country_origin' => 'DE',
            'is_verified' => true,
        ]);

        // Crear productos comunes en anaqueles de supermercados y farmacias locales
        $prodCeraveFoaming = Product::firstOrCreate(['slug' => 'cerave-foaming-facial-cleanser'], [
            'brand_id' => $cerave->id,
            'name' => 'CeraVe Gel Limpiador Espumoso (236ml)',
            'category' => 'CLEANSER',
            'volume_amount' => 236.0,
            'pao_months' => 12,
            'ph_level' => 5.5,
            'barcode_ean' => '3337875597180',
            'is_verified' => true,
        ]);

        $prodHydroBoost = Product::firstOrCreate(['slug' => 'neutrogena-hydro-boost-water-gel'], [
            'brand_id' => $neutrogena->id,
            'name' => 'Neutrogena Hydro Boost Water Gel Ácido Hialurónico (50g)',
            'category' => 'MOISTURIZER',
            'volume_amount' => 50.0,
            'pao_months' => 12,
            'ph_level' => 6.0,
            'barcode_ean' => '7891010885236',
            'is_verified' => true,
        ]);

        $prodNiveaSun = Product::firstOrCreate(['slug' => 'nivea-sun-control-de-brillo-fps50'], [
            'brand_id' => $nivea->id,
            'name' => 'Nivea Sun UV Rostro Control de Brillo FPS 50+ (50ml)',
            'category' => 'SPF',
            'volume_amount' => 50.0,
            'pao_months' => 12,
            'ph_level' => 6.5,
            'barcode_ean' => '4005900593741',
            'is_verified' => true,
        ]);

        // Asociar ingredientes básicos a los productos para auditoría científica
        $niacinamide = Ingredient::where('inci_name', 'NIACINAMIDE')->first();
        if ($niacinamide && $prodCeraveFoaming->ingredients()->count() === 0) {
            $prodCeraveFoaming->ingredients()->attach([
                $niacinamide->id => ['position' => 3, 'concentration_percentage' => 1.5, 'is_declared_active' => true],
            ]);
        }

        // ==========================================
        // 2. CADENAS Y ESTABLECIMIENTOS EN VALLE DE LA PASCUA
        // ==========================================

        // Coordenadas aproximadas de Valle de la Pascua: Lat ~9.215, Lng ~-66.010
        // C.C. Traki / Av. Rómulo Gallegos: Lat 9.2185, Lng -66.0090
        // C.C. Valle de la Pascua (antiguo Hiper Galerías): Lat 9.2130, Lng -66.0125
        // Av. Libertador: Lat 9.2155, Lng -66.0110

        // A. Río Supermercado (Supermercado / Cuidado personal)
        $storeRio = AffiliateStore::updateOrCreate(['slug' => 'rio-supermercado'], [
            'name' => 'Río Supermercado',
            'website_url' => 'https://www.riosupermarket.com',
            'store_type' => 'HYBRID',
            'country_code' => 'VE',
            'affiliate_network' => 'Directo VE',
            'instagram_handle' => '@riosupermarket',
            'whatsapp_contact' => '+584121234567',
            'is_independent' => false,
            'verification_status' => 'VERIFIED',
            'is_active' => true,
        ]);

        $branchRioPascua = StoreBranch::updateOrCreate(['slug' => 'rio-supermercado-traki-valle-de-la-pascua'], [
            'store_id' => $storeRio->id,
            'name' => 'Río Supermercado - C.C. Traki',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'Av. Rómulo Gallegos, Centro Comercial Traki, Planta Baja, Local L-4',
            'reference_point' => 'C.C. Traki, PB frente a las escaleras mecánicas',
            'latitude' => 9.2185000,
            'longitude' => -66.0090000,
            'geofence_radius_meters' => 100,
            'phone' => '0235-3420000',
            'whatsapp' => '+584121234567',
            'opening_hours' => 'Lunes a Domingo: 8:00 AM - 9:00 PM',
            'is_active' => true,
        ]);

        // B. Mundo Total (Tienda por departamento con sección de cuidado personal y belleza)
        $storeMundoTotal = AffiliateStore::updateOrCreate(['slug' => 'mundo-total'], [
            'name' => 'Tiendas Mundo Total',
            'website_url' => 'https://www.mundototal.com.ve',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'affiliate_network' => 'Directo VE',
            'instagram_handle' => '@mundototal_ve',
            'whatsapp_contact' => '+584149876543',
            'is_independent' => false,
            'verification_status' => 'VERIFIED',
            'is_active' => true,
        ]);

        $branchMundoTotalPascua = StoreBranch::updateOrCreate(['slug' => 'mundo-total-cc-valle-de-la-pascua'], [
            'store_id' => $storeMundoTotal->id,
            'name' => 'Mundo Total - C.C. Valle de la Pascua',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'C.C. Valle de la Pascua (antiguo Hiper Galerías), Sector Centro',
            'reference_point' => 'Al lado de los ascensores principales',
            'latitude' => 9.2130000,
            'longitude' => -66.0125000,
            'geofence_radius_meters' => 90,
            'phone' => '0235-3421111',
            'whatsapp' => '+584149876543',
            'opening_hours' => 'Lunes a Sábado: 8:30 AM - 7:00 PM',
            'is_active' => true,
        ]);

        // C. Farmacia SAAS (Cadena nacional con múltiples sucursales en Valle de la Pascua)
        $storeSaas = AffiliateStore::updateOrCreate(['slug' => 'farmacia-saas'], [
            'name' => 'Farmacia SAAS',
            'website_url' => 'https://www.farmaciasaas.com',
            'store_type' => 'HYBRID',
            'country_code' => 'VE',
            'affiliate_network' => 'Farmacia VE',
            'instagram_handle' => '@redsaas',
            'whatsapp_contact' => '+584140001122',
            'is_independent' => false,
            'verification_status' => 'VERIFIED',
            'is_active' => true,
        ]);

        $branchSaasRomulo = StoreBranch::updateOrCreate(['slug' => 'farmacia-saas-romulo-gallegos-pascua'], [
            'store_id' => $storeSaas->id,
            'name' => 'Farmacia SAAS - Av. Rómulo Gallegos',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'Av. Rómulo Gallegos c/c Calle González Padrón',
            'reference_point' => 'Cerca de la Plaza Bolívar',
            'latitude' => 9.2178000,
            'longitude' => -66.0102000,
            'geofence_radius_meters' => 80,
            'phone' => '0235-3413344',
            'opening_hours' => '24 Horas / Turno rotativo',
            'is_active' => true,
        ]);

        $branchSaasTraki = StoreBranch::updateOrCreate(['slug' => 'farmacia-saas-atarraya-traki-pascua'], [
            'store_id' => $storeSaas->id,
            'name' => 'Farmacia SAAS - Calle Atarraya (Traki)',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'Calle Atarraya Sur, al lado de Traki',
            'reference_point' => 'Entrada lateral C.C. Traki',
            'latitude' => 9.2189000,
            'longitude' => -66.0086000,
            'geofence_radius_meters' => 80,
            'phone' => '0235-3415566',
            'opening_hours' => 'Lunes a Domingo: 8:00 AM - 8:00 PM',
            'is_active' => true,
        ]);

        // D. Farmahorro (Sucursal Valle de la Pascua)
        $storeFarmahorro = AffiliateStore::updateOrCreate(['slug' => 'farmahorro-ve'], [
            'name' => 'Farmahorro',
            'website_url' => 'https://www.farmahorro.com.ve',
            'store_type' => 'HYBRID',
            'country_code' => 'VE',
            'affiliate_network' => 'Farmacia VE',
            'instagram_handle' => '@farmahorrove',
            'is_independent' => false,
            'verification_status' => 'VERIFIED',
            'is_active' => true,
        ]);

        $branchFarmahorroPascua = StoreBranch::updateOrCreate(['slug' => 'farmahorro-av-libertador-pascua'], [
            'store_id' => $storeFarmahorro->id,
            'name' => 'Farmahorro - Av. Libertador',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'Av. Libertador N° 64, entre Calle Las Flores y Bolívar',
            'reference_point' => 'Frente a la parada de transporte',
            'latitude' => 9.2155000,
            'longitude' => -66.0110000,
            'geofence_radius_meters' => 80,
            'phone' => '0235-3426776',
            'opening_hours' => 'Lunes a Sábado: 7:30 AM - 7:30 PM',
            'is_active' => true,
        ]);

        // E. TIENDA INDEPENDIENTE LOCAL (Ejemplo representativo de comercio local de skincare/belleza)
        $storeDermoPascua = AffiliateStore::updateOrCreate(['slug' => 'dermopascua-tienda-de-belleza'], [
            'name' => 'DermoPascua & Belleza (Independiente)',
            'website_url' => 'https://instagram.com/dermopascua_store',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'affiliate_network' => 'Comercio Local',
            'instagram_handle' => '@dermopascua_store',
            'whatsapp_contact' => '+584243339988',
            'is_independent' => true,
            'verification_status' => 'VERIFIED',
            'submitted_by_email' => 'contacto@dermopascua.com',
            'community_notes' => 'Tienda local especializada en skincare coreano y dermocosmética importada en Valle de la Pascua.',
            'is_active' => true,
        ]);

        $branchDermoPascua = StoreBranch::updateOrCreate(['slug' => 'dermopascua-local-av-bolivar'], [
            'store_id' => $storeDermoPascua->id,
            'name' => 'DermoPascua - Calle Bolívar',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'Calle Bolívar cruce con Calle Retumbo, Local 3B',
            'reference_point' => 'A media cuadra de la Plaza Central',
            'latitude' => 9.2162000,
            'longitude' => -66.0105000,
            'geofence_radius_meters' => 70,
            'phone' => '0235-3419999',
            'whatsapp' => '+584243339988',
            'opening_hours' => 'Lunes a Sábado: 9:00 AM - 6:00 PM',
            'is_active' => true,
        ]);

        // F. Farmatodo (Configurado a nivel de catálogo nacional para disponibilidad online / futura sede)
        $storeFarmatodo = AffiliateStore::updateOrCreate(['slug' => 'farmatodo-ve'], [
            'name' => 'Farmatodo Venezuela',
            'website_url' => 'https://www.farmatodo.com.ve',
            'store_type' => 'HYBRID',
            'country_code' => 'VE',
            'affiliate_network' => 'Directo VE',
            'instagram_handle' => '@farmatodovzla',
            'is_independent' => false,
            'verification_status' => 'VERIFIED',
            'is_active' => true,
        ]);

        // ==========================================
        // 3. ASOCIAR OFERTAS Y DISPONIBILIDAD EN TIENDAS
        // ==========================================

        // Tasa referencial aprox (ej. 1 USD = 70 VES)
        $rateVes = 70.0;

        // Ofertas en Río Supermercado (C.C. Traki)
        ProductStoreOffer::updateOrCreate([
            'product_id' => $prodCeraveFoaming->id,
            'store_id' => $storeRio->id,
            'branch_id' => $branchRioPascua->id,
        ], [
            'product_url' => 'https://www.riosupermarket.com',
            'affiliate_url' => 'https://www.riosupermarket.com',
            'price' => 16.50,
            'price_ves' => 16.50 * $rateVes,
            'currency' => 'USD',
            'in_stock' => true,
            'last_checked_at' => now(),
        ]);

        ProductStoreOffer::updateOrCreate([
            'product_id' => $prodHydroBoost->id,
            'store_id' => $storeRio->id,
            'branch_id' => $branchRioPascua->id,
        ], [
            'product_url' => 'https://www.riosupermarket.com',
            'affiliate_url' => 'https://www.riosupermarket.com',
            'price' => 18.00,
            'price_ves' => 18.00 * $rateVes,
            'currency' => 'USD',
            'in_stock' => true,
            'last_checked_at' => now(),
        ]);

        ProductStoreOffer::updateOrCreate([
            'product_id' => $prodNiveaSun->id,
            'store_id' => $storeRio->id,
            'branch_id' => $branchRioPascua->id,
        ], [
            'product_url' => 'https://www.riosupermarket.com',
            'affiliate_url' => 'https://www.riosupermarket.com',
            'price' => 13.50,
            'price_ves' => 13.50 * $rateVes,
            'currency' => 'USD',
            'in_stock' => true,
            'last_checked_at' => now(),
        ]);

        // Ofertas en Mundo Total Pascua
        ProductStoreOffer::updateOrCreate([
            'product_id' => $prodNiveaSun->id,
            'store_id' => $storeMundoTotal->id,
            'branch_id' => $branchMundoTotalPascua->id,
        ], [
            'product_url' => 'https://www.mundototal.com.ve',
            'affiliate_url' => 'https://www.mundototal.com.ve',
            'price' => 12.99,
            'price_ves' => 12.99 * $rateVes,
            'currency' => 'USD',
            'in_stock' => true,
            'last_checked_at' => now(),
        ]);

        // Ofertas en Farmacias SAAS (Av. Rómulo Gallegos)
        $prodBha = Product::where('slug', 'paulas-choice-skin-perfecting-2-bha-liquid')->first();
        if ($prodBha) {
            ProductStoreOffer::updateOrCreate([
                'product_id' => $prodBha->id,
                'store_id' => $storeSaas->id,
                'branch_id' => $branchSaasRomulo->id,
            ], [
                'product_url' => 'https://www.farmaciasaas.com',
                'affiliate_url' => 'https://www.farmaciasaas.com',
                'price' => 38.00,
                'price_ves' => 38.00 * $rateVes,
                'currency' => 'USD',
                'in_stock' => true,
                'last_checked_at' => now(),
            ]);
        }

        // Ofertas en DermoPascua (Tienda local)
        $prodNiacinamide = Product::where('slug', 'the-ordinary-niacinamide-10-zinc-1')->first();
        if ($prodNiacinamide) {
            ProductStoreOffer::updateOrCreate([
                'product_id' => $prodNiacinamide->id,
                'store_id' => $storeDermoPascua->id,
                'branch_id' => $branchDermoPascua->id,
            ], [
                'product_url' => 'https://instagram.com/dermopascua_store',
                'affiliate_url' => 'https://instagram.com/dermopascua_store',
                'price' => 11.50,
                'price_ves' => 11.50 * $rateVes,
                'currency' => 'USD',
                'in_stock' => true,
                'last_checked_at' => now(),
            ]);
        }
    }
}
