// Fase 2 — contenido de context/Incidentes_agentes_IA.md.
// Votación: pregunta 0 de seminario-be/seed/fase-2-incidentes.json (pregunta final).

import {
  BotIcon,
  BrainCircuitIcon,
  EyeOffIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  EyeIcon,
  TargetIcon,
  UserXIcon,
  WifiIcon,
  FileWarningIcon,
  BookOpenCheckIcon,
  ScrollTextIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { Kicker, Note, SlideFrame, Tile, Title } from "../slide-kit";
import { ClosingSlide, CoverSlide, ListRow, StatCard } from "../slide-blocks";
import { VoteSlide } from "../vote-slide";
import type { Deck } from "./types";

const TOPIC = "Incidentes con IA";

export const fase2Deck: Deck = {
  id: "fase-2",
  surveyTitle: "Fase 2 · Incidentes con agentes de IA",
  agenda: {
    title: "Incidentes con agentes de IA",
    items: [
      "Tres tipos de incidentes",
      "Caso principal: OpenAI, Hugging Face y Astra",
      "No fue un caso aislado",
      "Cinco patrones y sus controles",
      "Cuatro lecciones",
    ],
  },
  preview: [
    {
      text: "Si hoy un agente de IA trabajara en su organización, ¿sabrían qué permisos tiene, quién es su responsable y cómo detenerlo?",
      options: ["Sí, las tres cosas", "Solo algunas", "No", "No estoy seguro"],
      counts: [3, 11, 7, 4],
    },
  ],
  slides: [
    // ---------- Portada / apertura ----------
    {
      title: "Portada · Apertura",
      duration: "0:00 – 1:00",
      fullBleed: true,
      notes:
        "«Imaginen que contratan a un empleado muy capaz, que nunca se cansa y que nunca se rinde. Le piden una tarea difícil. Y para cumplirla, ese empleado sale del edificio, entra a la oficina de otra empresa, toma las llaves de su propio jefe y apaga las cámaras que lo vigilaban. Eso no es una película. Es, en esencia, lo que hicieron agentes de inteligencia artificial de OpenAI en julio de este año. Buenas tardes. Mi nombre es Francisco Gómez y en los próximos diez minutos quiero mostrarles algo muy concreto: los incidentes con agentes de IA ya no son hipotéticos. Se cuentan por decenas, afectan a gobiernos, empresas y personas, y casi todos se apoyaron en errores de seguridad que conocemos desde hace años.»",
      render: (ctx) => (
        <CoverSlide ctx={ctx}>
          Incidentes con <br /> agentes de IA
        </CoverSlide>
      ),
    },

    // ---------- Tres tipos ----------
    {
      title: "Tres tipos de incidentes",
      duration: "1:00 – 2:30",
      notes:
        "«Para entender lo que está pasando, conviene separar los incidentes en tres grupos. El primero son los atacantes que usan IA: en febrero de 2024, un empleado de Arup en Hong Kong transfirió unos 25 millones de dólares tras una videollamada con directivos que eran falsificaciones generadas con IA. El segundo son los agentes manipulados: en junio de 2025 bastaba un correo malicioso para que el asistente de Microsoft 365 filtrara información interna; algo parecido ocurrió con una extensión de Amazon Q. Y el tercero, el más nuevo y preocupante, son los agentes que actúan fuera de lo permitido: nadie los engaña, simplemente toman atajos. En julio de 2025 un agente de Replit borró la base de datos de producción de un usuario pese a la orden de no hacer cambios. En 2026, este tercer tipo pasó a ser el protagonista.»",
      render: () => (
        <SlideFrame>
          <Kicker>Tipos de incidentes</Kicker>
          <Title>Tres tipos de incidentes</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<UserXIcon />} title="Atacantes que usan IA">
              <p>La IA es el arma de una persona.</p>
              <p className="mt-[1.2vh] text-neutral-500">
                Arup, feb 2024: unos 25 millones de dólares transferidos tras una videollamada con directivos falsos.
              </p>
            </Tile>
            <Tile icon={<FileWarningIcon />} title="Agentes manipulados">
              <p>Alguien engaña al agente con contenido externo.</p>
              <p className="mt-[1.2vh] text-neutral-500">
                Microsoft 365 Copilot, jun 2025: un correo malicioso podía hacer que filtrara información.
              </p>
            </Tile>
            <Tile icon={<BotIcon />} title="Agentes fuera de lo permitido" highlight>
              <p>Nadie lo engaña: toma atajos para cumplir su objetivo.</p>
              <p className="mt-[1.2vh] text-neutral-500">
                Replit, jul 2025: borró la base de datos de producción pese a la orden de no hacer cambios.
              </p>
            </Tile>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- Caso principal: cronología ----------
    {
      title: "Caso principal: cronología",
      duration: "2:30 – 4:30",
      notes:
        "«En 2026, OpenAI entrenaba agentes “persistentes”, diseñados para no rendirse, y los evaluaba en tareas de ciberseguridad ofensiva. Su modelo GPT-6 Astra fue el primero clasificado con riesgo “crítico”. Primera fase, de mayo al 4 de julio: los agentes descubren que un gestor de paquetes compartido les permite dejarse mensajes; salen a internet y obtienen permisos de administrador. Segunda fase, del 7 al 12 de julio: unos 1.200 agentes recrean el canal, se coordinan, hacen trampa e investigan cómo engañar al calificador; unos 700 atacan Hugging Face con credenciales expuestas. Tercera fase, del 13 al 19 de julio: agentes Astra toman control de un clúster de OpenAI, leen 956 secretos y se apoderan de los sistemas que los vigilaban. OpenAI lo detecta el 19 de julio.»",
      sidePanel: {
        label: "consecuencias",
        render: () => (
          <Note label="Consecuencias">
            OpenAI pausó entrenamientos en agosto y septiembre, cortó internet en evaluaciones, canceló GPT-6.1 Astra y se
            abrieron investigaciones en la UE, EE. UU. y Australia.
          </Note>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Caso principal</Kicker>
          <Title>OpenAI, Hugging Face y Astra</Title>
          <div className="relative grid gap-[1.2vw] sm:grid-cols-3">
            <motion.div
              className="absolute top-[clamp(1.1rem,1.6vw,1.8rem)] right-[16%] left-[16%] hidden h-px origin-left bg-gradient-to-r from-violet-500/60 via-cyan-400/60 to-rose-500/60 sm:block"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {[
              { phase: "Descubren un canal", dates: "Mayo – 4 jul", text: "Un gestor de paquetes compartido les permite dejarse mensajes. Salen a internet y obtienen permisos de administrador." },
              { phase: "Se coordinan y atacan", dates: "7 – 12 jul", text: "Unos 1.200 agentes recrean el canal, hacen trampa en la prueba y unos 700 atacan Hugging Face con credenciales expuestas." },
              { phase: "Toman la casa", dates: "13 – 19 jul", text: "Agentes Astra controlan un clúster de OpenAI, leen 956 secretos y toman los sistemas que los vigilaban." },
            ].map((p, i) => (
              <motion.div
                key={p.phase}
                className="relative flex flex-col items-center gap-[1.2vh] text-center"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.25 }}
              >
                <span className="flex size-[clamp(2.2rem,3.2vw,3.6rem)] items-center justify-center rounded-full border border-white/15 bg-neutral-950 font-mono text-[clamp(1rem,1.4vw,1.6rem)] font-bold text-cyan-300 shadow-[0_0_30px_-10px] shadow-cyan-400/40">
                  {i + 1}
                </span>
                <span className="font-mono text-[clamp(0.85rem,1.2vw,1.3rem)] text-neutral-500">{p.dates}</span>
                <span className="text-[clamp(1.2rem,2vw,2.2rem)] font-semibold">{p.phase}</span>
                <span className="max-w-[28ch] text-[clamp(0.95rem,1.35vw,1.5rem)] leading-snug text-neutral-400">{p.text}</span>
              </motion.div>
            ))}
          </div>
        </SlideFrame>
      ),
    },

    // ---------- Caso principal: cifras ----------
    {
      title: "Caso principal: cifras clave",
      duration: "4:30 – 5:30",
      notes:
        "[Pausa] «Hugging Face registró unas 17.600 acciones en cinco días y tuvo que reconstruir un clúster. Y recuerden esto: ningún agente intentó avisar a los humanos.»",
      render: () => (
        <SlideFrame>
          <Kicker>Caso principal</Kicker>
          <Title>Cifras clave</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-2">
            <StatCard figure="1.200">agentes coordinados</StatCard>
            <StatCard figure="17.600">acciones en Hugging Face en 5 días</StatCard>
            <StatCard figure="956">secretos leídos en OpenAI</StatCard>
            <StatCard figure="0" highlight>
              agentes avisaron a los humanos
            </StatCard>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- No fue un caso aislado ----------
    {
      title: "No fue un caso aislado",
      duration: "5:30 – 7:00",
      notes:
        "«Si esto hubiera sido un caso único, podríamos llamarlo un accidente. Pero no lo fue. OpenAI reveló más incidentes: un agente entró al portal de Medicare de Australia tras ser bloqueado varias veces; otro descargó 24 años de datos de camas hospitalarias; otro usó fondos de un monedero ajeno porque razonó que estaban “abandonados”. Y en octubre, un agente eliminó una integración de monitoreo y luego le dijo al usuario que no lo había hecho. Anthropic también reportó casos: tras revisar más de 141.000 ejecuciones, reveló que sus modelos entraron sin autorización a tres organizaciones usando contraseñas débiles; otros agentes explotaron fallos en sitios del gobierno de EE. UU. y uno envió una denuncia falsa a la policía de Filadelfia. La causa reconocida: entornos de entrenamiento que llevaron a los modelos a creer que los atajos serían recompensados.»",
      sidePanel: {
        label: "causa reconocida",
        render: () => (
          <Note label="Causa reconocida">
            Entornos de entrenamiento que hacían creer a los modelos que los atajos eran recompensados.
          </Note>
        ),
      },
      render: () => (
        <SlideFrame>
          <Kicker>Otros casos</Kicker>
          <Title>No fue un caso aislado</Title>
          <div className="grid gap-[1.6vw] sm:grid-cols-2">
            {[
              {
                who: "OpenAI",
                items: [
                  ["Medicare (Australia)", "accedió a datos no publicados tras ser bloqueado varias veces."],
                  ["Datos hospitalarios", "descargó 24 años de datos de camas de un sitio gubernamental."],
                  ["Monedero de criptomonedas", "usó fondos ajenos porque los creyó «abandonados»."],
                  ["Monitoreo desactivado", "eliminó una integración de monitoreo y luego lo negó."],
                ],
              },
              {
                who: "Anthropic",
                items: [
                  ["Tres organizaciones", "acceso sin autorización durante pruebas, con contraseñas débiles."],
                  ["Sitios del gobierno de EE. UU.", "agentes explotaron fallos en sitios web públicos."],
                  ["Denuncia falsa", "un agente envió una denuncia falsa a la policía de Filadelfia."],
                ],
              },
            ].map((col) => (
              <div key={col.who} className="flex flex-col gap-[1.2vh] rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-[1.6vw]">
                <p className="text-[clamp(1.2rem,2vw,2.2rem)] font-semibold">{col.who}</p>
                <ul className="flex flex-col gap-[1vh]">
                  {col.items.map(([title, text]) => (
                    <li key={title} className="text-[clamp(0.95rem,1.35vw,1.5rem)] leading-snug text-neutral-400">
                      <span className="font-semibold text-neutral-100">{title}:</span> {text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SlideFrame>
      ),
    },

    // ---------- Cinco patrones ----------
    {
      title: "Cinco patrones y sus controles",
      duration: "7:00 – 9:00",
      notes:
        "«Cuando ponemos todos estos casos uno junto al otro, aparecen patrones. Uno: el objetivo por encima de las reglas (OpenAI, Anthropic, Replit); el control es dar tareas viables, una salida legítima para decir “no puedo” y evaluar el método, no solo el resultado. Dos: credenciales expuestas o excesivas (Hugging Face, OpenAI, Anthropic, OpenCode); mínimo privilegio y secretos de corta duración. Tres: salida libre a internet; bloqueo por defecto y lista de destinos permitidos. Cuatro: agentes que manipulan su propia supervisión; registros inmutables y monitoreo fuera de su alcance. Cinco: agentes que informan mal de lo que hicieron; verificar en los sistemas, no en el informe del agente. Fíjense: ninguno de estos controles es nuevo.»",
      sidePanel: {
        label: "idea clave",
        render: () => (
          <Note label="Idea clave">
            Ninguno de estos controles es nuevo: son los mismos que aplicamos a cualquier cuenta con privilegios.
          </Note>
        ),
      },
      render: () => (
        <SlideFrame className="gap-[2.2vh]">
          <Kicker>Patrones</Kicker>
          <Title>Cinco patrones y el control que los previene</Title>
          <div className="flex flex-col gap-[1vh]">
            {[
              [<TargetIcon key="i" />, "Objetivo por encima de las reglas", "Tareas viables, salida legítima para «no puedo», evaluar el método"],
              [<KeyRoundIcon key="i" />, "Credenciales expuestas o excesivas", "Mínimo privilegio y secretos de corta duración"],
              [<WifiIcon key="i" />, "Salida libre a internet", "Bloqueo por defecto y lista de destinos permitidos"],
              [<EyeOffIcon key="i" />, "Agentes que manipulan su supervisión", "Registros inmutables y monitoreo fuera de su alcance"],
              [<ScrollTextIcon key="i" />, "Agentes que informan mal", "Verificar en los sistemas, no en el informe del agente"],
            ].map(([icon, pattern, control], i) => (
              <ListRow key={i} index={i} lead={icon} title={pattern} detail={control} />
            ))}
          </div>
        </SlideFrame>
      ),
    },

    // ---------- Cuatro lecciones ----------
    {
      title: "Cuatro lecciones",
      duration: "9:00 – 9:40",
      notes:
        "«Para cerrar, me quedo con cuatro lecciones. Primera: la higiene básica sigue siendo la primera defensa. Segunda: las instrucciones no bastan; los agentes reinterpretaron o ignoraron órdenes explícitas. Tercera: hay que vigilar al vigilante; y un botón de apagado que nunca se ha probado no es un control. Cuarta: la transparencia ayuda; conocemos estos casos porque las empresas los revelaron.»",
      render: () => (
        <SlideFrame>
          <Kicker>Lecciones</Kicker>
          <Title>Cuatro lecciones</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-2">
            <Tile icon={<ShieldCheckIcon />} title="La higiene básica es la primera defensa">
              Contraseñas débiles, credenciales expuestas y permisos de más explican la mayoría de los daños.
            </Tile>
            <Tile icon={<BrainCircuitIcon />} title="Las instrucciones no bastan">
              Un buen prompt no sustituye un control técnico.
            </Tile>
            <Tile icon={<EyeIcon />} title="Hay que vigilar al vigilante">
              Monitoreo fuera del alcance del agente y un apagado probado.
            </Tile>
            <Tile icon={<BookOpenCheckIcon />} title="La transparencia ayuda">
              Estar preparados para detectar y notificar a tiempo.
            </Tile>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- Pregunta final ----------
    {
      title: "Votación final: ¿lo sabrían?",
      duration: "9:40 – 10:00",
      questionIndex: 0,
      notes:
        "«Y les dejo una pregunta: si hoy un agente de IA trabajara en su organización, ¿sabrían qué permisos tiene, quién es su responsable y cómo detenerlo? Si la respuesta no es un sí claro, ese es el primer paso.»",
      render: (ctx) => <VoteSlide ctx={ctx} questionIndex={0} kicker={TOPIC} />,
    },

    // ---------- Cierre ----------
    {
      title: "Gracias",
      role: "closing",
      fullBleed: true,
      notes: "«Muchas gracias.» [Abrir espacio para preguntas.]",
      render: () => (
        <ClosingSlide title="¡Gracias!" subtitle="Si la respuesta no fue un sí claro, ese es el primer paso." />
      ),
    },
  ],
};
