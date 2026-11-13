// Fase 3 — contenido de context/Regulacion_de_la_IA_en_la_ciberseguridad.md.
// Votación: pregunta 0 de seminario-be/seed/fase-3-regulacion.json (pregunta final).

import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CompassIcon,
  GavelIcon,
  LandmarkIcon,
  ScaleIcon,
  ShieldIcon,
  BrainCircuitIcon,
  GlobeIcon,
  ClipboardCheckIcon,
  BellRingIcon,
  UserCheckIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { Footnote, Kicker, Note, SlideFrame, Tile, Title } from "../slide-kit";
import { ClosingSlide, CoverSlide, ListRow } from "../slide-blocks";
import { VoteSlide } from "../vote-slide";
import type { Deck } from "./types";

const TOPIC = "Regulación de la IA";

export const fase3Deck: Deck = {
  id: "fase-3",
  surveyTitle: "Fase 3 · Regulación de la IA en la ciberseguridad",
  agenda: {
    title: "Regulación de la IA en la ciberseguridad",
    items: ["Mapa de normas", "AI Act", "El reloj de plazos", "Estados Unidos", "Estándares", "Guatemala", "Conclusión"],
  },
  preview: [
    {
      text: "Si hoy su agente de IA fallara, ¿podrían dar una alerta en 24 horas, con evidencia?",
      options: ["Sí, con evidencia", "Sí, pero sin evidencia", "No", "No estoy seguro"],
      counts: [2, 6, 10, 7],
    },
  ],
  slides: [
    // ---------- Portada ----------
    {
      title: "Portada",
      fullBleed: true,
      notes:
        "Mis compañeros mostraron qué pasa cuando un agente de IA actúa solo y cómo se usan estos agentes para defender. Yo respondo la pregunta que sigue: ¿qué reglas aplican hoy cuando eso ocurre? Lo que existe es un conjunto de normas que se superponen: leyes de IA, de ciberseguridad y de protección de datos. En los próximos minutos veremos cuáles son, qué plazos imponen y qué estándares ayudan a cumplirlas.",
      render: (ctx) => (
        <CoverSlide ctx={ctx}>
          Regulación de la IA <br /> en la ciberseguridad
        </CoverSlide>
      ),
    },

    // ---------- 1. Mapa de normas ----------
    {
      title: "1. Mapa de normas",
      notes:
        "No hay una ley única de IA en ciberseguridad: cinco o seis marcos aplican a la vez. El AI Act tiene dos piezas que tocan la ciberseguridad: el artículo 55, en vigor desde agosto de 2025, y el artículo 15, pospuesto a diciembre de 2027. NIS2 no regula la IA como tal, pero la IA que usa una entidad cubierta forma parte de su entorno tecnológico. El Cyber Resilience Act exige reportar en 24 horas desde el 11 de septiembre de 2026. Y encima de todo, la protección de datos personales. Nota: que la IA quede dentro de NIS2 es una lectura de análisis de consultoras, no del texto de la directiva.",
      sidePanel: {
        label: "idea clave",
        render: () => (
          <Note label="Idea clave">
            No existe una ley única: varias normas aplican a la vez, y usar IA no exime de ninguna.
          </Note>
        ),
      },
      render: () => (
        <SlideFrame className="gap-[2.2vh]">
          <Kicker>Mapa de normas</Kicker>
          <Title>Seis normas aplican a la vez</Title>
          <div className="flex flex-col gap-[1vh]">
            {[
              ["AI Act, art. 55", "Pruebas adversariales y reporte de incidentes", "2 ago 2025"],
              ["AI Act, art. 15", "Resistencia a ataques en alto riesgo", "2 dic 2027"],
              ["NIS2", "Gestión de riesgos y alerta en 24 horas", "Vigente"],
              ["Cyber Resilience Act", "Reporte de vulnerabilidades explotadas", "11 sep 2026"],
              ["GDPR", "Notificar brechas de datos personales", "Vigente"],
              ["DORA", "Notificación inicial de incidentes TIC", "Vigente (finanzas)"],
            ].map(([norma, exige, desde], i) => (
              <ListRow key={norma} index={i} lead={String(i + 1).padStart(2, "0")} title={norma} detail={exige} aside={desde} />
            ))}
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 2. AI Act ----------
    {
      title: "2. AI Act",
      notes:
        "El artículo 55 ya está en vigor desde agosto de 2025: los proveedores de modelos de propósito general con riesgo sistémico deben hacer pruebas adversariales, proteger el modelo y su infraestructura, y reportar incidentes graves a la Oficina de IA. El artículo 15 exige que los sistemas de alto riesgo resistan ataques como el envenenamiento de datos. Esa obligación se pospuso: el Reglamento 2026/1744, vigente desde el 27 de julio de 2026, fijó el 2 de diciembre de 2027 para sistemas independientes y el 2 de agosto de 2028 para IA integrada en productos regulados. Retrasar no es eliminar: la estructura por niveles de riesgo no cambió. Además, la ley tiene alcance extraterritorial: aplica a quien ofrezca sistemas de IA en el mercado europeo.",
      sidePanel: {
        label: "multas",
        render: () => (
          <Note label="Multas por prácticas prohibidas">Hasta 35 M€ o el 7 % de la facturación mundial.</Note>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Unión Europea</Kicker>
          <Title>AI Act: dos artículos tocan la ciberseguridad</Title>
          <div className="grid gap-[1.4vw] sm:grid-cols-2">
            <Tile icon={<BrainCircuitIcon />} title="Artículo 55 · Modelos de propósito general con riesgo sistémico">
              <ul className="flex list-disc flex-col gap-[0.5vh] pl-[1.2em]">
                <li>Pruebas adversariales del modelo</li>
                <li>Protección del modelo y su infraestructura</li>
                <li>Reporte de incidentes graves a la Oficina de IA</li>
              </ul>
              <p className="mt-[1.4vh] font-semibold text-cyan-300">En vigor desde el 2 ago 2025</p>
            </Tile>
            <Tile icon={<ShieldIcon />} title="Artículo 15 · Sistemas de alto riesgo">
              <ul className="flex list-disc flex-col gap-[0.5vh] pl-[1.2em]">
                <li>Robustez y resistencia a ataques</li>
                <li>Incluye el envenenamiento de datos</li>
              </ul>
              <p className="mt-[1.4vh] text-neutral-500">Fechas fijadas por el Digital Omnibus:</p>
              <p className="font-semibold text-cyan-300">2 dic 2027 · sistemas independientes</p>
              <p className="font-semibold text-cyan-300">2 ago 2028 · IA en productos regulados</p>
            </Tile>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 3. Reloj de plazos ----------
    {
      title: "3. El reloj de plazos",
      notes:
        "Imaginen el caso que presentó mi compañero: un agente con permisos de más filtra datos personales. Según el caso, la organización tiene 24 horas para dar la alerta temprana bajo NIS2, 72 horas para notificar la brecha bajo el GDPR y, si es financiera, DORA exige una notificación inicial a las 4 horas de clasificar el incidente como grave. Si además es proveedora de un modelo con riesgo sistémico, debe reportar a la Oficina de IA sin demora indebida. Los plazos corren desde que la organización toma conocimiento. Sin detección ni registros confiables no se puede cumplir ninguno: los controles del grupo anterior son también requisitos de cumplimiento. Nota: el plazo de 4 horas de DORA aparece en una sola fuente; confírmalo antes de presentar.",
      sidePanel: {
        label: "idea clave",
        render: () => (
          <Note label="Idea clave">
            Los plazos corren desde que la organización toma conocimiento del incidente, no desde que ocurrió.
          </Note>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Plazos</Kicker>
          <Title>Un incidente, varios relojes</Title>
          <div className="relative grid gap-[1.2vw] sm:grid-cols-4">
            <motion.div
              className="absolute top-[clamp(2.4rem,3.6vw,4rem)] right-[12%] left-[12%] hidden h-px origin-left bg-gradient-to-r from-rose-500/60 via-violet-500/60 to-cyan-400/60 sm:block"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {[
              ["4 h", "Notificación inicial", "DORA"],
              ["24 h", "Alerta temprana", "NIS2 · CRA"],
              ["72 h", "Notificación del incidente o de la brecha", "NIS2 · GDPR · CRA"],
              ["1 mes", "Informe final", "NIS2"],
            ].map(([plazo, que, norma], i) => (
              <motion.div
                key={plazo}
                className="relative flex flex-col items-center gap-[1vh] text-center"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.2 }}
              >
                <span className="flex h-[clamp(4.8rem,7.2vw,8rem)] min-w-[clamp(4.8rem,7.2vw,8rem)] items-center justify-center rounded-full border border-white/15 bg-neutral-950 px-[0.6vw] text-[clamp(1.4rem,2.4vw,2.8rem)] font-bold whitespace-nowrap text-gradient shadow-[0_0_30px_-10px] shadow-cyan-400/40">
                  {plazo}
                </span>
                <span className="text-[clamp(1.05rem,1.6vw,1.8rem)] leading-tight font-semibold">{que}</span>
                <span className="font-mono text-[clamp(0.85rem,1.2vw,1.3rem)] text-neutral-500">{norma}</span>
              </motion.div>
            ))}
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 4. Estados Unidos ----------
    {
      title: "4. Estados Unidos",
      notes:
        "A julio de 2026, el panorama estadounidense es un mosaico de leyes estatales, como la SB 53 de California para modelos de frontera, vigente desde enero de 2026. A nivel federal hay una orden ejecutiva que busca frenar esas leyes estatales, pero no es ley vinculante. Colorado, la más comentada, reescribió su ley. Nota: las fuentes discrepan sobre los detalles de Colorado (pospuesta, reescrita, nueva versión desde enero de 2027), por eso la diapositiva solo dice que la reescribió. Frente a tanta diferencia, los estándares funcionan como puente.",
      sidePanel: {
        label: "idea clave",
        render: () => (
          <Note label="Idea clave">
            Sin una ley federal integral, los estándares voluntarios son el terreno común entre jurisdicciones.
          </Note>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Estados Unidos</Kicker>
          <Title>Un mosaico de leyes estatales</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<ScaleIcon />} title="California · SB 53">
              Transparencia para modelos de frontera, vigente desde enero de 2026.
            </Tile>
            <Tile icon={<LandmarkIcon />} title="Orden ejecutiva federal">
              Busca frenar las leyes estatales, pero no es ley vinculante.
            </Tile>
            <Tile icon={<GavelIcon />} title="Colorado">
              Reescribió su ley de IA en lugar de derogarla.
            </Tile>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 5. Estándares ----------
    {
      title: "5. Estándares",
      notes:
        "NIST es el método, ISO 42001 es la prueba auditable y el AI Act es la obligación. Un certificado ISO 42001 por sí solo no demuestra cumplimiento del AI Act; según SecureW2, en julio de 2026 se publicó la norma europea EN 18286 para cerrar esa brecha (aparece en una sola fuente). Nota: las fuentes discrepan sobre la versión vigente del NIST AI RMF, por eso no se cita número de versión.",
      render: () => (
        <SlideFrame>
          <Kicker>Estándares</Kicker>
          <Title>Cómo demostrar el cumplimiento</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<CompassIcon />} title="El método">
              <p className="font-semibold text-neutral-100">NIST AI RMF</p>
              <p>Guía voluntaria de riesgos</p>
            </Tile>
            <Tile icon={<BadgeCheckIcon />} title="La prueba" highlight>
              <p className="font-semibold text-neutral-100">ISO/IEC 42001</p>
              <p>Estándar certificable</p>
            </Tile>
            <Tile icon={<GavelIcon />} title="La obligación">
              <p className="font-semibold text-neutral-100">AI Act</p>
              <p>Ley vinculante de la UE</p>
            </Tile>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 5b. De control a evidencia ----------
    {
      title: "5. De control técnico a evidencia",
      notes:
        "Los controles que presentó mi compañero se traducen en evidencia que un auditor puede pedir. Un auditor no pregunta si tienen un buen prompt; pregunta qué control técnico tienen y cómo lo demuestran.",
      sidePanel: {
        label: "para equipos técnicos",
        render: () => (
          <Note label="Para equipos técnicos">
            OWASP (riesgos de aplicaciones) y MITRE ATLAS (tácticas de adversarios).
          </Note>
        ),
      },
      render: () => (
        <SlideFrame className="gap-[2.2vh]">
          <Kicker>Estándares</Kicker>
          <Title>De control técnico a evidencia de cumplimiento</Title>
          <div className="flex flex-col gap-[1vh]">
            {[
              ["Mínimo privilegio y secretos de corta duración", "Control de acceso y credenciales documentados"],
              ["Bloqueo de salida a internet", "Reglas de salida y segmentación verificables"],
              ["Registros inmutables y monitoreo externo", "Trazabilidad y supervisión independiente"],
              ["Verificar acciones, no el informe del agente", "Pruebas y monitoreo continuo del comportamiento"],
              ["Un responsable y un botón de apagado probado", "Roles definidos y plan de respuesta a incidentes"],
            ].map(([control, evidencia], i) => (
              <ListRow key={control} index={i} lead={<ArrowRightIcon />} title={control} detail={evidencia} />
            ))}
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 6. Guatemala ----------
    {
      title: "6. Guatemala",
      notes:
        "Guatemala aún no tiene ley específica de IA ni una ley de ciberseguridad aprobada. La iniciativa 6347 recibió en octubre un nuevo dictamen favorable, ahora como Ley Marco de Ciberseguridad; según Prensa Libre, el presidente del Congreso indicó que la fecha límite es el 27 de noviembre, para cumplir los estándares que permitirían adherirse al Convenio de Budapest. En IA, la Senacyt prevé cerrar la estrategia nacional entre fines de noviembre y principios de diciembre. Mientras tanto, el AI Act y el Cyber Resilience Act aplican a quien ofrezca sistemas o productos en el mercado europeo: una empresa guatemalteca que venda a Europa puede quedar dentro. La propuesta es mi análisis, no una postura oficial. El estado de la iniciativa 6347 puede cambiar antes del 27 de noviembre; revísalo el día de la presentación.",
      sidePanel: {
        label: "propuesta",
        render: () => (
          <Note label="Propuesta: adoptar hoy lo común">
            <ol className="flex list-decimal flex-col gap-[0.8vh] pl-[1.2em]">
              <li>Riesgos documentados e inventario de sistemas de IA</li>
              <li>Notificación de incidentes con plazos probados</li>
              <li>Supervisión humana, registros y un responsable por agente</li>
            </ol>
          </Note>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Guatemala</Kicker>
          <Title>La ley local aún está en trámite</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<ShieldIcon />} title="Ciberseguridad">
              Iniciativa 6347: nuevo dictamen favorable en octubre, ahora como Ley Marco. Fecha límite señalada: 27 de noviembre.
            </Tile>
            <Tile icon={<BrainCircuitIcon />} title="Inteligencia artificial">
              La Senacyt prevé cerrar la estrategia nacional entre fines de noviembre y principios de diciembre. Sin ley específica.
            </Tile>
            <Tile icon={<GlobeIcon />} title="Normas extranjeras">
              El AI Act y el Cyber Resilience Act aplican a quien venda al mercado europeo, esté donde esté.
            </Tile>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 7. Conclusión ----------
    {
      title: "7. Conclusión",
      notes:
        "Resumo en tres ideas. Primera: no hay una ley única; varias normas aplican a la vez y un incidente con IA activa más de un plazo. Segunda: los marcos legales cambian de fecha y de país, pero los estándares como NIST e ISO 42001 permiten demostrar control hoy. Tercera: los controles técnicos de mis compañeros no son solo buenas prácticas, son requisitos de cumplimiento.",
      sidePanel: {
        label: "resumen",
        render: () => (
          <>
            <Note label="Primera">Varias normas aplican a la vez, y un incidente con IA activa más de un plazo.</Note>
            <Note label="Segunda">Los estándares como NIST e ISO 42001 permiten demostrar control hoy.</Note>
            <Note label="Tercera">Los controles técnicos no son solo buenas prácticas: son requisitos de cumplimiento.</Note>
          </>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Conclusión</Kicker>
          <Title>Todas las normas piden lo mismo</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<ClipboardCheckIcon />} title="Riesgos gestionados" />
            <Tile icon={<BellRingIcon />} title="Incidentes reportados a tiempo" />
            <Tile icon={<UserCheckIcon />} title="Supervisión humana con evidencia" highlight />
          </div>
          <Footnote>NIST es el método, ISO 42001 es la prueba y el AI Act es la obligación.</Footnote>
        </SlideFrame>
      ),
    },

    // ---------- Pregunta final ----------
    {
      title: "Votación final: alerta en 24 h",
      questionIndex: 0,
      notes:
        "Les dejo una pregunta: si hoy su agente de IA fallara, ¿podrían, con evidencia, dar una alerta en 24 horas?",
      render: (ctx) => <VoteSlide ctx={ctx} questionIndex={0} kicker={TOPIC} />,
    },

    // ---------- Cierre ----------
    {
      title: "Gracias",
      role: "closing",
      fullBleed: true,
      notes: "Muchas gracias. Quedo atento a sus preguntas.",
      render: () => (
        <ClosingSlide title="¡Gracias!" subtitle="Riesgos gestionados, incidentes a tiempo y supervisión humana con evidencia." />
      ),
    },
  ],
};
