<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'group',
        'value',
        'type',
        'description',
        'is_public',
    ];

    /**
     * Retrieve a setting value with caching
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("system_setting:{$key}", 3600, function () use ($key, $default) {
            $setting = self::where('key', $key)->first();
            if (!$setting) {
                return $default;
            }

            return $setting->getFormattedValue();
        });
    }

    /**
     * Set a setting value and clear cache
     */
    public static function set(string $key, mixed $value, string $group = 'general', string $type = 'string', ?string $description = null): self
    {
        $rawValue = $value;
        if ($type === 'json' || is_array($value)) {
            $rawValue = json_encode($value);
            $type = 'json';
        } elseif ($type === 'boolean') {
            $rawValue = $value ? '1' : '0';
        } elseif ($type === 'encrypted' && $value !== null) {
            $rawValue = Crypt::encryptString((string) $value);
        }

        $setting = self::updateOrCreate(
            ['key' => $key],
            [
                'group' => $group,
                'value' => (string) $rawValue,
                'type' => $type,
                'description' => $description,
            ]
        );

        Cache::forget("system_setting:{$key}");

        return $setting;
    }

    public function getFormattedValue(): mixed
    {
        if ($this->value === null) {
            return null;
        }

        return match ($this->type) {
            'integer', 'int' => (int) $this->value,
            'float' => (float) $this->value,
            'boolean', 'bool' => in_array(strtolower((string) $this->value), ['1', 'true', 'yes', 'on'], true),
            'json' => json_decode($this->value, true),
            'encrypted' => $this->decryptValue(),
            default => $this->value,
        };
    }

    private function decryptValue(): ?string
    {
        try {
            return Crypt::decryptString($this->value);
        } catch (\Throwable) {
            return null;
        }
    }
}
