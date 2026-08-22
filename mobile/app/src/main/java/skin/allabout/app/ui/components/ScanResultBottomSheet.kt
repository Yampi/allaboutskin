package skin.allabout.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import skin.allabout.app.ui.theme.*

data class QuickAuditSummary(
    val productName: String,
    val safetyScore: Int, // 0 - 100
    val safetyRating: String, // "EXCELENTE", "BUENO", "PRECAUCIÓN"
    val cleanIngredientsRatio: String, // "9/10"
    val isFragranceFree: Boolean,
    val isVegan: Boolean,
    val compatibleSkinTypes: List<String>
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScanResultBottomSheet(
    summary: QuickAuditSummary,
    onSaveToRoutine: () -> Unit,
    onViewFullScientificReport: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Linen,
        dragHandle = {
            BottomSheetDefaults.DragHandle(
                color = BorderIvory,
                width = 40.dp,
                height = 4.dp
            )
        },
        shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 12.dp)
                .padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header: Product & Score Dial
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "ANÁLISIS INSTANTÁNEO",
                        color = TextLight,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = summary.productName,
                        color = TextCharcoal,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Circular Safety Score Dial
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .size(56.dp)
                        .clip(CircleShape)
                        .background(SageLight)
                        .border(2.dp, SageAccent, CircleShape)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "${summary.safetyScore}",
                            color = SagePrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Text(
                            text = "/100",
                            color = TextMuted,
                            fontSize = 8.sp
                        )
                    }
                }
            }

            Divider(color = BorderIvory, thickness = 1.dp)

            // Badges: Clean, Fragrance-Free, Vegan
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                AssistChip(
                    onClick = {},
                    label = { Text("Ingredientes Limpios: ${summary.cleanIngredientsRatio}", fontSize = 11.sp) },
                    leadingIcon = {
                        Icon(Icons.Default.Check, contentDescription = null, tint = GreenSafe, modifier = Modifier.size(14.dp))
                    },
                    colors = AssistChipDefaults.assistChipColors(
                        containerColor = SurfacePure,
                        labelColor = TextCharcoal
                    ),
                    border = AssistChipDefaults.assistChipBorder(borderColor = BorderIvory)
                )

                if (summary.isFragranceFree) {
                    AssistChip(
                        onClick = {},
                        label = { Text("Sin Perfume", fontSize = 11.sp) },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = SurfacePure,
                            labelColor = TextCharcoal
                        ),
                        border = AssistChipDefaults.assistChipBorder(borderColor = BorderIvory)
                    )
                }
            }

            // CTAs
            Button(
                onClick = onSaveToRoutine,
                colors = ButtonDefaults.buttonColors(
                    containerColor = SagePrimary,
                    contentColor = SurfacePure
                ),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Favorite,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Guardar en Mi Rutina",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }

            OutlinedButton(
                onClick = onViewFullScientificReport,
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = SagePrimary
                ),
                border = androidx.compose.foundation.BorderStroke(1.dp, SageAccent.copy(alpha = 0.5f)),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(44.dp)
            ) {
                Text(
                    text = "Ver Informe Científico Completo (CosIng / PubMed)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}
