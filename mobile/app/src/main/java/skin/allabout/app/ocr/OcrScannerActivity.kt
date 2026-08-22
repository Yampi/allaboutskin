package skin.allabout.app.ocr

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import skin.allabout.app.network.ApiClient
import skin.allabout.app.network.OcrAuditRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class OcrScannerActivity : AppCompatActivity() {

    private lateinit var cameraExecutor: ExecutorService
    private lateinit var textRecognizer: TextRecognizer
    private var imageCapture: ImageCapture? = null
    private var isScanning = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Google ML Kit on-device Text Recognizer
        textRecognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
        cameraExecutor = Executors.newSingleThreadExecutor()

        if (allPermissionsGranted()) {
            startCamera()
        } else {
            ActivityCompat.requestPermissions(
                this, REQUIRED_PERMISSIONS, REQUEST_CODE_PERMISSIONS
            )
        }
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)

        cameraProviderFuture.addListener({
            val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build()
            imageCapture = ImageCapture.Builder().build()

            val imageAnalyzer = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()
                .also {
                    it.setAnalyzer(cameraExecutor) { imageProxy ->
                        processImageProxy(imageProxy)
                    }
                }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    this, cameraSelector, preview, imageCapture, imageAnalyzer
                )
            } catch (exc: Exception) {
                Log.e(TAG, "Error al iniciar la cámara", exc)
            }

        }, ContextCompat.getMainExecutor(this))
    }

    @androidx.annotation.OptIn(ExperimentalGetImage::class)
    private fun processImageProxy(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage != null && !isScanning) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

            textRecognizer.process(image)
                .addOnSuccessListener { visionText ->
                    val detectedText = visionText.text
                    if (detectedText.isNotBlank() && (isLikelyInciList(detectedText) || isLikelyProductFront(detectedText))) {
                        isScanning = true
                        analyzeOcrOnServer(detectedText)
                    }
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "Fallo en reconocimiento ML Kit", e)
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }

    /**
     * Heurística amigable para identificar si es una lista química INCI (reverso).
     */
    private fun isLikelyInciList(text: String): Boolean {
        val upper = text.uppercase()
        val keywords = listOf("INGREDIENTS", "INGREDIENTES", "INCI", "AQUA", "WATER", "GLYCERIN", "ALCOHOL", "ACID", "NIACINAMIDE", "RETINOL")
        val matchCount = keywords.count { upper.contains(it) }
        return matchCount >= 2 || (upper.contains(",") && upper.length > 30)
    }

    /**
     * Heurística para detectar si el usuario enfoca el frente de una marca conocida de cosméticos.
     */
    private fun isLikelyProductFront(text: String): Boolean {
        val upper = text.uppercase()
        val popularBrands = listOf("HAWAIIAN", "FARMATODO", "THE ORDINARY", "CERAVE", "LA ROCHE", "EUCERIN", "ISDIN", "NEUTROGENA", "NIVEA")
        return popularBrands.any { upper.contains(it) } && text.length in 10..120
    }

    private fun analyzeOcrOnServer(rawText: String) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = ApiClient.service.auditOcr(
                    OcrAuditRequest(ocrText = rawText)
                )

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body() != null) {
                        Toast.makeText(this@OcrScannerActivity, "¡Producto identificado!", Toast.LENGTH_SHORT).show()
                        setResult(RESULT_OK, Intent().apply {
                            putExtra("RAW_OCR", rawText)
                            putExtra("DEFAULT_VIEW_MODE", "SIMPLE")
                        })
                        finish()
                    } else {
                        isScanning = false
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error al auditar OCR", e)
                withContext(Dispatchers.Main) {
                    isScanning = false
                }
            }
        }
    }

    private fun allPermissionsGranted() = REQUIRED_PERMISSIONS.all {
        ContextCompat.checkSelfPermission(baseContext, it) == PackageManager.PERMISSION_GRANTED
    }

    override fun onDestroy() {
        super.onDestroy()
        cameraExecutor.shutdown()
        textRecognizer.close()
    }

    companion object {
        private const val TAG = "AllAboutSkinOCR"
        private const val REQUEST_CODE_PERMISSIONS = 10
        private val REQUIRED_PERMISSIONS = arrayOf(Manifest.permission.CAMERA)
    }
}
