import { QuestionType, type OptionResult, type QuestionResults } from "@/lib/types/api";

export interface ResultInsights {
  total: number;
  // Opción(es) con más votos (más de una si hay empate). Vacío si nadie votó.
  winners: OptionResult[];
  // Frases listas para leer en voz alta.
  lines: string[];
}

const pct = (o: OptionResult) => `${Math.round(o.percentage)} %`;
const q = (o: OptionResult) => `“${o.label}”`;
const people = (n: number) => `${n} ${n === 1 ? "persona" : "personas"}`;

// Resume los resultados de una pregunta de opciones en frases para el presentador.
export function getInsights(r: QuestionResults): ResultInsights {
  const options = r.options ?? [];
  const total = r.totalResponses;
  if (total === 0 || options.length === 0) {
    return { total, winners: [], lines: ["Nadie votó en esta pregunta."] };
  }

  const sorted = [...options].sort((a, b) => b.count - a.count);
  const top = sorted[0].count;
  const winners = sorted.filter((o) => o.count === top);
  const rest = sorted.filter((o) => o.count < top);
  const lines: string[] = [];

  if (winners.length > 1) {
    lines.push(`Empate entre ${winners.map(q).join(" y ")}, con ${pct(winners[0])} cada una.`);
  } else {
    const w = winners[0];
    lines.push(
      total === 1
        ? `La única persona que votó eligió ${q(w)}.`
        : w.count === total
        ? `Todos eligieron ${q(w)} (${total} de ${total}).`
        : w.percentage > 50
        ? `Más de la mitad eligió ${q(w)}: ${pct(w)} (${w.count} de ${total}).`
        : `La opción más votada fue ${q(w)}, con ${pct(w)} (${w.count} de ${total}).`,
    );
  }

  const second = rest[0];
  if (second && second.count > 0) lines.push(`Le sigue ${q(second)} con ${pct(second)}.`);

  const nonZero = rest.filter((o) => o.count > 0);
  const last = nonZero[nonZero.length - 1];
  if (last && last !== second) lines.push(`La menos elegida fue ${q(last)} (${pct(last)}).`);

  const zero = rest.filter((o) => o.count === 0);
  if (zero.length) lines.push(`Nadie eligió ${zero.map(q).join(" ni ")}.`);

  lines.push(
    r.type === QuestionType.MULTIPLE
      ? `Votaron ${people(total)}; cada una podía elegir varias opciones.`
      : `Votaron ${people(total)}.`,
  );

  return { total, winners, lines };
}
