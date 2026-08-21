package skin.allabout.app.network

import com.google.gson.annotations.SerializedName
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import java.util.concurrent.TimeUnit

interface AllAboutSkinApiService {

    @POST("audit/ocr")
    suspend fun auditOcr(
        @Body request: OcrAuditRequest
    ): Response<AuditApiResponse>

    @POST("audit/inci")
    suspend fun auditInci(
        @Body request: InciAuditRequest
    ): Response<AuditApiResponse>

    @GET("routine/today")
    suspend fun getTodayRoutine(): Response<RoutineApiResponse>

    @GET("lifecycle/items")
    suspend fun getLifecycleItems(): Response<LifecycleApiResponse>
}

data class OcrAuditRequest(
    @SerializedName("ocr_text") val ocrText: String,
    @SerializedName("product_name") val productName: String? = null
)

data class InciAuditRequest(
    @SerializedName("inci_text") val inciText: String,
    @SerializedName("product_name") val productName: String? = null
)

data class AuditApiResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: Map<String, Any>
)

data class RoutineApiResponse(
    @SerializedName("status") val status: String,
    @SerializedName("data") val data: Map<String, Any>
)

data class LifecycleApiResponse(
    @SerializedName("status") val status: String,
    @SerializedName("summary") val summary: Map<String, Any>,
    @SerializedName("data") val data: List<Map<String, Any>>
)

object ApiClient {
    private const val BASE_URL = "https://api.allabout.skin/api/v1/"

    val service: AllAboutSkinApiService by lazy {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build()

        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AllAboutSkinApiService::class.java)
    }
}
