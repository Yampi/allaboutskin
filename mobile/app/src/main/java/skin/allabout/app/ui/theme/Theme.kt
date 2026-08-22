package skin.allabout.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = SagePrimary,
    onPrimary = SurfacePure,
    primaryContainer = SageLight,
    onPrimaryContainer = SagePrimary,
    secondary = SageAccent,
    onSecondary = SurfacePure,
    tertiary = BlushPrimary,
    onTertiary = SurfacePure,
    tertiaryContainer = BlushSoft,
    onTertiaryContainer = BlushPrimary,
    background = Linen,
    onBackground = TextCharcoal,
    surface = SurfacePure,
    onSurface = TextCharcoal,
    surfaceVariant = SurfaceCard,
    onSurfaceVariant = TextMuted,
    outline = BorderIvory
)

@Composable
fun AllAboutSkinTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    // We prioritize the soothing Soft Clinical Linen aesthetic
    val colorScheme = LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
