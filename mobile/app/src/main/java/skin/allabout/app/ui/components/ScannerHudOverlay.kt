package skin.allabout.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Science
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import skin.allabout.app.ui.theme.*

data class DetectedActiveChip(
    val name: String,
    val purpose: String,
    val safetyLevel: String // "SAFE", "CAUTION", "CONFLICT"
)

@Composable
fun ScannerHudOverlay(
    detectedActives: List<DetectedActiveChip>,
    isScanning: Boolean,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Scanning Reticle in Center
        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .size(280.dp, 360.dp)
                .border(
                    width = 2.dp,
                    color = if (detectedActives.isNotEmpty()) SageAccent else SageLight.copy(alpha = 0.6f),
                    shape = RoundedCornerShape(24.dp)
                )
        ) {
            if (isScanning) {
                // Subtle scan line or indicator
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(2.dp)
                        .background(
                            brush = Brush.horizontalGradient(
                                colors = listOf(Color.Transparent, SageAccent, Color.Transparent)
                            )
                        )
                        .align(Alignment.TopCenter)
                )
            }
        }

        // Live AR Detected Ingredient Callout Chips (Floating alongside bottle)
        Column(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 80.dp, end = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            detectedActives.forEach { active ->
                AnimatedVisibility(
                    visible = true,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    ActiveIngredientCalloutChip(active)
                }
            }
        }
    }
}

@Composable
fun ActiveIngredientCalloutChip(active: DetectedActiveChip) {
    val chipBorderColor = when (active.safetyLevel) {
        "SAFE" -> GreenSafe.copy(alpha = 0.4f)
        "CAUTION" -> YellowCaution.copy(alpha = 0.4f)
        else -> RedConflict.copy(alpha = 0.4f)
    }

    Surface(
        color = Linen.copy(alpha = 0.85f),
        shape = RoundedCornerShape(16.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, chipBorderColor),
        shadowElevation = 4.dp,
        modifier = Modifier.widthIn(max = 180.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Science,
                contentDescription = null,
                tint = SagePrimary,
                modifier = Modifier.size(16.dp)
            )
            Column {
                Text(
                    text = active.name,
                    color = TextCharcoal,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = active.purpose,
                    color = TextMuted,
                    fontSize = 9.sp
                )
            }
        }
    }
}
