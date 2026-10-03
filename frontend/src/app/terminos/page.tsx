import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  Building2,
  Users,
  ShieldCheck,
  Scale,
  DollarSign,
  MessageCircle,
  FileCheck2,
  ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Uso y Plataforma B2B',
  description: 'Términos de servicio, derechos y deberes para usuarios y comercios aliados en Allabout.skin conforme al ordenamiento jurídico venezolano.',
};

export default function TerminosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb DLG-EXEC */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-slate-800 transition-colors">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800">Términos de Uso</span>
      </nav>

      {/* Header Documento Legal */}
      <header className="border-b border-slate-200 pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <FileText className="w-3.5 h-3.5 text-slate-700" />
          <span>Acuerdo Jurídico Vinculante</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
          Términos y Condiciones de Uso
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          Condiciones aplicables al acceso, navegación y uso de los servicios de auditoría científica, directorio comercial y portal B2B provistos por Allabout.skin en el territorio venezolano.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
          <span>Versión: 1.0</span>
          <span className="hidden sm:inline">•</span>
          <span>Vigencia: A partir de Octubre 2026</span>
          <span className="hidden sm:inline">•</span>
          <span>Sede: Caracas, República Bolivariana de Venezuela</span>
        </div>
      </header>

      <p className="mb-8 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600" role="note">
        Documento en revisión: este texto aún no ha sido validado por un profesional del derecho y puede cambiar antes del lanzamiento público.
      </p>

      {/* Resumen Ejecutivo */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 mb-10 text-slate-800 shadow-sm">
        <div className="flex items-start gap-3">
          <Scale className="w-5 h-5 text-teal-800 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-sm leading-relaxed">
            <h2 className="font-semibold text-slate-900">Resumen de Cláusulas Principales</h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Al utilizar esta plataforma, usted acepta que el servicio de auditoría es documental y no médico. Si opera como farmacia o tienda registrada, se compromete a publicar precios transparentes y a mantener existencias reales. Las ventas concertadas por WhatsApp se perfeccionan exclusivamente entre cliente y comercio.
            </p>
          </div>
        </div>
      </div>

      {/* Articulado Legal DLG-EXEC */}
      <article className="space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
        {/* Cláusula 1 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">01</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Objeto de la Plataforma y Aceptación de las Partes
            </h2>
          </div>
          <p>
            Allabout.skin es un entorno digital integrado que proporciona a la comunidad:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Herramientas algorítmicas para el análisis de listados de ingredientes cosméticos (INCI) y reconocimiento óptico de caracteres (OCR).</li>
            <li>Guías pedagógicas de aplicación facial y protocolos metodológicos de Skin Cycling.</li>
            <li>Un directorio geolocalizado de comercios, farmacias independientes y distribuidores autorizados en Venezuela.</li>
          </ul>
          <p>
            El acceso y utilización de la plataforma atribuye la condición de Usuario (sea este consumidor final o comercio registrado) e implica la aceptación plena de las presentes condiciones.
          </p>
        </section>

        {/* Cláusula 2 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">02</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Cuentas de Usuario y Uso Ético
            </h2>
          </div>
          <p>
            Los usuarios son responsables de resguardar la confidencialidad de sus credenciales de acceso. Queda terminantemente prohibido:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Subir información falsa, engañosa o que vulnere derechos marcarios de terceros.</li>
            <li>Efectuar ataques de denegación de servicio (DoS), scraping automatizado no autorizado o inyección de código malicioso.</li>
            <li>Utilizar la plataforma para distribuir o promocionar preparados cosméticos clandestinos o sin control sanitario del INHRR.</li>
          </ul>
        </section>

        {/* Cláusula 3 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">03</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Régimen de Comercios, Farmacias y Portal B2B
            </h2>
          </div>
          <p>
            Las entidades comerciales registradas o que reclamen la administración de su vitrina comercial en el directorio se sujetan a las siguientes normas:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <DollarSign className="w-4 h-4 text-teal-700" />
              <span>Transparencia en Moneda y Precios de Referencia</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Los comercios pueden expresar precios de referencia en Dólares Estadounidenses (USD) y Bolívares (VES). Cuando se publiquen o liquiden precios en moneda nacional, los comercios acuerdan utilizar como referencia la tasa cambiaria oficial publicada por el Banco Central de Venezuela (BCV), de conformidad con la normativa cambiaria y monetaria vigente.
            </p>

            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm pt-2 border-t border-slate-100">
              <Building2 className="w-4 h-4 text-teal-700" />
              <span>Veracidad de Inventario y Catálogos Cargados</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              El comercio declara que los productos listados en sus ofertas están en inventario disponible y corresponden a fórmulas originales y legítimas. Allabout.skin se reserva el derecho de despublicar ofertas ante reportes comprobados de desabastecimiento crónico o inconsistencias reiteradas.
            </p>

            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm pt-2 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Procedimiento de Reclamo y Verificación</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Cualquier titular comercial legalmente facultado puede reclamar una ficha de tienda existente. El equipo de Allabout.skin podrá solicitar el RIF comercial, cédula del representante legal o comprobante de posesión de la línea de contacto antes de validar el traspaso de titularidad.
            </p>
          </div>
        </section>

        {/* Cláusula 4 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">04</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Transacciones entre Partes y Enlaces Directos vía WhatsApp
            </h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ausencia de Intermediación Financiera en V1</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Allabout.skin actúa exclusivamente como canal de descubrimiento de catálogo y facilitador de contacto. Los botones de consulta y reserva conectan de forma directa al usuario con la cuenta de WhatsApp oficial de la farmacia o comercio.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              En consecuencia, Allabout.skin no es parte del contrato de compraventa, no custodia fondos, no procesa transferencias bancarias (Pago Móvil, Zelle, efectivo) y no asume responsabilidad civil o mercantil por retrasos en envíos, estado físico del embalaje o políticas de devolución particulares de cada comercio.
            </p>
          </div>
        </section>

        {/* Cláusula 5 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">05</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Propiedad Intelectual y Fuentes de Datos Públicas
            </h2>
          </div>
          <p>
            El diseño del software, arquitectura de datos, código fuente, algoritmos de detección de fricción de aplicador e interfaces gráficas son propiedad de los autores de Allabout.skin.
          </p>
          <p>
            Los nombres comerciales, marcas de cosméticos y logotipos exhibidos en el catálogo corresponden a sus legítimos propietarios y se mencionan con propósitos estrictamente identificativos e informativos bajo el principio de uso justo y divulgación técnica. Los datos bibliográficos de PubMed (NCBI) y la base CosIng pertenecen al dominio público y a las entidades emisoras de la Unión Europea y el gobierno de los Estados Unidos de América.
          </p>
        </section>

        {/* Cláusula 6 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">06</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Ley Aplicable y Resolución de Conflictos
            </h2>
          </div>
          <p>
            Estos Términos y Condiciones se rigen e interpretan de conformidad con el ordenamiento jurídico de la República Bolivariana de Venezuela, en especial la <em>Ley sobre Mensajes de Datos y Firmas Electrónicas</em> y la legislación civil y mercantil supletoria.
          </p>
          <p>
            Para la resolución de cualquier controversia emanada de la interpretación o ejecución de este acuerdo, las partes acuerdan privilegiar la vía de composición amigable y, en su defecto, someterse a la jurisdicción de los tribunales de la Circunscripción Judicial del Área Metropolitana de Caracas.
          </p>
        </section>
      </article>

      {/* Sello de Cumplimiento DLG-EXEC */}
      <footer className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-teal-700" />
          <span>Gobernanza Contractual DLG-EXEC • Términos Vigentes</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/aviso-medico" className="hover:text-slate-800 underline underline-offset-2">Aviso Médico</Link>
          <Link href="/privacidad" className="hover:text-slate-800 underline underline-offset-2">Política de Privacidad</Link>
          <Link href="/estado" className="hover:text-slate-800 underline underline-offset-2">Estado del Nodo</Link>
        </div>
      </footer>
    </div>
  );
}
