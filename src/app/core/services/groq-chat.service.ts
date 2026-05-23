import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { API_BASE_URL } from '../constants/api.constants';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface RespostaDTO {
  resposta: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Olá! Sou o assistente de mecânica do OS Fácil. Posso ajudar com diagnósticos, ordens de serviço, manutenção preventiva e muito mais. Como posso ajudar?',
  timestamp: new Date(),
};

@Injectable({ providedIn: 'root' })
export class GroqChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/assistente/mecanica`;

  readonly messages = signal<ChatMessage[]>([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
  readonly isLoading = signal(false);

  sendMessage(userContent: string): void {
    const userMsg: ChatMessage = { role: 'user', content: userContent, timestamp: new Date() };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isLoading.set(true);

    this.http
      .post<RespostaDTO>(this.apiUrl, { pergunta: userContent })
      .subscribe({
        next: (res) => {
          const content = res.resposta ?? 'Sem resposta da IA.';
          this.messages.update(msgs => [
            ...msgs,
            { role: 'assistant', content, timestamp: new Date() },
          ]);
          this.isLoading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          const msg = err?.error?.erro ?? err?.error?.message ?? 'Erro ao conectar com o assistente. Tente novamente.';
          this.messages.update(msgs => [
            ...msgs,
            { role: 'assistant', content: msg, timestamp: new Date() },
          ]);
          this.isLoading.set(false);
        },
      });
  }

  clearMessages(): void {
    this.messages.set([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
  }
}
