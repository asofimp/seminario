import { api } from "./client";
import type {
  ActivePresentation,
  AskQuestionInput,
  AudienceQuestion,
  CreatePresentationInput,
  CreateSurveyInput,
  ObjectId,
  Presentation,
  PresentationSnapshot,
  QuestionResults,
  ResponseRecord,
  SubmitResponseInput,
  Survey,
  UpdateStateInput,
} from "@/lib/types/api";

const enc = encodeURIComponent;

// ---------- /surveys (admin) ----------
export const surveysApi = {
  list: () => api.get<Survey[]>("/surveys").then((r) => r.data),
  get: (id: ObjectId) =>
    api.get<Survey>(`/surveys/${enc(id)}`).then((r) => r.data),
  create: (input: CreateSurveyInput) =>
    api.post<Survey>("/surveys", input).then((r) => r.data),
  replace: (id: ObjectId, input: CreateSurveyInput) =>
    api.put<Survey>(`/surveys/${enc(id)}`, input).then((r) => r.data),
  remove: (id: ObjectId) =>
    api.delete<void>(`/surveys/${enc(id)}`).then(() => undefined),
};

// ---------- /presentations ----------
export const presentationsApi = {
  // admin
  list: () => api.get<Presentation[]>("/presentations").then((r) => r.data),
  create: (input: CreatePresentationInput) =>
    api.post<Presentation>("/presentations", input).then((r) => r.data),
  updateState: (code: string, input: UpdateStateInput) =>
    api
      .patch<Presentation>(`/presentations/${enc(code)}/state`, input)
      .then((r) => r.data),
  next: (code: string) =>
    api
      .post<Presentation>(`/presentations/${enc(code)}/next`)
      .then((r) => r.data),
  prev: (code: string) =>
    api
      .post<Presentation>(`/presentations/${enc(code)}/prev`)
      .then((r) => r.data),
  end: (code: string) =>
    api
      .post<Presentation>(`/presentations/${enc(code)}/end`)
      .then((r) => r.data),

  // público
  active: () =>
    api.get<ActivePresentation>("/presentations/active").then((r) => r.data),
  snapshot: (code: string) =>
    api
      .get<PresentationSnapshot>(`/presentations/${enc(code)}`)
      .then((r) => r.data),
};

// ---------- /presentations/:code/responses (público) ----------
export const responsesApi = {
  submit: (code: string, input: SubmitResponseInput) =>
    api
      .post<ResponseRecord>(`/presentations/${enc(code)}/responses`, input)
      .then((r) => r.data),
};

// ---------- /presentations/:code/results (público) ----------
export const analyticsApi = {
  presentation: (code: string) =>
    api
      .get<QuestionResults[]>(`/presentations/${enc(code)}/results`)
      .then((r) => r.data),
  question: (code: string, questionId: ObjectId) =>
    api
      .get<QuestionResults>(
        `/presentations/${enc(code)}/results/${enc(questionId)}`,
      )
      .then((r) => r.data),
};

// ---------- /presentations/:code/qa (ronda de preguntas) ----------
export const qaApi = {
  list: (code: string) =>
    api.get<AudienceQuestion[]>(`/presentations/${enc(code)}/qa`).then((r) => r.data),
  ask: (code: string, input: AskQuestionInput) =>
    api.post<AudienceQuestion>(`/presentations/${enc(code)}/qa`, input).then((r) => r.data),
  // admin
  setAnswered: (code: string, id: ObjectId, answered: boolean) =>
    api
      .patch<AudienceQuestion>(`/presentations/${enc(code)}/qa/${enc(id)}`, { answered })
      .then((r) => r.data),
};
