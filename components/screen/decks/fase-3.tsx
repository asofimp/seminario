// Fase 3 — contenido de context/presentacion regulacion ciberseguridad ia.md
// (fechas al 12 de noviembre de 2026).
// Votación: pregunta 0 de seminario-be/seed/fase-3-regulacion.json (diapositiva "Para empezar").

import {
  BookOpenIcon,
  BrainCircuitIcon,
  FileCheck2Icon,
  GavelIcon,
  GlobeIcon,
  KeyRoundIcon,
  LandmarkIcon,
  ScaleIcon,
  ShieldCheckIcon,
  StampIcon,
  UserCheckIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { Footnote, Kicker, Note, SlideFrame, Tile, Title } from "../slide-kit";
import { ClosingSlide, CoverSlide, ListRow, StatCard } from "../slide-blocks";
import { VoteSlide } from "../vote-slide";
import type { Deck } from "./types";

const TOPIC = "Regulación";

const REVISAR =
  "Revisar antes de presentar: el estado de la Ley Marco de Ciberseguridad de Guatemala (sanción y publicación). Los medios no coinciden en el número de decreto ni en las penas exactas: no citarlos como dato cerrado.";

export const fase3Deck: Deck = {
  id: "fase-3",
  surveyTitle: "Fase 3 · Regulación de la IA en la ciberseguridad",
  agenda: {
    title: "Regulación en ciberseguridad e inteligencia artificial",
    items: [
      "Por qué regular",
      "Europa: Ley de IA",
      "Europa: ciberseguridad",
      "Guatemala: la ley",
      "Guatemala: lo que falta",
      "Latinoamérica",
      "Cierre",
    ],
  },
  preview: [
    {
      text: "¿Te ha llegado un mensaje falso o un video que parecía real y no lo era?",
      description: "Por ejemplo, un mensaje que te pide los datos de tu cuenta, o una foto o video falsos.",
      options: ["Sí", "No"],
      counts: [21, 4],
    },
  ],
  slides: [
    // ---------- 1. Portada ----------
    {
      title: "Portada",
      fullBleed: true,
      notes:
        "Buenas tardes. Hoy hablamos de algo que avanza más rápido que las leyes: la inteligencia artificial y la ciberseguridad. Serán cuatro pasos: por qué hacen falta reglas, qué hace Europa, la nueva ley guatemalteca y cómo está el resto de Latinoamérica.",
      render: (ctx) => (
        <CoverSlide ctx={ctx}>
          Regulación en ciberseguridad <br /> e inteligencia artificial
        </CoverSlide>
      ),
    },

    // ---------- 2. Para empezar (votación) ----------
    {
      title: "Votación: ¿mensaje o video falso?",
      questionIndex: 0,
      notes:
        "Quiero empezar con una pregunta: ¿cuántos de ustedes han recibido un mensaje falso pidiéndoles datos de su cuenta, o han visto un video o una foto que parecía real y no lo era? [Que voten.] Eso es ciberseguridad e inteligencia artificial en la vida diaria. Y la pregunta es: ¿quién pone las reglas?",
      sidePanel: {
        label: "la pregunta clave",
        render: () => (
          <Note label="Para pensar">¿Quién pone las reglas de la tecnología que usamos todos los días?</Note>
        ),
      },
      render: (ctx) => <VoteSlide ctx={ctx} questionIndex={0} kicker={TOPIC} />,
    },

    // ---------- 3. Por qué regular ----------
    {
      title: "Por qué regular",
      notes:
        "Piensen en el tránsito. Un carro es útil, pero sin semáforos, licencias y límites de velocidad habría muchos más accidentes. La ciberseguridad se trata de proteger sistemas y datos: cuentas bancarias, hospitales, oficinas del gobierno. La inteligencia artificial son programas que aprenden de datos para decidir o crear cosas, como un asistente que escribe textos o un sistema que aprueba un crédito. Se regulan juntas porque se cruzan: la IA ayuda a detectar ataques, pero también permite estafas más creíbles, y una IA mal protegida puede filtrar datos de miles de personas. Las reglas buscan tres cosas: prevenir daños, exigir que alguien responda cuando algo falla y castigar los delitos.",
      sidePanel: {
        label: "definiciones",
        render: () => (
          <>
            <Note label="Ciberseguridad">Proteger sistemas y datos.</Note>
            <Note label="Inteligencia artificial">Programas que aprenden de datos para decidir o crear.</Note>
          </>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Por qué regular</Kicker>
          <Title>Sin reglas, como el tránsito sin semáforos</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<ShieldCheckIcon />} title="Prevenir daños">
              Exigir seguridad antes de que ocurra el problema.
            </Tile>
            <Tile icon={<UserCheckIcon />} title="Exigir responsables">
              Que alguien responda cuando algo falla.
            </Tile>
            <Tile icon={<GavelIcon />} title="Castigar delitos">
              El fraude, el robo de identidad y los ataques tienen consecuencias.
            </Tile>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 4. Europa: Ley de IA ----------
    {
      title: "Europa: Ley de IA",
      notes:
        "La Unión Europea es quien más lejos ha llegado. Su Ley de IA funciona como un semáforo de riesgo: hay usos prohibidos, usos de alto riesgo con muchas exigencias, como salud, educación o créditos, y usos de bajo riesgo casi libres. Las prohibiciones ya se aplican desde febrero de 2025. Las reglas de alto riesgo se aplazaron con el llamado Ómnibus Digital: pasaron a diciembre de 2027, y a agosto de 2028 para productos como dispositivos médicos. Faltaban estándares técnicos para cumplirlas. Hay críticos que temen que el retraso deje a las personas menos protegidas. Aplazar no elimina las obligaciones; solo cambia el calendario.",
      sidePanel: {
        label: "idea clave",
        render: () => (
          <Note label="Idea clave">Aplazar no es eliminar: la estructura por niveles no cambió.</Note>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Europa · Ley de IA</Kicker>
          <Title>Un semáforo de riesgo para la inteligencia artificial</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            {[
              { light: "bg-rose-500 shadow-rose-500/60", title: "Prohibido", text: "Prácticas inaceptables.", when: "Se aplican desde febrero de 2025" },
              {
                light: "bg-amber-400 shadow-amber-400/60",
                title: "Alto riesgo",
                text: "Salud, educación, créditos.",
                when: "Reglas estrictas desde diciembre de 2027 (agosto de 2028 en productos regulados)",
              },
              { light: "bg-emerald-400 shadow-emerald-400/60", title: "Riesgo bajo", text: "Casi libre.", when: "" },
            ].map((lvl, i) => (
              <motion.div
                key={lvl.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.18 }}
                className="flex flex-col gap-[1.2vh] rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-[1.6vw]"
              >
                <span className={`size-[clamp(1.4rem,2.2vw,2.4rem)] rounded-full shadow-[0_0_24px] ${lvl.light}`} />
                <p className="text-[clamp(1.2rem,2vw,2.2rem)] leading-tight font-semibold">{lvl.title}</p>
                <p className="text-[clamp(0.95rem,1.4vw,1.5rem)] text-neutral-300">{lvl.text}</p>
                {lvl.when && (
                  <p className="text-[clamp(0.85rem,1.2vw,1.3rem)] leading-snug text-neutral-500">{lvl.when}</p>
                )}
              </motion.div>
            ))}
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 5. Europa: ciberseguridad ----------
    {
      title: "Europa: ciberseguridad",
      notes:
        "En ciberseguridad hay varias normas. NIS2 obliga a empresas y servicios importantes a gestionar riesgos y avisar de incidentes significativos. La Ley de Ciberresiliencia regula productos con software, desde un televisor inteligente hasta una cámara de seguridad. Desde el 11 de septiembre de 2026 los fabricantes deben avisar a las autoridades si descubren una falla que ya está siendo explotada o un incidente grave; el primer aviso, en 24 horas. Aplica incluso a productos que ya estaban en el mercado. Lo más exigente, como diseñar con seguridad desde el inicio, llega en diciembre de 2027. Y el GDPR obliga a notificar brechas de datos personales. Un mismo incidente puede activar reportes bajo varias normas a la vez: se suman, no se sustituyen.",
      sidePanel: {
        label: "idea clave",
        render: () => (
          <Note label="Idea clave">
            Un mismo incidente puede activar reportes bajo varias normas a la vez: se suman, no se sustituyen.
          </Note>
        ),
      },
      render: () => (
        <SlideFrame className="gap-[2.2vh]">
          <Kicker>Europa · Ciberseguridad</Kicker>
          <Title>Tres normas, un mismo reflejo: avisar rápido</Title>
          <div className="flex flex-col gap-[1vh]">
            {[
              ["NIS2", "Gestionar riesgos y notificar incidentes significativos", "Vigente"],
              ["Ley de Ciberresiliencia", "Reportar fallas explotadas e incidentes graves; el primer aviso en 24 horas", "11 sep 2026"],
              ["Ley de Ciberresiliencia", "Seguridad desde el diseño y marcado CE", "11 dic 2027"],
              ["GDPR", "Notificar brechas de datos personales", "Vigente"],
            ].map(([norma, exige, desde], i) => (
              <ListRow key={`${norma}-${desde}`} index={i} lead={String(i + 1).padStart(2, "0")} title={norma} detail={exige} aside={desde} />
            ))}
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 6. Guatemala: la ley ----------
    {
      title: "Guatemala: la ley",
      notes: `${REVISAR} — Ahora lo que más nos toca. El 3 de noviembre de 2026 el Congreso aprobó la Ley Marco de Ciberseguridad. Todavía falta que el presidente la sancione y que se publique en el Diario de Centro América; entrará en vigor 30 días después. Por qué ahora: Guatemala ha sufrido ataques a instituciones públicas, como la Cancillería en 2022, el Ministerio de Finanzas en 2023 y el de Educación en 2024. La ley fija tiempos de respuesta: 30 minutos para avisar si se afecta infraestructura crítica, 6 horas en otros casos y 72 horas para el reporte completo. Es el tiempo para avisar y documentar, no para resolver el problema. Crea un Consejo Nacional de Ciberseguridad y una Dirección Nacional de Ciberseguridad, y define delitos con penas de cárcel; según los reportes, de 2 a 12 años según el delito y los agravantes.`,
      sidePanel: {
        label: "idea clave",
        render: () => <Note label="Idea clave">Son plazos para avisar y documentar, no para resolver.</Note>,
      },
      render: () => (
        <SlideFrame className="gap-[2.6vh]">
          <Kicker>Guatemala</Kicker>
          <Title>Ley Marco de Ciberseguridad: aprobada, aún no vigente</Title>
          <div className="grid gap-[1vw] sm:grid-cols-3">
            {[
              { icon: <LandmarkIcon />, label: "Aprobada", text: "3 de noviembre de 2026, por el Congreso", done: true },
              { icon: <StampIcon />, label: "Falta", text: "La sanción del presidente y su publicación", done: false },
              { icon: <FileCheck2Icon />, label: "Vigencia", text: "30 días después de publicarse", done: false },
            ].map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className={`flex items-center gap-[1vw] rounded-2xl border px-[1.3vw] py-[1.4vh] ${
                  step.done ? "border-emerald-400/30 bg-emerald-400/[0.07]" : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <span className={`[&_svg]:size-[clamp(1.3rem,2vw,2.2rem)] ${step.done ? "text-emerald-300" : "text-cyan-300"}`}>
                  {step.icon}
                </span>
                <div>
                  <p className="text-[clamp(1rem,1.5vw,1.6rem)] font-semibold">{step.label}</p>
                  <p className="text-[clamp(0.85rem,1.2vw,1.3rem)] leading-snug text-neutral-400">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <StatCard figure="30 min" highlight>
              aviso si se afecta infraestructura crítica
            </StatCard>
            <StatCard figure="6 h">aviso en otros incidentes</StatCard>
            <StatCard figure="72 h">reporte completo</StatCard>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 7. Guatemala: lo que falta ----------
    {
      title: "Guatemala: lo que falta",
      notes: `${REVISAR} El dato de la Senacyt viene de la presentación original y no está verificado. — Quedan tres pendientes. Primero, la sanción y la publicación. Segundo, el reglamento: Gobernación tendrá seis meses desde la entrada en vigor para emitirlo. Tercero, la inteligencia artificial: según lo que pude revisar, esta ley trata la ciberseguridad y no regula la IA. Guatemala todavía no tiene una ley propia de IA; la Senacyt prevé cerrar la estrategia nacional entre fines de noviembre y principios de diciembre. Mientras tanto, el AI Act y la Ley de Ciberresiliencia aplican a quien venda al mercado europeo, esté donde esté. Para ustedes en la práctica: si manejan datos de otras personas, conviene saber a quién se avisa y en cuánto tiempo.`,
      sidePanel: {
        label: "mientras tanto",
        render: () => (
          <Note label="Mientras tanto">
            El AI Act y la Ley de Ciberresiliencia aplican a quien venda al mercado europeo, esté donde esté.
          </Note>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Guatemala</Kicker>
          <Title>Tres pendientes después de la aprobación</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<StampIcon />} title="Publicación">
              El presidente debe sancionar la ley y publicarla en el Diario de Centro América.
            </Tile>
            <Tile icon={<BookOpenIcon />} title="Reglamento">
              Gobernación debe emitirlo dentro de los seis meses posteriores a la entrada en vigor.
            </Tile>
            <Tile icon={<BrainCircuitIcon />} title="Inteligencia artificial" highlight>
              No hay ley específica. La Senacyt prevé cerrar la estrategia nacional entre fines de noviembre y principios de
              diciembre.
            </Tile>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 8. Latinoamérica ----------
    {
      title: "Latinoamérica",
      notes:
        "En el resto de la región hay mucho movimiento, pero poca ley firme. Un informe de la Universidad de los Andes contó 716 instrumentos sobre IA en América Latina y el Caribe a julio de 2026, sobre todo estrategias, guías y proyectos. Según un análisis de ese mes, ningún país tiene todavía una ley nacional dedicada solo a la IA. Perú es de los más adelantados, con la Ley 31814 y su reglamento. El problema común es que la tecnología avanza más rápido que las leyes, y faltan especialistas y centros de respuesta a incidentes.",
      sidePanel: {
        label: "la brecha común",
        render: () => (
          <Note label="La brecha común">
            La tecnología avanza más rápido que las leyes, y faltan especialistas y centros de respuesta a incidentes.
          </Note>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Latinoamérica</Kicker>
          <Title>Mucho movimiento, pocas leyes firmes</Title>
          <div className="grid items-stretch gap-[1.4vw] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <StatCard figure="716">
              instrumentos sobre IA en América Latina y el Caribe, a julio de 2026: sobre todo estrategias, guías y proyectos
            </StatCard>
            <div className="flex flex-col gap-[1.2vw]">
              <Tile icon={<ScaleIcon />} title="Ningún país tiene todavía una ley nacional dedicada solo a la IA" />
              <Tile icon={<GlobeIcon />} title="Perú es de los más adelantados">
                Con la Ley 31814 y su reglamento.
              </Tile>
            </div>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 9. Cierre: tres ideas ----------
    {
      title: "Cierre: tres ideas",
      notes:
        "Para cerrar, tres ideas. Europa regula con fechas y obligaciones, aunque a veces las ajusta. Guatemala dio un paso concreto en ciberseguridad; falta ver la publicación, el reglamento y la aplicación, y queda pendiente la IA. Y las leyes ayudan, pero no sustituyen hábitos básicos: contraseñas distintas, verificación en dos pasos y desconfiar de mensajes urgentes. Muchas gracias. ¿Alguna pregunta? — Preguntas probables: ¿Regular frena la innovación? Algunos dicen que sí; Europa aplazó plazos para dar tiempo a crear estándares. · ¿Ya está vigente la ley de Guatemala? No: está aprobada, pero falta sanción, publicación y 30 días.",
      render: () => (
        <SlideFrame>
          <Kicker>Cierre</Kicker>
          <Title>Tres ideas para llevarse</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<GlobeIcon />} title="Europa: reglas con fechas">
              Obligaciones claras y plazos, aunque a veces los ajusta.
            </Tile>
            <Tile icon={<LandmarkIcon />} title="Guatemala: un primer paso">
              Ley de ciberseguridad aprobada. Faltan publicación, reglamento y aplicación. La IA sigue pendiente.
            </Tile>
            <Tile icon={<KeyRoundIcon />} title="Tú: hábitos básicos" highlight>
              Contraseñas distintas, verificación en dos pasos y desconfiar de mensajes urgentes.
            </Tile>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 10. Fuentes ----------
    {
      title: "Fuentes",
      notes: "Diapositiva de referencia: dejarla unos segundos por si alguien quiere anotar.",
      render: () => (
        <SlideFrame className="gap-[2vh]">
          <Kicker>Fuentes</Kicker>
          <ul className="grid gap-x-[2vw] gap-y-[1.2vh] text-[clamp(0.85rem,1.2vw,1.35rem)] text-neutral-400 sm:grid-cols-2">
            {[
              ["Prensa Libre", "Ley Marco de Ciberseguridad: delitos, penas y vigencia"],
              ["DPL News", "Congreso aprueba ley con plazos de respuesta"],
              ["i-SCOOP", "Cronología del AI Act tras el Ómnibus"],
              ["FPF", "Calendario del AI Act"],
              ["RPC", "Reportes de la Ley de Ciberresiliencia desde el 11 de septiembre"],
              ["McDermott", "Aviso de 24 horas bajo la Ley de Ciberresiliencia"],
              ["Universidad de los Andes", "Regulación de IA en Latinoamérica"],
              ["Impacto TIC", "Panorama regional"],
              ["CELE", "Ley 31814 de Perú"],
            ].map(([src, title]) => (
              <li key={title} className="border-l border-white/15 pl-[1vw]">
                <span className="text-neutral-200">{title}</span> · {src}
              </li>
            ))}
          </ul>
          <Footnote>Fechas al 12 de noviembre de 2026.</Footnote>
        </SlideFrame>
      ),
    },

    // ---------- Cierre de la fase (solo al practicar la fase sola) ----------
    {
      title: "Gracias",
      role: "closing",
      fullBleed: true,
      notes: "Muchas gracias. ¿Alguna pregunta?",
      render: () => (
        <ClosingSlide title="¡Gracias!" subtitle="Las leyes ayudan, pero no sustituyen los hábitos básicos." />
      ),
    },
  ],
};
