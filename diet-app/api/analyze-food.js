import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, mimeType } = req.body;
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType || 'image/jpeg'
          }
        },
        {
          text: "この食事の写真を分析し、以下のJSONフォーマットのみで回答してください。キーは name(料理名), cal(推定カロリー数値), p(タンパク質g数), f(脂質g数), c(炭水化物g数) としてください。"
        }
      ]
    });

    const resultText = response.text.trim();
    const cleanJsonText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const foodData = JSON.parse(cleanJsonText);

    return res.status(200).json({ success: true, data: foodData });

  } catch (error) {
    console.error('AI Analysis Error:', error);
    return res.status(500).json({ success: false, error: '画像解析に失敗しました。' });
  }
}