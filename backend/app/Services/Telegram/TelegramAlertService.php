<?php

declare(strict_types=1);

namespace App\Services\Telegram;

use App\Models\AffiliateStore;
use App\Models\StoreBranch;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramAlertService
{
    protected ?string $botToken;
    protected ?string $chatId;
    protected string $frontendUrl;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token');
        $this->chatId = config('services.telegram.chat_id');
        $this->frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
    }

    /**
     * Envía un mensaje en formato HTML a través de la API oficial de Telegram.
     * Es no-bloqueante y tolerante a fallos (no interrumpe el flujo si Telegram falla).
     */
    public function sendRawMessage(string $text, string $parseMode = 'HTML'): bool
    {
        if (empty($this->botToken) || empty($this->chatId)) {
            Log::info('TelegramAlertService: Bot token o chat ID no configurados.');
            return false;
        }

        try {
            $response = Http::timeout(5)->post("https://api.telegram.org/bot{$this->botToken}/sendMessage", [
                'chat_id' => $this->chatId,
                'text' => $text,
                'parse_mode' => $parseMode,
                'disable_web_page_preview' => true,
            ]);

            if (!$response->successful()) {
                Log::warning('TelegramAlertService: Error al enviar mensaje', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('TelegramAlertService: Excepción de conexión', [
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Alerta instantánea de alta prioridad: Nueva tienda comercial registrada.
     */
    public function notifyNewStore(AffiliateStore $store, ?StoreBranch $branch = null): bool
    {
        $city = $branch?->city ?? 'No especificada';
        $state = $branch?->state ?? '';
        $location = $state ? "{$city}, {$state}" : $city;

        $phoneClean = preg_replace('/[^0-9]/', '', $store->whatsapp_contact ?? '');
        $whatsappLink = $phoneClean ? "https://wa.me/{$phoneClean}" : '#';
        $adminStoreUrl = "{$this->frontendUrl}/admin?tab=stores&storeId={$store->id}";

        $message = "🏬 <b>NUEVA TIENDA REGISTRADA</b>\n\n"
            . "• <b>Nombre:</b> " . htmlspecialchars($store->name) . "\n"
            . "• <b>Ubicación:</b> " . htmlspecialchars($location) . "\n"
            . "• <b>WhatsApp:</b> <a href=\"{$whatsappLink}\">" . htmlspecialchars($store->whatsapp_contact ?? 'Sin número') . "</a>\n"
            . "• <b>Email Registro:</b> " . htmlspecialchars($store->submitted_by_email ?? 'N/A') . "\n"
            . "• <b>Estado:</b> ⏳ <code>PENDIENTE DE REVISIÓN</code>\n\n"
            . "👉 <a href=\"{$adminStoreUrl}\">Abrir y Validar en Panel Admin</a>";

        return $this->sendRawMessage($message);
    }

    /**
     * Alerta instantánea: Disputa o reporte de usuario sobre una tienda o producto.
     */
    public function notifyDispute(string $userName, string $storeName, string $reason, string $details): bool
    {
        $adminUrl = "{$this->frontendUrl}/admin?tab=disputes";

        $message = "⚠️ <b>ALERTA DE DISPUTA / REPORTE</b>\n\n"
            . "• <b>Usuario:</b> " . htmlspecialchars($userName) . "\n"
            . "• <b>Tienda Reportada:</b> " . htmlspecialchars($storeName) . "\n"
            . "• <b>Motivo:</b> " . htmlspecialchars($reason) . "\n"
            . "• <b>Detalle:</b> " . htmlspecialchars($details) . "\n\n"
            . "👉 <a href=\"{$adminUrl}\">Gestionar en Panel Admin</a>";

        return $this->sendRawMessage($message);
    }

    /**
     * Alerta de incidente técnico crítico o error no controlado en auditoría.
     */
    public function notifyCriticalError(string $context, string $errorMessage, ?int $userId = null): bool
    {
        $logsUrl = "{$this->frontendUrl}/admin?tab=security";
        $userTag = $userId ? "#{$userId}" : "Anónimo / Visitante";

        $message = "🚨 <b>INCIDENTE TÉCNICO DETECTADO</b>\n\n"
            . "• <b>Contexto:</b> " . htmlspecialchars($context) . "\n"
            . "• <b>Usuario:</b> {$userTag}\n"
            . "• <b>Error:</b> <code>" . htmlspecialchars(substr($errorMessage, 0, 250)) . "</code>\n"
            . "• <b>Hora:</b> " . now()->format('Y-m-d H:i:s') . "\n\n"
            . "👉 <a href=\"{$logsUrl}\">Ver Logs de Seguridad</a>";

        return $this->sendRawMessage($message);
    }

    /**
     * Reporte Agregado Diario (Digest / El Pulso del Día).
     */
    public function sendDailyDigest(array $stats): bool
    {
        $date = now()->format('d/m/Y');
        $newUsers = $stats['new_users'] ?? 0;
        $totalUsers = $stats['total_users'] ?? 0;
        $scansCount = $stats['scans_count'] ?? 0;
        $newStores = $stats['new_stores'] ?? 0;
        $pendingStores = $stats['pending_stores'] ?? 0;
        $whatsappLeads = $stats['whatsapp_leads'] ?? 0;
        $topIngredient = $stats['top_ingredient'] ?? 'Niacinamida';

        $message = "📊 <b>PULSO DEL DÍA — ALLABOUT.SKIN</b>\n"
            . "<i>Fecha: {$date}</i>\n\n"
            . "👤 <b>Usuarios:</b>\n"
            . "• Nuevos registros hoy: <b>{$newUsers}</b>\n"
            . "• Total registrados: <b>{$totalUsers}</b>\n\n"
            . "🧪 <b>Actividad Dermatológica:</b>\n"
            . "• Escaneos / Consultas INCI: <b>{$scansCount}</b>\n"
            . "• Ingrediente más buscado: <b>{$topIngredient}</b>\n\n"
            . "🏬 <b>Ecosistema Comercial:</b>\n"
            . "• Nuevas tiendas registradas: <b>{$newStores}</b>\n"
            . "• Tiendas pendientes de validar: <b>{$pendingStores}</b>\n"
            . "• Clics generados hacia WhatsApp de tiendas: <b>{$whatsappLeads}</b>\n\n"
            . "✅ <i>Todos los sistemas operativos.</i>";

        return $this->sendRawMessage($message);
    }
}
