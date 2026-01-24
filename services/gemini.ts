
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const scanReceipt = async (base64Data: string, categories: string[], mimeType: string = 'image/jpeg') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: mimeType, data: base64Data } },
            {
              text: `Analyze this receipt or financial document (it might be a PDF or image). Extract data in JSON format:
              {
                "item": "Merchant name or product in Hebrew",
                "cost": number,
                "date": "YYYY-MM-DD",
                "category": "One of: ${categories.join(', ')}",
                "bank": "Bank name if mentioned"
              }`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            item: { type: Type.STRING },
            cost: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { type: Type.STRING },
            bank: { type: Type.STRING },
          },
          required: ["item", "cost", "date", "category"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    return null;
  }
};

export const analyzeBudget = async (categoryName: string, transactions: any[]) => {
  try {
    const itemsSummary = transactions.map(t => `${t.item}: ${t.cost}₪`).join(', ');
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these transactions for category "${categoryName}": ${itemsSummary}. 
      Provide a concise summary in Hebrew with HTML <div> formatting:
      1. Brief summary (סיכום קצר)
      2. Savings tip (טיפ לחיסכון)
      3. Encouraging remark (מילה טובה)`,
    });
    return response.text;
  } catch (error) {
    return "שגיאה בניתוח הנתונים.";
  }
};
