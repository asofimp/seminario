// Fase 1 — contenido de context/EJEMPLO_INFO_Y_PREGUNTAS.md.
// Las votaciones usan las preguntas de la encuesta (seminario-be/seed/fase-1-agentes-ia.json)
// por índice: 0 = herramientas de IA, 1 = agentes de IA, 2 = autonomía.

import {
  ArrowRightIcon,
  BoxIcon,
  BrainCircuitIcon,
  BrainIcon,
  BugIcon,
  CrosshairIcon,
  EyeIcon,
  FlagIcon,
  HandIcon,
  KeyRoundIcon,
  LayersIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SirenIcon,
  TargetIcon,
  UserCheckIcon,
  WorkflowIcon,
  WrenchIcon,
  ZapIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { LampContainer } from "@/components/ui/lamp";
import { Meteors } from "@/components/ui/meteors";
import { Callout, Footnote, Kicker, Lead, SlideFrame, Tile, Title } from "../slide-kit";
import { JoinBox, VoteSlide } from "../vote-slide";
import type { Deck } from "./types";

const AGENDA = [
  "Qué es",
  "Cómo funciona",
  "Para qué sirve",
  "Cómo se usa",
  "Quién los desarrolló",
  "Cómo se implementó",
  "Qué han logrado",
];

export const fase1Deck: Deck = {
  id: "fase-1",
  surveyTitle: "Fase 1 · Agentes de IA y su aplicación",
  slides: [
    // ---------- Portada ----------
    {
      title: "Portada",
      duration: "~0:30",
      fullBleed: true,
      notes:
        "Hoy hablo de agentes de IA y su aplicación, con la ciberseguridad como ejemplo. Meta: que al terminar puedan explicar qué es un agente, qué hace y quién lo construye.",
      render: (ctx) => (
        <BackgroundLines className="flex h-full w-full flex-col items-center justify-center px-4 md:h-full">
          <h2 className="relative z-20 bg-gradient-to-b from-neutral-900 to-neutral-700 bg-clip-text py-2 text-center font-sans text-2xl font-bold tracking-tight text-transparent md:py-10 md:text-4xl lg:text-7xl dark:from-neutral-600 dark:to-white">
            Ciberseguridad con <br /> Inteligencia Artificial
          </h2>
          <div className="absolute bottom-[5vh] left-1/2 z-20 -translate-x-1/2">
            <JoinBox code={ctx.code} joinHost={ctx.joinHost} compact />
          </div>
        </BackgroundLines>
      ),
    },

    // ---------- Agenda ----------
    {
      title: "Agenda",
      render: () => (
        <SlideFrame>
          <Kicker>Agenda</Kicker>
          <Title>Lo que veremos hoy</Title>
          <ol className="grid gap-[1.6vh] sm:grid-cols-2">
            {AGENDA.map((item, i) => (
              <li
                key={item}
                className="flex items-center gap-[1.2vw] rounded-2xl border border-white/10 bg-white/[0.04] px-[1.4vw] py-[1.6vh] text-[clamp(1.2rem,2vw,2.2rem)] backdrop-blur"
              >
                <span className="font-mono text-[0.9em] font-bold text-cyan-400">{String(i + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ol>
        </SlideFrame>
      ),
    },

    // ---------- Votación inicial ----------
    {
      title: "Votación: ¿has usado IA?",
      duration: "~0:40",
      questionIndex: 0,
      notes:
        "Abrir la votación en la web. Mostrar la gráfica de la pregunta 1 y comentarla (casi todos usan IA).",
      render: (ctx) => <VoteSlide ctx={ctx} questionIndex={0} kicker="Antes de empezar · Pregunta 1" />,
    },
    {
      title: "Votación: ¿has usado un agente?",
      duration: "~0:35",
      questionIndex: 1,
      notes:
        "Mostrar la gráfica de la pregunta 2: comentar el porcentaje de “No estoy seguro” y “No”. No dar aún la definición: “al terminar sabrán la diferencia”.",
      render: (ctx) => <VoteSlide ctx={ctx} questionIndex={1} kicker="Antes de empezar · Pregunta 2" />,
    },

    // ---------- 1. Qué es ----------
    {
      title: "1. Qué es un agente",
      duration: "~1:45",
      notes:
        "Objetivo + herramientas + autonomía. Volver a la gráfica 2: “muchos de los que dudaron ya usan agentes”.",
      render: () => (
        <SlideFrame>
          <Kicker>1 · Qué es</Kicker>
          <Callout label="Definición" className="text-[clamp(1.3rem,2.3vw,2.6rem)]">
            Un agente de IA es un sistema que, a partir de un <b>objetivo</b>, planifica, usa{" "}
            <b>herramientas</b> y decide sus pasos para cumplirlo.
          </Callout>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<TargetIcon />} title="Objetivo">“Investiga esta alerta”</Tile>
            <Tile icon={<WrenchIcon />} title="Tool use">SIEM, EDR, APIs, código</Tile>
            <Tile icon={<BrainIcon />} title="Autonomía">Planifica y replanifica</Tile>
          </div>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<MessageSquareIcon />} title="Chatbot">Responde</Tile>
            <Tile icon={<WorkflowIcon />} title="SOAR">Sigue un playbook determinista</Tile>
            <Tile icon={<BrainCircuitIcon />} title="Agente" highlight>Planifica y decide</Tile>
          </div>
          <Lead>
            <b className="text-foreground">Analogía:</b> como delegar una investigación a un analista junior con acceso a los sistemas.
          </Lead>
        </SlideFrame>
      ),
    },

    // ---------- 2. Cómo funciona ----------
    {
      title: "2. Cómo funciona",
      duration: "~1:00",
      render: () => (
        <SlideFrame>
          <Kicker>2 · Cómo funciona</Kicker>
          <Title>Un ciclo de 5 pasos</Title>
          <div className="flex flex-wrap items-center gap-[0.8vw]">
            {[
              { icon: <FlagIcon />, label: "Objetivo" },
              { icon: <BrainIcon />, label: "Razonar" },
              { icon: <WrenchIcon />, label: "Tool call" },
              { icon: <EyeIcon />, label: "Observar" },
              { icon: <RefreshCwIcon />, label: "Replanificar" },
            ].map((step, i, all) => (
              <div key={step.label} className="flex items-center gap-[0.8vw]">
                <div className="flex flex-col items-center gap-[0.8vh] rounded-2xl border border-white/10 bg-white/[0.04] px-[1.4vw] py-[2vh] backdrop-blur">
                  <span className="font-mono text-[clamp(0.8rem,1.1vw,1.2rem)] text-cyan-400">{i + 1}</span>
                  <span className="text-primary [&_svg]:size-[clamp(1.6rem,2.6vw,3rem)]">{step.icon}</span>
                  <span className="text-[clamp(1rem,1.6vw,1.8rem)] font-semibold">{step.label}</span>
                </div>
                {i < all.length - 1 && <ArrowRightIcon className="size-[clamp(1rem,1.8vw,2rem)] text-neutral-400" />}
              </div>
            ))}
            <RefreshCwIcon className="ml-[0.5vw] size-[clamp(1.2rem,2vw,2.2rem)] text-cyan-400" />
          </div>
          <div className="flex flex-wrap gap-[0.8vw]">
            <span className="text-[clamp(1rem,1.5vw,1.6rem)] text-neutral-400">Piezas del agente:</span>
            {["LLM (el modelo)", "Herramientas · MCP", "Contexto", "Guardrails"].map((p) => (
              <span key={p} className="rounded-full border border-white/10 bg-white/5 px-[1vw] py-[0.5vh] text-[clamp(1rem,1.5vw,1.6rem)]">
                {p}
              </span>
            ))}
          </div>
          <Callout label="Idea clave">
            Lo que convierte a un modelo en agente son las herramientas: no solo conversa, <b>actúa sobre sistemas reales</b>.
          </Callout>
        </SlideFrame>
      ),
    },

    // ---------- 3. Para qué sirve ----------
    {
      title: "3. Para qué sirve",
      duration: "~0:50",
      render: () => (
        <SlideFrame>
          <Kicker>3 · Para qué sirve</Kicker>
          <Title>Usos en ciberseguridad</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-3">
            <Tile icon={<SirenIcon />} title="Triaje de alertas">SOC · Nivel 1 y 2</Tile>
            <Tile icon={<SearchIcon />} title="Threat hunting">Hipótesis proactivas</Tile>
            <Tile icon={<BugIcon />} title="Vulnerabilidades">Descubrimiento</Tile>
            <Tile icon={<WrenchIcon />} title="Remediación">Parche y validación</Tile>
            <Tile icon={<ShieldAlertIcon />} title="Respuesta a incidentes">Contención</Tile>
            <Tile icon={<CrosshairIcon />} title="Pentesting">Red team</Tile>
          </div>
          <div className="grid items-center gap-[2vw] rounded-2xl border border-white/10 bg-white/[0.04] px-[2vw] py-[2vh] sm:grid-cols-[auto_auto_1fr]">
            <div className="text-center">
              <p className="text-[clamp(2.2rem,4.5vw,5rem)] leading-none font-bold text-gradient">70 %</p>
              <p className="text-[clamp(0.9rem,1.3vw,1.4rem)] text-neutral-400">de los SOC grandes lo pilotará (2028)</p>
            </div>
            <div className="text-center">
              <p className="text-[clamp(2.2rem,4.5vw,5rem)] leading-none font-bold">15 %</p>
              <p className="text-[clamp(0.9rem,1.3vw,1.4rem)] text-neutral-400">verá mejoras medibles</p>
            </div>
            <Footnote>Dato de Gartner</Footnote>
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 4. Cómo se usa ----------
    {
      title: "4. Cómo se usa",
      duration: "~1:00",
      notes:
        "Esto prepara la votación final: las opciones A, B y C de la última pregunta son estos tres niveles. Ejemplo: Project Perception (Microsoft).",
      render: () => (
        <SlideFrame>
          <Kicker>4 · Cómo se usa</Kicker>
          <Title>Tres niveles de autonomía</Title>
          <div className="grid items-end gap-[1.2vw] sm:grid-cols-3">
            {[
              { icon: <UserCheckIcon />, title: "Human-in-the-loop", text: "Recomienda; una persona aprueba", h: "h-[6vh]" },
              { icon: <EyeIcon />, title: "Human-on-the-loop", text: "Actúa con límites; una persona vigila", h: "h-[11vh]" },
              { icon: <ZapIcon />, title: "Autónomo", text: "Decide y ejecuta solo", h: "h-[16vh]" },
            ].map((lvl, i) => (
              <div key={lvl.title} className="flex flex-col gap-[1vh]">
                <Tile icon={lvl.icon} title={lvl.title}>{lvl.text}</Tile>
                <div
                  className={`${lvl.h} rounded-2xl bg-gradient-to-t from-violet-500/60 to-cyan-400/20`}
                  style={{ opacity: 0.45 + i * 0.25 }}
                />
              </div>
            ))}
          </div>
          <p className="text-center text-[clamp(0.9rem,1.3vw,1.4rem)] text-neutral-400">
            más autonomía → más riesgo → más supervisión
          </p>
          <Callout label="Idea clave">
            La autonomía se gana poco a poco, como la confianza en un analista nuevo: más riesgo, más supervisión.
          </Callout>
        </SlideFrame>
      ),
    },

    // ---------- 5. Quién ----------
    {
      title: "5. Quién los desarrolló",
      duration: "~0:30",
      render: () => (
        <SlideFrame>
          <Kicker>5 · Quién los desarrolló</Kicker>
          <Title>Los grandes actores ya compiten</Title>
          <div className="grid gap-[1.2vw] sm:grid-cols-5">
            {[
              ["OpenAI", "Daybreak"],
              ["Google", "Fairwind"],
              ["Microsoft", "Project Perception"],
              ["Anthropic", "Glasswing · Mythos"],
              ["Z.ai", "GLM-5.3 (pesos abiertos)"],
            ].map(([company, project]) => (
              <Tile key={company} title={company}>{project}</Tile>
            ))}
          </div>
          <Callout label="Idea clave">
            Los grandes actores ya compiten en este terreno, y las cifras de rendimiento las declaran los propios fabricantes.
          </Callout>
        </SlideFrame>
      ),
    },

    // ---------- 6. Implementación ----------
    {
      title: "6. Cómo se implementó",
      duration: "~0:45",
      notes: "MDASH de Microsoft: más de 100 agentes.",
      render: () => (
        <SlideFrame>
          <Kicker>6 · Cómo se implementó</Kicker>
          <Title>Cinco capas</Title>
          <div className="flex flex-col gap-[1.2vh]">
            {[
              { icon: <BrainIcon />, title: "Modelo especializado", text: "Entrenamiento con entornos de vulnerabilidades" },
              { icon: <LayersIcon />, title: "Arnés de herramientas", text: "Agent harness: tool calling y orquestación" },
              { icon: <BoxIcon />, title: "Sandbox", text: "Validación de exploits y parches aislada" },
              { icon: <KeyRoundIcon />, title: "Acceso controlado", text: "Defensores verificados, MFA" },
              { icon: <HandIcon />, title: "Human-in-the-loop", text: "Aprobación de acciones de alto impacto" },
            ].map((layer, i) => (
              <div
                key={layer.title}
                className="flex items-center gap-[1.4vw] rounded-2xl border border-white/10 bg-white/[0.04] px-[1.6vw] py-[1.4vh] backdrop-blur"
                style={{ marginLeft: `${i * 2.5}%`, marginRight: `${(4 - i) * 2.5}%` }}
              >
                <span className="font-mono text-[clamp(1rem,1.6vw,1.8rem)] font-bold text-cyan-400">{i + 1}</span>
                <span className="text-primary [&_svg]:size-[clamp(1.4rem,2.2vw,2.6rem)]">{layer.icon}</span>
                <span className="text-[clamp(1.1rem,1.8vw,2rem)] font-semibold">{layer.title}</span>
                <span className="ml-auto text-right text-[clamp(0.95rem,1.4vw,1.5rem)] text-neutral-400">{layer.text}</span>
              </div>
            ))}
          </div>
        </SlideFrame>
      ),
    },

    // ---------- 7. Logros ----------
    {
      title: "7. Qué han logrado",
      duration: "~0:45",
      render: () => (
        <SlideFrame>
          <Kicker>7 · Qué han logrado</Kicker>
          <div className="grid gap-[1.2vw] sm:grid-cols-2">
            {[
              ["10 000+", "vulnerabilidades graves encontradas en 1 mes (Glasswing)"],
              ["271", "fallos corregidos en Firefox 150"],
              ["1,5 M$", "fraude evitado en un banco"],
              ["80–90 %", "del trabajo de un ataque hecho por IA (GTG-1002, 2025), con validación humana"],
            ].map(([figure, text]) => (
              <div key={figure} className="relative flex flex-col gap-[0.8vh] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-[1.8vw]">
                <span className="relative z-10 text-[clamp(2.4rem,5vw,5.5rem)] leading-none font-bold text-gradient">{figure}</span>
                <span className="relative z-10 text-[clamp(1rem,1.5vw,1.6rem)] text-neutral-400">{text}</span>
                <Meteors number={14} />
              </div>
            ))}
          </div>
          <Footnote>Datos de los fabricantes: leer con cautela.</Footnote>
          <Callout label="Idea clave">
            <ShieldCheckIcon className="mr-2 inline size-[1.1em] text-cyan-400" />
            Los atacantes también usan agentes: la defensa necesita agentes, con supervisión humana.
          </Callout>
        </SlideFrame>
      ),
    },

    // ---------- Votación final ----------
    {
      title: "Votación final: autonomía",
      duration: "~1:15",
      questionIndex: 2,
      notes:
        "Abrir la votación (A–C = niveles de autonomía, D = ninguna). Mostrar la gráfica y comentar: ¿predomina B? ¿Hay quien eligió D? Pedir a 1 o 2 personas que expliquen su voto. Cierre: delegar con inteligencia y evaluar con rigor.",
      render: (ctx) => <VoteSlide ctx={ctx} questionIndex={2} kicker="Pregunta final" />,
    },

    // ---------- Cierre ----------
    {
      title: "Gracias",
      fullBleed: true,
      render: () => (
        <LampContainer className="h-full min-h-0 rounded-none">
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
            className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text py-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-8xl"
          >
            ¡Gracias!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="text-center text-[clamp(1.1rem,1.9vw,2rem)] text-slate-400"
          >
            Delegar con inteligencia y evaluar con rigor.
          </motion.p>
        </LampContainer>
      ),
    },
  ],
};
