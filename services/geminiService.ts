
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { LessonResponse, TradeAnalysis, DocumentAnalysis, StockBar, QuizResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getLessonContent = async (topic: string, context: string): Promise<LessonResponse | null> => {
  try {
    const prompt = `
      You are an expert Professor of Quantitative Finance. 
      Context: The student is learning about "${context}".
      Task: Explain the specific topic "${topic}" by breaking it down into 3-5 distinct, visual steps.
      
      Constraint: Text must be EXTREMELY minimal. Use the 'visualData' to do the teaching.
      
      For each step, you MUST provide:
      1. A short title.
      2. A concise explanation (MAXIMUM 30 words).
      3. A "visualData" object that describes a flow diagram to represent the concept visually.
         - Nodes: Entities (e.g., "Investor", "Broker", "Market Maker", "Algorithm"). 
           Place them on a 3x3 grid (row: 0-2, col: 0-2).
         - Edges: Connections showing movement (e.g., "Buy Order", "Data Feed", "Capital").
      
      Example of a visual flow for "Buying a Stock":
      Nodes: Investor(0,0), Broker(0,1), Exchange(0,2)
      Edges: Investor->Broker (label: "Order"), Broker->Exchange (label: "Route")

      Output strictly JSON fitting the requested schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a visual learner educator. Minimize text. Maximize diagrams.",
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  visualType: { type: Type.STRING, enum: ['FLOW', 'PROCESS', 'NONE'] },
                  visualData: {
                    type: Type.OBJECT,
                    properties: {
                      nodes: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            row: { type: Type.INTEGER },
                            col: { type: Type.INTEGER },
                            icon: { type: Type.STRING, description: "A single emoji representing the entity" }
                          },
                          required: ['id', 'label', 'row', 'col']
                        }
                      },
                      edges: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            from: { type: Type.STRING },
                            to: { type: Type.STRING },
                            label: { type: Type.STRING },
                            color: { type: Type.STRING, enum: ['emerald', 'blue', 'red', 'yellow'] }
                          },
                          required: ['from', 'to', 'label']
                        }
                      }
                    }
                  }
                },
                required: ['title', 'explanation', 'visualType']
              }
            }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as LessonResponse;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const generateQuiz = async (topic: string, difficulty: string): Promise<QuizResponse | null> => {
    try {
        const isAdvanced = difficulty === 'Advanced' || difficulty === 'Expert';
        
        const prompt = `
            Generate a 5-question multiple choice quiz for the topic: "${topic}".
            Difficulty Level: ${difficulty}.
            
            CRITICAL RULES:
            ${isAdvanced 
                ? '- Questions MUST be scenario-based (e.g., "A stock is trading below its 200 SMA with rising IV, what implies..."). Do NOT ask definitions.' 
                : '- Questions should test conceptual understanding and definitions.'}
            
            - Provide 4 distinct options.
            - Provide a clear, educational "explanation" for why the correct answer is right and why others might be wrong.
            
            Output strictly JSON.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    question: { type: Type.STRING },
                                    options: { 
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    correctIndex: { type: Type.INTEGER, description: "0-based index of correct option" },
                                    explanation: { type: Type.STRING }
                                },
                                required: ['id', 'question', 'options', 'correctIndex', 'explanation']
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as QuizResponse;
        }
        return null;
    } catch (error) {
        console.error("Quiz Gen Error", error);
        return null;
    }
}

export const getQuantStrategyCode = async (strategyName: string): Promise<string> => {
  try {
    const prompt = `
      You are a Senior Quantitative Developer.
      Task: Generate a Python code snippet (using pandas/numpy) for a '${strategyName}' strategy.
      
      Requirements:
      - Include comments explaining the logic.
      - Show how to calculate the signals.
      - Show how to generate buy/sell orders.
      - Explain the risks associated with this specific strategy.
      
      Output Format: Markdown with a code block.
    `;

    // Using gemini-3-pro-preview for coding and complex reasoning
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
         thinkingConfig: { thinkingBudget: 1024 } // Allow some thinking for code structure
      }
    });

    return response.text || "Failed to generate strategy code.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate code at this time.";
  }
};

export const chatWithTutor = async (history: {role: string, content: string}[], message: string): Promise<string> => {
    try {
        const chatHistory = history.map(h => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.content }]
        }));

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: chatHistory,
            config: {
                systemInstruction: "You are a QuantCademy Tutor. Answer questions about finance, trading, and coding briefly and accurately."
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text || "I couldn't process that.";
    } catch (error) {
        console.error("Chat error", error);
        return "Sorry, I'm having trouble connecting to the neural network.";
    }
}

// Module 6: Trade Analysis
export const getTradeAnalysis = async (ticker: string, priceData: StockBar[], companyName: string): Promise<TradeAnalysis | null> => {
    try {
        // Summarize data for prompt to avoid token limits with huge arrays
        const recentPrices = priceData.slice(-30).map(b => `Date:${new Date(b.t).toISOString().split('T')[0]} C:${b.c} V:${b.v}`).join('\n');
        
        const prompt = `
            Analyze ${ticker} (${companyName}) based on the last 30 days of price action provided below.
            Provide a structured trading plan for three timeframes: Long-term Investing, Swing Trading, and Day Trading.
            
            Price Data (Last 30 days):
            ${recentPrices}
            
            Output JSON strictly matching the schema.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        longTerm: {
                            type: Type.OBJECT,
                            properties: {
                                outlook: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Neutral'] },
                                thesis: { type: Type.STRING },
                                keyLevels: { type: Type.STRING }
                            },
                            required: ['outlook', 'thesis', 'keyLevels']
                        },
                        swing: {
                            type: Type.OBJECT,
                            properties: {
                                setup: { type: Type.STRING },
                                entry: { type: Type.STRING },
                                stopLoss: { type: Type.STRING },
                                target: { type: Type.STRING }
                            },
                            required: ['setup', 'entry', 'stopLoss', 'target']
                        },
                        dayTrade: {
                            type: Type.OBJECT,
                            properties: {
                                bias: { type: Type.STRING, enum: ['Long', 'Short', 'Chop'] },
                                plan: { type: Type.STRING },
                                volatilityNote: { type: Type.STRING }
                            },
                            required: ['bias', 'plan', 'volatilityNote']
                        }
                    },
                    required: ['longTerm', 'swing', 'dayTrade']
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as TradeAnalysis;
        }
        return null;
    } catch (error) {
        console.error("Trade Analysis Error:", error);
        return null;
    }
};

// Module 7: Document Analysis
export const analyzeDocument = async (base64Data: string, mimeType: string): Promise<DocumentAnalysis | null> => {
    try {
        const prompt = "Analyze this financial document/chart. Provide a summary, key points, sentiment, and a recommendation.";
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Using flash for multimodal
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                        sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
                        recommendation: { type: Type.STRING }
                    },
                    required: ['summary', 'keyPoints', 'sentiment', 'recommendation']
                }
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as DocumentAnalysis;
        }
        return null;
    } catch (error) {
        console.error("Doc Analysis Error:", error);
        return null;
    }
};
