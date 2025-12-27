import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from '../AIService';

// Spies globals
const mockResponseText = vi.fn();
const mockSendMessage = vi.fn();
const mockStartChat = vi.fn();
const mockGetModel = vi.fn();

// ✅ FIX: Utilitzem 'vi.fn(function() { ... })' en lloc de '() => {}'
// Això permet que 'new GoogleGenerativeAI()' funcioni.
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn(function() {
      return {
        getGenerativeModel: mockGetModel
      };
    })
  };
});

describe('AIService Logic', () => {
  let service: AIService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configurar retorns
    mockResponseText.mockReturnValue('Resposta de la IA');
    
    mockSendMessage.mockResolvedValue({
      response: { text: mockResponseText }
    });
    
    mockStartChat.mockReturnValue({
      sendMessage: mockSendMessage
    });
    
    mockGetModel.mockReturnValue({
      startChat: mockStartChat
    });

    service = new AIService();
  });

  it('hauria de inicialitzar-se correctament', () => {
    expect(service).toBeDefined();
  });

  it('hauria de sanejar l\'historial (eliminar primer missatge si és assistant)', async () => {
    const history = [
      { role: 'assistant' as const, content: 'Hola!' },
      { role: 'user' as const, content: 'Pregunta 1' }
    ];
    await service.generateChatResponse(history, 'Pregunta 2');

    expect(mockStartChat).toHaveBeenCalledWith(expect.objectContaining({
      history: [{ role: 'user', parts: [{ text: 'Pregunta 1' }] }]
    }));
  });

  it('hauria de retornar la resposta del model', async () => {
    const response = await service.generateChatResponse([], 'Hola');
    expect(response).toBe('Resposta de la IA');
  });

  it('hauria de gestionar errors', async () => {
    mockSendMessage.mockRejectedValue(new Error('Fail'));
    const response = await service.generateChatResponse([], 'Hola');
    expect(response).toContain('problemes de connexió');
  });
});