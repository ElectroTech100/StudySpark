interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_AI_API_KEY || 'c5479c91703d4f4dbe13998c32b2cc62';
  }

  async generateResponse(messages: AIMessage[]): Promise<string> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI study assistant for students. You help with academic questions, explain complex concepts, solve problems, and provide study tips. Keep responses educational, encouraging, and appropriate for students. Use emojis occasionally to make responses more engaging.'
            },
            ...messages
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I encountered an error processing your request. Please try again.';
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): string {
    const fallbackResponses = [
      "I'm having trouble connecting to my AI service right now. However, I'm still here to help! Could you try rephrasing your question? 🤔",
      "It seems there's a temporary issue with my AI capabilities. In the meantime, I'd suggest breaking down your problem into smaller parts. What specific aspect would you like to focus on? 📚",
      "I'm experiencing some technical difficulties, but don't let that stop your learning! Try explaining the concept to yourself out loud - it's a great study technique! 💡",
      "My AI service is temporarily unavailable, but here's a study tip: the Pomodoro Technique (25-minute focused sessions) can really boost your productivity! ⏰",
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  async generateStudyTips(subject: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Give me 3 specific study tips for ${subject}. Make them practical and actionable for students.`
      }
    ];

    return this.generateResponse(messages);
  }

  async explainConcept(concept: string, subject: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Explain the concept of "${concept}" in ${subject} in simple terms that a student can understand. Use examples if helpful.`
      }
    ];

    return this.generateResponse(messages);
  }

  async solveProblem(problem: string, subject: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Help me solve this ${subject} problem step by step: ${problem}`
      }
    ];

    return this.generateResponse(messages);
  }
}

export default new AIService();