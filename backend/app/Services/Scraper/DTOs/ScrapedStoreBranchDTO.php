<?php

namespace App\Services\Scraper\DTOs;

class ScrapedStoreBranchDTO
{
    public function __construct(
        public string $storeSlug,
        public string $name,
        public string $address,
        public ?string $referencePoint = null,
        public string $city = 'Valle de la Pascua',
        public string $state = 'Guárico',
        public ?float $latitude = null,
        public ?float $longitude = null,
        public ?string $phone = null,
        public ?string $whatsapp = null,
        public ?string $openingHours = null,
        public int $geofenceRadiusMeters = 90,
        public bool $isActive = true,
        public array $rawMetadata = []
    ) {}

    public function toArray(): array
    {
        return [
            'store_slug' => $this->storeSlug,
            'name' => $this->name,
            'address' => $this->address,
            'reference_point' => $this->referencePoint,
            'city' => $this->city,
            'state' => $this->state,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'opening_hours' => $this->openingHours,
            'geofence_radius_meters' => $this->geofenceRadiusMeters,
            'is_active' => $this->isActive,
        ];
    }
}
