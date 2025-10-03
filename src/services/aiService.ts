import { supabase } from "@/integrations/supabase/client";

export interface DocumentSummary {
  id: string;
  name: string;
  category?: string;
  type?: string;
}

export interface FormSuggestion {
  field: string;
  fieldLabel: string;
  value: string;
  confidence: number;
  reasoning?: string;
  documentReferences: DocumentReference[];
}

export interface DocumentReference {
  documentId: string;
  documentName: string;
  page?: number;
  snippet?: string;
  highlightText?: string;
  highlightPosition?: HighlightPosition;
  viewerUrl?: string;
}

export interface HighlightPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DocumentChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface DocumentChatResponse {
  reply: string;
  references: DocumentReference[];
}

type RawDocumentReference = Record<string, unknown> | null | undefined;

const mapDocumentReference = (ref: RawDocumentReference): DocumentReference => {
  if (!ref) {
    return {
      documentId: "",
      documentName: "Unknown document",
    };
  }

  const highlight =
    (ref as Record<string, unknown>).highlightPosition ||
    (ref as Record<string, unknown>).highlight ||
    (ref as Record<string, unknown>).highlight_coordinates;

  const highlightRecord = highlight as Record<string, unknown> | undefined;

  const normalizedHighlight = highlightRecord
    ? {
        x: Number(
          (highlightRecord.x as number | string | undefined) ??
            (highlightRecord.left as number | string | undefined) ??
            0
        ),
        y: Number(
          (highlightRecord.y as number | string | undefined) ??
            (highlightRecord.top as number | string | undefined) ??
            0
        ),
        width: Number(
          (highlightRecord.width as number | string | undefined) ??
            (highlightRecord.w as number | string | undefined) ??
            (highlightRecord.right as number | string | undefined) ??
            0
        ),
        height: Number(
          (highlightRecord.height as number | string | undefined) ??
            (highlightRecord.h as number | string | undefined) ??
            (highlightRecord.bottom as number | string | undefined) ??
            0
        ),
      }
    : undefined;

  const record = ref as Record<string, unknown>;

  return {
    documentId:
      (record.documentId as string) ||
      (record.document_id as string) ||
      (record.id as string) ||
      "",
    documentName:
      (record.documentName as string) ||
      (record.document_name as string) ||
      (record.name as string) ||
      "Document",
    page:
      (record.page as number | undefined) ||
      (record.pageNumber as number | undefined) ||
      (record.page_number as number | undefined),
    snippet: (record.snippet as string | undefined) || (record.summary as string | undefined),
    highlightText:
      (record.highlightText as string | undefined) ||
      (record.highlight_text as string | undefined) ||
      (record.snippet as string | undefined),
    highlightPosition: normalizedHighlight,
    viewerUrl: (record.viewerUrl as string | undefined) || (record.viewer_url as string | undefined),
  };
};

type RawSuggestion = Record<string, unknown> | null | undefined;

const mapSuggestion = (suggestion: RawSuggestion): FormSuggestion | null => {
  if (!suggestion) return null;

  const record = suggestion as Record<string, unknown>;

  const field =
    (record.field as string | undefined) ||
    (record.field_key as string | undefined) ||
    (record.fieldName as string | undefined);
  const value =
    (record.value as string | undefined) ||
    (record.answer as string | undefined) ||
    (record.suggested_value as string | undefined);

  if (!field || !value) return null;

  return {
    field,
    fieldLabel:
      (record.fieldLabel as string | undefined) ||
      (record.field_label as string | undefined) ||
      (record.label as string | undefined) ||
      field,
    value,
    confidence: Number(
      record.confidence ?? record.score ?? record.confidence_score ?? 0.7
    ),
    reasoning: (record.reasoning as string | undefined) || (record.explanation as string | undefined),
    documentReferences: Array.isArray(record.documentReferences || record.references)
      ? ((record.documentReferences as RawDocumentReference[]) ||
          (record.references as RawDocumentReference[])).map(mapDocumentReference)
      : [],
  };
};

export const aiService = {
  async generateFormSuggestions({
    caseId,
    documents,
    currentFormData,
  }: {
    caseId: string;
    documents: DocumentSummary[];
    currentFormData: Record<string, string>;
  }): Promise<FormSuggestion[]> {
    const payload = {
      case_id: caseId,
      documents,
      form_data: currentFormData,
    };

    const { data, error } = await supabase.functions.invoke("generate-form-suggestions", {
      body: payload,
    });

    if (error) {
      console.error("generate-form-suggestions error", error);
      throw new Error(error.message || "Failed to generate AI suggestions");
    }

    const rawSuggestions = Array.isArray(data?.suggestions)
      ? data?.suggestions
      : Array.isArray(data)
      ? data
      : [];

    const mapped = rawSuggestions
      .map(mapSuggestion)
      .filter((suggestion): suggestion is FormSuggestion => Boolean(suggestion));

    return mapped;
  },

  async sendDocumentChatMessage({
    caseId,
    history,
  }: {
    caseId: string;
    history: DocumentChatMessage[];
  }): Promise<DocumentChatResponse> {
    const payload = {
      case_id: caseId,
      messages: history,
    };

    const { data, error } = await supabase.functions.invoke("document-chat", {
      body: payload,
    });

    if (error) {
      console.error("document-chat error", error);
      throw new Error(error.message || "Failed to send message to AI assistant");
    }

    if (!data) {
      throw new Error("Empty response from AI assistant");
    }

    const reply = data.reply || data.answer || data.content || "";

    const referencesRaw = Array.isArray(data.references || data.citations || data.documentReferences)
      ? data.references || data.citations || data.documentReferences
      : [];

    return {
      reply,
      references: referencesRaw.map(mapDocumentReference),
    };
  },
};
