import Dexie, { Table } from "dexie";

export interface TokenUsage {
  id?: number;
  timestamp: string;
  tokens_used: number;
  model: string;
  endpoint: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export class TokenUsageDB extends Dexie {
  tokenUsage!: Table<TokenUsage>;

  constructor() {
    super("TokenUsageDB");
    this.version(1).stores({
      tokenUsage: "++id, timestamp, tokens_used, model, endpoint",
    });
  }
}

export const db = new TokenUsageDB();
