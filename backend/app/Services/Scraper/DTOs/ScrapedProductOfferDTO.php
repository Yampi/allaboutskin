<?php

namespace App\Services\Scraper\DTOs;

class ScrapedProductOfferDTO
{
    public function __construct(
        public string $storeSlug,
        public string $productName,
        public ?string $brandName = null,
        public ?string $barcodeEan = null,
        public ?string $category = 'MISCELLANEOUS',
        public float $price = 0.0,
        public ?float $priceVes = null,
        public string $currency = 'USD',
        public bool $inStock = true,
        public ?string $productUrl = null,
        public ?string $imageUrl = null,
        public ?string $branchSlug = null,
        public array $rawMetadata = [],
        public ?float $priceLocal = null,
        public ?string $currencyLocal = null
    ) {}

    public function toArray(): array
    {
        return [
            'store_slug' => $this->storeSlug,
            'product_name' => $this->productName,
            'brand_name' => $this->brandName,
            'barcode_ean' => $this->barcodeEan,
            'category' => $this->category,
            'price' => $this->price,
            'price_ves' => $this->priceVes,
            'price_local' => $this->priceLocal,
            'currency' => $this->currency,
            'currency_local' => $this->currencyLocal,
            'in_stock' => $this->inStock,
            'product_url' => $this->productUrl,
            'image_url' => $this->imageUrl,
            'branch_slug' => $this->branchSlug,
        ];
    }
}
