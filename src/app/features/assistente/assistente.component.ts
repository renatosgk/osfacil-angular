import { CommonModule, DatePipe } from '@angular/common';
import { Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GroqChatService } from '../../core/services/groq-chat.service';

@Component({
  selector: 'app-assistente',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './assistente.component.html',
  styleUrl: './assistente.component.scss',
})
export class AssistenteComponent {
  readonly chatService = inject(GroqChatService);
  inputText = '';

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      this.chatService.messages();
      this.chatService.isLoading();
      setTimeout(() => this.scrollToBottom(), 60);
    });
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.chatService.isLoading()) return;
    this.inputText = '';
    this.chatService.sendMessage(text);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
