package skin.allabout.app.workers

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import skin.allabout.app.network.ApiClient

class LifecycleAlertWorker(
    private val context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            val response = ApiClient.service.getLifecycleItems()

            if (response.isSuccessful && response.body() != null) {
                val items = response.body()!!.data

                for (item in items) {
                    val status = item["status"] as? String
                    val productName = item["product_name"] as? String ?: "Tu producto"
                    val daysRemaining = (item["days_remaining"] as? Double)?.toInt() ?: 0

                    if (status == "REORDER_RECOMMENDED" && daysRemaining <= 7) {
                        sendNotification(
                            title = "🧴 Reposición recomendada - allabout.skin",
                            message = "$productName se agotará en aprox. $daysRemaining días. Toca para ver ofertas locales y online."
                        )
                    } else if (status == "PAO_EXPIRED") {
                        sendNotification(
                            title = "⚠️ Alerta de Expiración PAO - allabout.skin",
                            message = "$productName ha superado su período de apertura seguro. Se sugiere renovarlo."
                        )
                    }
                }
            }

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private fun sendNotification(title: String, message: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channelId = "skincare_lifecycle_alerts"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Alertas de Reposición y PAO",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(context, channelId)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
}
