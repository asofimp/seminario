// Tipos espejo de los schemas/DTOs del backend (seminario-be).
// Si cambia un schema en el back, actualizar aquí.

export type ObjectId = string;
export type ISODate = string;

interface MongoDoc {
  _id: ObjectId;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ---------- Surveys ----------

export enum QuestionType {
  SINGLE = "single",
  MULTIPLE = "multiple",
  SCALE = "scale",
  TEXT = "text",
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  _id: ObjectId;
  text: string;
  // Aclaración opcional bajo la pregunta.
  description?: string;
  type: QuestionType;
  options: QuestionOption[];
  min?: number;
  max?: number;
}

export interface Survey extends MongoDoc {
  title: string;
  description?: string;
  questions: Question[];
}

export interface QuestionInput {
  text: string;
  description?: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
}

export interface CreateSurveyInput {
  title: string;
  description?: string;
  questions: QuestionInput[];
}

// ---------- Presentations ----------

export enum AudienceView {
  WAITING = "waiting",
  QUESTION = "question",
  RESULTS = "results",
  CLOSED = "closed",
  // Ronda de preguntas: el público escribe preguntas de texto.
  QA = "qa",
}

export enum ScreenView {
  LOBBY = "lobby",
  QUESTION = "question",
  RESULTS = "results",
  SUMMARY = "summary",
}

export interface PresentationState {
  audienceView: AudienceView;
  screenView: ScreenView;
  currentQuestionId: ObjectId | null;
  acceptingResponses: boolean;
  showResultsToAudience: boolean;
  // Diapositiva que muestra la pantalla proyectada (/screen/[code]).
  slideIndex: number;
  // Panel lateral de la diapositiva actual (lo abre el admin).
  showSidePanel: boolean;
  // Pregunta del público destacada en la pantalla (ronda de preguntas).
  highlightedQuestionId: ObjectId | null;
  // Al cambiar, todos los clientes rehacen su conexión.
  reconnectNonce?: number;
}

export interface Presentation extends MongoDoc {
  code: string;
  title: string;
  survey: ObjectId;
  state: PresentationState;
  // Solo una presentación puede estar activa; hay que terminarla para crear otra.
  isActive: boolean;
  endedAt: ISODate | null;
  // Práctica de una fase: no cuenta para el límite de una presentación activa.
  practice?: boolean;
}

export interface ActivePresentation {
  presentation: Pick<Presentation, "code" | "title"> | null;
}

export interface PresentationSnapshot {
  presentation: Presentation;
  survey: Survey;
}

export interface CreatePresentationInput {
  title: string;
  surveyId: ObjectId;
  practice?: boolean;
}

export type UpdateStateInput = Partial<PresentationState>;

// ---------- Responses ----------

export type AnswerValue = string | string[] | number;

export interface SubmitResponseInput {
  participantId: string;
  participantName?: string;
  questionId: ObjectId;
  value: AnswerValue;
}

export interface ResponseRecord extends MongoDoc {
  presentation: ObjectId;
  questionId: ObjectId;
  participantId: string;
  value: AnswerValue;
}

// ---------- Ronda de preguntas ----------

export interface AudienceQuestion extends MongoDoc {
  presentation: ObjectId;
  participantId: string;
  participantName: string;
  text: string;
  answered: boolean;
}

export interface AskQuestionInput {
  participantId: string;
  participantName: string;
  text: string;
}

// ---------- Analytics ----------

export interface OptionResult {
  value: string;
  label: string;
  count: number;
  percentage: number;
}

export interface QuestionResults {
  questionId: ObjectId;
  text: string;
  type: QuestionType;
  totalResponses: number;
  options?: OptionResult[];
  average?: number | null;
  distribution?: { value: number; count: number }[];
  latestAnswers?: string[];
}

// ---------- Errores ----------

// Forma de error de Nest (HttpException / ValidationPipe).
export interface ApiErrorBody {
  statusCode: number;
  message: string | string[];
  error?: string;
}
