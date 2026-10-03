import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  BookOpen,
  Microscope,
  Stethoscope,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Aviso Médico & Deslinde de Responsabilidad Legal',
  description: 'Deslinde legal y consideraciones de rigor científico según la Ley de Ejercicio de la Medicina de Venezuela y estándares internacionales de divulgación cosmética.',
};

export default function AvisoMedicoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb DLG-EXEC */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-slate-800 transition-colors">Inicio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800">Marco Legal & Sanitario</span>
      </nav>

      {/* Header Documento Legal */}
      <header className="border-b border-slate-200 pb-8 mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>Documento Oficial de Rigor Sanitario</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
          Aviso Médico y Deslinde de Responsabilidad
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
          Declaración formal sobre la naturaleza divulgativa de la plataforma, el alcance de las auditorías de formulación cosmética y el cumplimiento del marco regulatorio venezolano e internacional.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-mono">
          <span>Versión: 1.0 (Edición 2026)</span>
          <span className="hidden sm:inline">•</span>
          <span>Última revisión: Octubre 2026</span>
          <span className="hidden sm:inline">•</span>
          <span>Jurisdicción: República Bolivariana de Venezuela</span>
        </div>
      </header>

      {/* Alert Callout WCAG AA */}
      <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-5 mb-10 text-slate-800 shadow-sm" role="alert">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-sm leading-relaxed">
            <h2 className="font-semibold text-amber-950">Aviso Primario de Salud Pública</h2>
            <p>
              La información provista por Allabout.skin tiene propósitos exclusivamente educativos, documentales y de orientación dermocosmética. <strong>No constituye, ni pretende sustituir, el criterio, diagnóstico, prescripción médica o tratamiento clínico individualizado de un especialista en dermatología o medicina general.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Cuerpo del Documento */}
      <article className="space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
        {/* Sección 1 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">01</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Marco Legal y Régimen Sanitario (Venezuela)
            </h2>
          </div>
          <p>
            De conformidad con la <strong>Ley de Ejercicio de la Medicina de la República Bolivariana de Venezuela</strong> (Gaceta Oficial N° 39.823) y las disposiciones éticas del Código de Deontología Médica:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>
              El diagnóstico, tratamiento y prescripción de patologías cutáneas (como acné nódulo-quístico severo, rosácea inflamatoria, eccemas, psoriasis o sospecha de lesiones malignas/melanoma) son actos médicos reservados con exclusividad a profesionales legalmente facultados e inscritos en el Colegio de Médicos respectivo.
            </li>
            <li>
              El uso de esta plataforma <strong>no genera ninguna relación médico-paciente</strong> entre el usuario y los desarrolladores, editores científicos o autores de Allabout.skin.
            </li>
            <li>
              Cualquier formulación o cosmético clasificado por el Ministerio del Poder Popular para la Salud (MPPS) o el Instituto Nacional de Higiene "Rafael Rangel" (INHRR) como medicamento de venta bajo récipe no forma parte del ámbito de recomendación autónoma de este aplicativo.
            </li>
          </ul>
        </section>

        {/* Sección 2 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">02</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Metodología de Auditoría Científica e Indexación Documental
            </h2>
          </div>
          <p>
            Los índices de compatibilidad, niveles de fricción de aplicadores y guías de combinación molecular generados por nuestro motor algorítmico se basan en evidencia pública disponible:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs tracking-wider uppercase">
                <BookOpen className="w-4 h-4 text-teal-700" />
                <span>Base CosIng (Comisión Europea)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Normalización de nomenclaturas INCI conforme al Reglamento (CE) N° 1223/2009 sobre productos cosméticos, funciones químicas reconocidas y restricciones de concentración.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs tracking-wider uppercase">
                <Microscope className="w-4 h-4 text-teal-700" />
                <span>PubMed / NCBI E-Utilities</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enlaces directos y síntesis referenciales a publicaciones biomédicas indexadas en la Biblioteca Nacional de Medicina de los Estados Unidos (NLM).
              </p>
            </div>
          </div>
          <p className="pt-2 text-xs text-slate-500">
            Dichos datos se suministran como material de consulta y no garantizan la ausencia de reacciones alérgicas individuales ni la eficacia biológica idéntica en todos los biotipos cutáneos.
          </p>
        </section>

        {/* Sección 3 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">03</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Protocolo de Actuación ante Urgencias y Efectos Adversos
            </h2>
          </div>
          <p>
            Si tras aplicar cualquier cosmético, suero exfoliante, retinoide o protector solar auditado en la plataforma experimenta:
          </p>
          <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 text-red-900 text-sm space-y-2">
            <ul className="list-disc pl-5 space-y-1">
              <li>Ardor punzante persistente, eritema violáceo o hinchazón periocular.</li>
              <li>Prurito agudo, ampollas, descamación con dolor o secreción purulenta.</li>
              <li>Dificultad respiratoria, opresión torácica o edema labial (signos sugestivos de anafilaxia).</li>
            </ul>
          </div>
          <p className="font-semibold text-slate-800">
            Medidas inmediatas obligatorias:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>Suspenda de inmediato el uso de todos los productos activos de la rutina.</li>
            <li>Enjuague la zona con abundante agua templada sin frotar con elementos mecánicos abrasivos.</li>
            <li>No aplique remedios caseros, alcohol, bicarbonato ni sustancias irritantes sobre la piel comprometida.</li>
            <li>Acuda de inmediato a un centro asistencial o consulte de urgencia a un dermatólogo colegiado.</li>
          </ol>
        </section>

        {/* Sección 4 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">04</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Neutralidad Algorítmica y Política de No Conflicto de Interés
            </h2>
          </div>
          <p>
            Allabout.skin mantiene una política de independencia técnica estricta:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>
              Ninguna marca de cosméticos, laboratorio farmacéutico ni comercio minorista puede pagar para alterar la evaluación química de un ingrediente o para suprimir advertencias de seguridad en fórmulas.
            </li>
            <li>
              Las advertencias de pH, incompatibilidades moleculares (p. ej., retinoides y alfahidroxiácidos de alta concentración simultáneos) y riesgos de fricción de aplicadores se ejecutan de manera idéntica e imparcial para todos los productos de la base de datos.
            </li>
          </ul>
        </section>

        {/* Sección 5 */}
        <section className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">05</span>
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Organismos de Referencia y Sociedades Científicas
            </h2>
          </div>
          <p>
            Para consultas dermatológicas formales y validaciones sanitarias en territorio venezolano, recomendamos consultar fuentes oficiales:
          </p>
          <div className="rounded-lg border border-slate-200 bg-white p-4 divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Sociedad Venezolana de Dermatología Médica, Quirúrgica y Estética (SVDMQE)</span>
                <span className="text-slate-500 text-xs">Directorio nacional de dermatólogos certificados en Venezuela.</span>
              </div>
              <a
                href="https://svderma.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium ml-3"
              >
                <span>Portal Oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900 block">Instituto Nacional de Higiene "Rafael Rangel" (INHRR)</span>
                <span className="text-slate-500 text-xs">Registro y control sanitario de productos cosméticos y medicamentos.</span>
              </div>
              <a
                href="http://www.inhrr.gob.ve"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-medium ml-3"
              >
                <span>Portal Oficial</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>
      </article>

      {/* Sello de Cumplimiento DLG-EXEC */}
      <footer className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-teal-700" />
          <span>Cumplimiento editorial: DLG-EXEC Standard • WCAG 2.1 AA Compliant</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terminos" className="hover:text-slate-800 underline underline-offset-2">Términos de Uso</Link>
          <Link href="/privacidad" className="hover:text-slate-800 underline underline-offset-2">Política de Privacidad</Link>
          <Link href="/estado" className="hover:text-slate-800 underline underline-offset-2">Estado del Nodo</Link>
        </div>
      </footer>
    </div>
  );
}
