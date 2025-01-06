import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface TokenUsage {
  id: number;
  created_at: string;
  user_id: string;
  assistant_id: string;
  thread_id: string;
  question: string;
  answer: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface TokenUsageSummary {
  total_interactions: number;
  total_prompt_tokens: number;
  total_completion_tokens: number;
  total_tokens: number;
  average_tokens_per_interaction: number;
  first_interaction: string;
  last_interaction: string;
}

export const getTokenUsage = async (params: {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  assistantId?: string;
  threadId?: string;
}): Promise<TokenUsage[]> => {
  const { startDate, endDate, userId, assistantId, threadId } = params;

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("start_date", startDate.toISOString());
  if (endDate) queryParams.append("end_date", endDate.toISOString());
  if (userId) queryParams.append("user_id", userId);
  if (assistantId) queryParams.append("assistant_id", assistantId);
  if (threadId) queryParams.append("thread_id", threadId);

  const url = `${API_URL}/api/v1/token-usage?${queryParams}`;
  console.log("Fazendo requisição GET para:", url);

  try {
    const response = await axios.get(url);
    console.log("Resposta recebida:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro na requisição:", error);
    if (axios.isAxiosError(error)) {
      console.error("Detalhes do erro:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    throw error;
  }
};

export const getTokenUsageSummary = async (params: {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  assistantId?: string;
  threadId?: string;
}): Promise<TokenUsageSummary> => {
  const { startDate, endDate, userId, assistantId, threadId } = params;

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("start_date", startDate.toISOString());
  if (endDate) queryParams.append("end_date", endDate.toISOString());
  if (userId) queryParams.append("user_id", userId);
  if (assistantId) queryParams.append("assistant_id", assistantId);
  if (threadId) queryParams.append("thread_id", threadId);

  const url = `${API_URL}/api/v1/token-usage/summary?${queryParams}`;
  console.log("Fazendo requisição GET para:", url);

  try {
    const response = await axios.get(url);
    console.log("Resposta recebida:", response.data);
    return response.data;
  } catch (error) {
    console.error("Erro na requisição:", error);
    if (axios.isAxiosError(error)) {
      console.error("Detalhes do erro:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    }
    throw error;
  }
};

// Função para listar assistentes
export interface ListAssistantsParams {
  // Basic Filters
  id?: string;
  name?: string;
  model?: string;

  // Time Filters
  created_before?: number;
  created_after?: number;

  // Metadata Filters
  metadata_keys?: string[];
  metadata_values?: string[];

  // Pagination
  limit?: number;
  after?: string;
}

export interface AssistantResponse {
  id_asst: string;
  object: string;
  created_at: number;
  name: string;
  description?: string;
  model: string;
  tools: any[];
  metadata: Record<string, any>;
  temperature?: number;
  top_p?: number;
}

export interface ListAssistantsResponse {
  data: AssistantResponse[];
  hasMore: boolean;
  nextCursor?: string;
}

export const listAssistants = async (
  params: ListAssistantsParams
): Promise<ListAssistantsResponse> => {
  const queryParams = new URLSearchParams();

  // Basic Filters
  if (params.id) queryParams.append("id", params.id);
  if (params.name) queryParams.append("name", params.name);
  if (params.model) queryParams.append("model", params.model);

  // Time Filters
  if (params.created_before)
    queryParams.append("created_before", params.created_before.toString());
  if (params.created_after)
    queryParams.append("created_after", params.created_after.toString());

  // Metadata Filters
  if (params.metadata_keys) {
    params.metadata_keys.forEach((key) =>
      queryParams.append("metadata_keys", key)
    );
  }
  if (params.metadata_values) {
    params.metadata_values.forEach((value) =>
      queryParams.append("metadata_values", value)
    );
  }

  // Pagination
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.after) queryParams.append("after", params.after);

  const response = await axios.get(
    `${API_URL}/api/v1/assistants/filter?${queryParams}`
  );

  // Return data and pagination info
  return {
    data: response.data,
    hasMore: response.headers["x-has-more"] === "true",
    nextCursor: response.headers["x-next-cursor"],
  };
};
