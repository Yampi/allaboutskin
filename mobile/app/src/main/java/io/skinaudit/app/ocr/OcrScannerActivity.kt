package io.skinaudit.app.ocr

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
import io.skinaudit.app.network.ApiClient
import io.skinaudit.app.network.OcrAuditRequest
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
                Log.e(TAG, "Camera binding failed", exc)
            }

        }, ContextCompat.getMainExecutor(this))
    }

    @androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
    private fun processImageProxy(imageProxy: ImageProxy) {
        val mediaImage = imageProxy.image
        if (mediaImage != null && !isScanning) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)

            textRecognizer.process(image)
                .addOnSuccessListener { visionText ->
                    val rawText = visionText.text
                    if (containsCosmeticKeywords(rawText) && !isScanning) {
                        isScanning = true
                        onInciTextDetected(rawText)
                    }
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "ML Kit OCR recognition error", e)
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }

    /**
     * Fast on-device heuristic to detect cosmetic ingredient lists before sending to server.
     */
    private fun containsCosmeticKeywords(text: String): Boolean {
        val upper = text.uppercase()
        return upper.contains("INGREDIENTS") ||
                upper.contains("AQUA") ||
                upper.contains("WATER") ||
                upper.contains("NIACINAMIDE") ||
                upper.contains("ACID") ||
                upper.contains("GLYCERIN")
    }

    private fun onInciTextDetected(ocrText: String) {
        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = ApiClient.service.auditOcr(
                    OcrAuditRequest(ocrText = ocrText)
                )

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body() != null) {
                        Toast.makeText(
                            this@OcrScannerActivity,
                            "¡Fórmula escaneada y auditada con éxito!",
                            Toast.LENGTH_LONG
                        ).show()
                        finish()
                    } else {
                        isScanning = false
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send OCR payload to backend", e)
                isScanning = false
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
        private const val TAG = "SkinAuditOCR"
        private const val REQUEST_CODE_PERMISSIONS = 10
        private val REQUIRED_PERMISSIONS = arrayOf(Manifest.permission.CAMERA)
    }
}
