import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import { CONFIG } from "@/config/digitai.config";

export class AIService {
  // 1. Canviem la propietat per permetre null inicialment
  private genAI: GoogleGenerativeAI | null = null;
  private modelId: string = "gemini-2.0-flash"; 

  constructor() {
    // ✅ CONSTRUCTOR BUIT I SEGUR
    // No fem res aquí per no trencar el 'npm run build'
  }

  // 2. Mètode privat per obtenir el client (Lazy)
  private getClient(): GoogleGenerativeAI {
    // Si ja el tenim, el retornem (Singleton pattern)
    if (this.genAI) return this.genAI;

    // Si no, l'inicialitzem ara (Runtime)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        // Aquest error només saltarà quan l'usuari intenti xatejar, no al build
        throw new Error("❌ Manca GEMINI_API_KEY a les variables d'entorn");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    return this.genAI;
  }

  async generateChatResponse(history: { role: 'user' | 'assistant', content: string }[], lastMessage: string) {
    try {
      // 3. Obtenim el client de forma segura
      const client = this.getClient();
        
      const model = client.getGenerativeModel({ 
        model: this.modelId,
        systemInstruction: this.buildSystemPrompt() 
      });

      // Convertim l'historial
      const formattedHistory: Content[] = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Sanetjament (Gemini vol que comenci per user)
      if (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
          formattedHistory.shift();
      }

      const chat = model.startChat({
        history: formattedHistory
      });

      const result = await chat.sendMessage(lastMessage);
      const response = result.response.text();
      
      return response;

    } catch (error) {
      console.error("❌ AI Service Error:", error);
      return "Disculpa, estic tenint problemes de connexió. Si us plau, prova-ho més tard.";
    }
  }

  private buildSystemPrompt(): string {
    return `
      Ets l'assistent virtual oficial de ${CONFIG.identity.name}.
      
      CONTEXT DEL NEGOCI:
      - Descripció: ${CONFIG.identity.description}
      - Email de contacte: ${CONFIG.identity.contactEmail}
      - Adreça: ${CONFIG.identity.address || "No especificada"}
      
      FLAGS DE SERVEIS ACTIUS:
      - Botiga Online: ${CONFIG.modules.ecommerce ? 'SÍ' : 'NO'}
      - Reserves/Cites: ${CONFIG.modules.booking ? 'SÍ' : 'NO'}
      
      INSTRUCCIONS:
      1. Sigues amable i professional.
      2. Respon en l'idioma de l'usuari.
      3. Si no ho saps, dirigeix a l'email de contacte.
    `;
  }
}