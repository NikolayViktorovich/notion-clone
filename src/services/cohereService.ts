export class CohereService {
  private static readonly PROXY_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/generate'
    : '/api/cohere'; 

  static async generateText(prompt: string, context: string = ''): Promise<string> {
    try {
      console.log('🔄 Sending request to:', this.PROXY_URL);
      
      const response = await fetch(this.PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Proxy error:', response.status, errorText);
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Cohere API error:', data.error);
        throw new Error(data.error);
      }

      const generatedText = data.generations[0]?.text?.trim();
      
      if (!generatedText) {
        throw new Error('No text generated from Cohere API');
      }

      console.log('Successfully received response from Cohere API');
      return generatedText;
    } catch (error) {
      console.error('Cohere Service error:', error);
      return this.getDemoResponse(prompt);
    }
  }

  static async improveText(text: string): Promise<string> {
    const prompt = "Улучши этот текст, сделай его более профессиональным, грамотным и понятным. Сохрани основной смысл. Верни только улучшенный текст без дополнительных комментариев:";
    const result = await this.generateText(prompt, text);

    if (result.includes('демо-режиме')) {
      return `Совет по улучшению текста: "${text.substring(0, 50)}..." - используйте более четкие формулировки и структурируйте информацию.`;
    }
    
    return result;
  }

  static async summarizeText(text: string): Promise<string> {
    const prompt = "Суммаризируй этот текст кратко, выдели основные идеи. Верни только суммаризацию без дополнительных комментариев:";
    const result = await this.generateText(prompt, text);
    
    if (result.includes('демо-режиме')) {
      return `Краткое содержание: "${text.substring(0, 70)}..." - основная идея текста.`;
    }
    
    return result;
  }

  static async expandText(text: string): Promise<string> {
    const prompt = "Расширь этот текст, добавь детали, примеры и объяснения. Верни только расширенный текст без дополнительных комментариев:";
    const result = await this.generateText(prompt, text);
    
    if (result.includes('демо-режиме')) {
      return `Расширенная версия: "${text}" - можно добавить примеры, детали и практические применения.`;
    }
    
    return result;
  }

  static async correctGrammar(text: string): Promise<string> {
    const prompt = "Исправь грамматические и орфографические ошибки в этом тексте. Верни только исправленный текст:";
    const result = await this.generateText(prompt, text);
    
    if (result.includes('демо-режиме')) {
      return `Проверенный текст: "${text}" (в демо-режиме проверка орфографии не выполняется)`;
    }
    
    return result;
  }

  private static getDemoResponse(prompt: string): string {
    const demoResponses: { [key: string]: string } = {
    };

    const lowerPrompt = prompt.toLowerCase();
    
    for (const [key, response] of Object.entries(demoResponses)) {
      if (lowerPrompt.includes(key)) {
        return response;
      }
    }

    return `Запрос: "${prompt}"\n\nВ демо-режиме. `;
  }
}