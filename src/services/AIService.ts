import axios from 'axios';
import { config } from '../config';
import { db } from '../database';
import logger from '../utils/logger';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  name: string;
  chat(messages: AIMessage[], options?: Record<string, any>): Promise<string>;
  available(): boolean;
}

export class OpenAICompatibleProvider implements AIProvider {
  public name = 'OpenAICompatible';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl ? baseUrl.replace(/\/+$/, '') : 'https://api.openai.com/v1';
    this.model = model || 'gpt-3.5-turbo';
  }

  public available(): boolean {
    return typeof this.apiKey === 'string' && this.apiKey.trim().length > 0;
  }

  public async chat(messages: AIMessage[], options?: Record<string, any>): Promise<string> {
    if (!this.available()) {
      throw new Error('AI API Key is not configured.');
    }

    const response = await axios.post(
      `${this.baseUrl}/chat/completions`,
      {
        model: options?.model || this.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 800,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('Empty response received from OpenAI API.');
    }
    return reply.trim();
  }
}

export class AIService {
  private activeProvider: AIProvider;
  private rateLimitMap: Map<string, number> = new Map();
  private rateLimitWindowMs = 2000;

  constructor() {
    this.activeProvider = new OpenAICompatibleProvider(
      config.aiApiKey,
      config.aiBaseUrl,
      config.aiModel
    );
  }

  public setProvider(provider: AIProvider): void {
    this.activeProvider = provider;
    logger.info(`AI provider changed to: ${provider.name}`);
  }

  public getProvider(): AIProvider {
    return this.activeProvider;
  }

  public clearHistory(chatId: string): void {
    db.clearConversationHistory(chatId);
    logger.info(`Cleared AI conversation history for chat ${chatId}`);
  }

  public async respond(chatId: string, message: string): Promise<string> {
    // Rate limit check
    const now = Date.now();
    const lastTime = this.rateLimitMap.get(chatId) || 0;
    if (now - lastTime < this.rateLimitWindowMs) {
      return '⏱ Please wait a moment before sending another message to the AI.';
    }
    this.rateLimitMap.set(chatId, now);

    if (!this.activeProvider.available()) {
      return '⚠️ AI Service is not available. Please configure AI_API_KEY in environment variables.';
    }

    try {
      // Record user message
      db.addConversationMessage(chatId, 'user', message);

      // Fetch history (last 10 messages)
      const rawHistory = db.getConversationHistory(chatId, 10);

      const systemPrompt: AIMessage = {
        role: 'system',
        content: `You are ${config.botName || 'Hemix'}, an intelligent, friendly, and helpful WhatsApp bot. Provide clear and concise answers.`,
      };

      const messages: AIMessage[] = [
        systemPrompt,
        ...rawHistory.map(item => ({
          role: item.role as 'user' | 'assistant',
          content: item.content,
        })),
      ];

      const responseText = await this.activeProvider.chat(messages);

      // Record assistant reply
      db.addConversationMessage(chatId, 'assistant', responseText);

      return responseText;
    } catch (err) {
      logger.error(`AI Service error for ${chatId}`, err);
      return '❌ Sorry, I encountered an error while processing your request.';
    }
  }
}

export const aiService = new AIService();
export default aiService;
