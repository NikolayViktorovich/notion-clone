import { CohereService } from './cohereService';

export class AIService {
  static async generateText(prompt: string, context: string = ''): Promise<string> {
    return CohereService.generateText(prompt, context);
  }

  static async improveText(text: string): Promise<string> {
    return CohereService.improveText(text);
  }

  static async summarizeText(text: string): Promise<string> {
    return CohereService.summarizeText(text);
  }

  static async expandText(text: string): Promise<string> {
    return CohereService.expandText(text);
  }

  static async correctGrammar(text: string): Promise<string> {
    return CohereService.generateText(
      "Исправь грамматические и орфографические ошибки в этом тексте:",
      text
    );
  }

  static async translateToEnglish(text: string): Promise<string> {
    return CohereService.generateText(
      "Переведи этот текст на английский язык:",
      text
    );
  }
}