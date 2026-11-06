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
}

export interface Presentation extends MongoDoc {
  code: string;
  title: string;
  survey: ObjectId;
  state: PresentationState;
  // Solo una presentación puede estar activa; hay que terminarla para crear otra.
  isActive: boolean;
  endedAt: ISODate | null;
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
}

export type UpdateStateInput = Partial<PresentationState>;

// ---------- Responses ----------

export type AnswerValue = string | string[] | number;

export interface SubmitResponseInput {
  participantId: string;
  questionId: ObjectId;
  value: AnswerValue;
}

export interface ResponseRecord extends MongoDoc {
  presentation: ObjectId;
  questionId: ObjectId;
  participantId: string;
  value: AnswerValue;
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
