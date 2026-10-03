import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Camera,
  EyeOff,
  Database,
  FileCheck2,
  Cpu,
  MapPin,
  ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Tratamiento de Datos',
  description: 'Política de privacidad, protección de datos personales y salvaguarda de imágenes faciales y OCR bajo directiva DLG-EXEC.',
};

export default function PrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb DLG-EXEC */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-slate-800 transition-colors">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800">Privacidad & Datos</span>
      </nav>

      {/* Header Documento Legal */}
      <header className="border-b border-slate-200 pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 text-teal-900 border border-teal-200 text-xs font-semibold uppercase tracking-wider mb-4">
          <Lock className="w-3.5 h-3.5 text-teal-700" />
          <span>Privacidad por Diseño & Protección de Datos</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
          Política de Privacidad y Tratamiento de Datos
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          Garantizamos la máxima salvaguarda de su intimidad digital, con procesamiento efímero en el dispositivo del usuario para capturas de etiquetas y guías faciales.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
          <span>Versión: 1.0 (Edición 2026)</span>
          <span className="hidden sm:inline">•</span>
          <span>Última revisión: Octubre 2026</span>
          <span className="hidden sm:inline">•</span>
          <span>Compromiso de Cero Venta de Datos</span>
        </div>
      </header>

      {/* Principio Clave Callout */}
      <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-5 mb-10 text-slate-800 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-800 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-sm leading-relaxed">
            <h2 className="font-semibold text-teal-950">Compromiso Fundamental de Privacidad</h2>
            <p className="text-slate-700 text-xs sm:text-sm">
              Allabout.skin <strong>no comercializa ni cede bases de datos de usuarios a anunciantes ni terceros</strong>. La arquitectura del sistema está diseñada para procesar imágenes cosméticas y guías faciales de manera volátil y local, sin almacenar fotografías personales en servidores persistentes.
            </p>
          </div>
        </div>
      </div>

      {/* Articulado de Privacidad DLG-EXEC */}
      <article className="space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
        {/* Sección 1 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">01</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Tratamiento Especial de Fotografías Faciales y Guías Anatómicas (AR / 2D)
            </h2>
          </div>
          <p>
            Dada la sensibilidad de los datos de imagen corporal, aplicamos una política técnica estricta de <strong>procesamiento en el borde (Client-Side Edge Processing)</strong>:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs tracking-wider uppercase">
                <Camera className="w-4 h-4 text-teal-700" />
                <span>Cámara y Realidad Aumentada Facial</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                El flujo de video para el tutorial de aplicación facial y masaje linfático se procesa en tiempo real mediante aceleración por hardware en su navegador web. El fotograma de su rostro <strong>nunca se graba, no se transmite a servidores externos ni se almacena en disco</strong>. Al cerrar la pestaña o finalizar la sesión, el búfer de video se destruye inmediatamente.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs tracking-wider uppercase">
                <EyeOff className="w-4 h-4 text-teal-700" />
                <span>Cero Entrenamiento de Modelos Biométricos</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ninguna imagen capturada por la cámara del usuario se utiliza para entrenar algoritmos de reconocimiento facial, inteligencia artificial generativa de terceros ni modelos de perfilado biométrico.
              </p>
            </div>
          </div>
        </section>

        {/* Sección 2 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">02</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Capturas de Etiquetas Cosméticas y Reconocimiento OCR
            </h2>
          </div>
          <p>
            Cuando utiliza la herramienta de escaneo fotográfico de fórmulas e ingredientes cosméticos:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>La imagen del envase se analiza temporalmente a fin de extraer los caracteres alfanuméricos de la lista INCI.</li>
            <li>Una vez completada la tokenización del texto químico, la imagen original se descarta de la memoria volátil del servidor.</li>
            <li>Únicamente se conserva la lista normalizada de ingredientes vinculada al producto o al historial de auditoría de su cuenta si decide guardarla voluntariamente.</li>
          </ul>
        </section>

        {/* Sección 3 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">03</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Datos Personales Recopilados y Finalidades
            </h2>
          </div>
          <p>
            Recopilamos únicamente la información necesaria para brindarle el servicio personalizado:
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full text-xs text-left divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700 font-semibold">
                <tr>
                  <th scope="col" className="px-4 py-3">Categoría</th>
                  <th scope="col" className="px-4 py-3">Datos Específicos</th>
                  <th scope="col" className="px-4 py-3">Finalidad Exclusiva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Cuenta de Usuario</td>
                  <td className="px-4 py-3">Correo electrónico y contraseña cifrada con algoritmo seguro bcrypt.</td>
                  <td className="px-4 py-3">Autenticación, recuperación de credenciales y sincronización de rutinas.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Perfil Dérmico</td>
                  <td className="px-4 py-3">Tipo de piel declarado, preocupaciones cutáneas y fototipo Fitzpatrick.</td>
                  <td className="px-4 py-3">Cálculo de compatibilidad química y advertencias de exfoliación o retinización.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-900">Geolocalización Voluntaria</td>
                  <td className="px-4 py-3">Coordenadas de latitud/longitud o ciudad seleccionada.</td>
                  <td className="px-4 py-3">Ordenamiento de farmacias y comercios cercanos para adquisición de fórmulas. No se almacena historial de desplazamientos.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Sección 4 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">04</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Almacenamiento Local (LocalStorage) y Cookies Técnicas
            </h2>
          </div>
          <p>
            Para garantizar que usted pueda seguir consultando su rutina de Skin Cycling incluso si se encuentra sin conexión a internet (modo contingencia offline):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Utilizamos almacenamiento local en el navegador (<em>localStorage</em>) para preservar el estado del calendario semanal y los productos de su tocador.</li>
            <li>No empleamos cookies invasivas de seguimiento publicitario cruzado (Third-Party Tracking Cookies) de redes de publicidad de terceros.</li>
          </ul>
        </section>

        {/* Sección 5 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">05</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Derechos ARCO del Titular y Eliminación de Cuentas
            </h2>
          </div>
          <p>
            De conformidad con los principios rectores de protección de datos, usted tiene derecho a:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>Acceso:</strong> Solicitar copia de todos los datos personales asociados a su cuenta.</li>
            <li><strong>Rectificación:</strong> Actualizar o corregir información inexacta desde su panel de perfil.</li>
            <li><strong>Cancelación y Supresión:</strong> Solicitar el borrado definitivo de su cuenta y todos los registros asociados en nuestra base de datos.</li>
            <li><strong>Oposición:</strong> Oponerse al tratamiento de datos no esenciales para la operatividad básica de la plataforma.</li>
          </ul>
          <p className="text-xs text-slate-500 pt-1">
            Para ejercer cualquiera de estos derechos, puede gestionarlo desde el apartado de Configuración de Perfil o enviar una solicitud directa al canal de soporte editorial.
          </p>
        </section>
      </article>

      {/* Sello de Cumplimiento DLG-EXEC */}
      <footer className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-teal-700" />
          <span>Gobernanza de Datos DLG-EXEC • Cero Persistencia Biométrica</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/aviso-medico" className="hover:text-slate-800 underline underline-offset-2">Aviso Médico</Link>
          <Link href="/terminos" className="hover:text-slate-800 underline underline-offset-2">Términos de Uso</Link>
          <Link href="/estado" className="hover:text-slate-800 underline underline-offset-2">Estado del Nodo</Link>
        </div>
      </footer>
    </div>
  );
}
