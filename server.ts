import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// AI Endpoint: Break down a task into subtasks
app.post('/api/ai/breakdown', async (req: Request, res: Response) => {
  try {
    const { title, category, description } = req.body;
    if (!title || typeof title !== 'string') {
      res.status(400).json({ error: 'Sarlavha talab qilinadi' });
      return;
    }

    const ai = getGemini();
    if (!ai) {
      // Graceful smart fallback when API key is missing
      const fallbackSubtasks = [
        `Rejani aniqlashtirish va kerakli materiallarni tayyorlash`,
        `Asosiy qismni boshlash va birinchi bosqichni bajarish`,
        `Qilingan ishlarni tekshirish va yakunlash`,
      ];
      res.json({
        subtasks: fallbackSubtasks,
        advice: `Vazifani bosqichma-bosqich bajarish muvaffaqiyat garovidir.`,
        source: 'smart-fallback',
      });
      return;
    }

    const prompt = `Foydalanuvchi quyidagi vazifani kiritdi:
Vazifa nomi: "${title}"
Kategoriya: "${category || 'Umumiy'}"
Qo'shimcha tavsif: "${description || ''}"

Iltimos, ushbu vazifani bajarish uchun 3 tadan 5 tagacha qisqa, aniq va amaliy quyi qadamlarga (subtasks) ajratib bering.
Shuningdek, ushbu vazifani tez va samarali bajarish uchun 1 ta qisqa ilhomlantiruvchi maslahat (advice) bering.
Javobni FAQAT quyidagi JSON formatida qaytaring, boshqa hech narsa yozmang:
{
  "subtasks": ["1-qadam...", "2-qadam...", "3-qadam..."],
  "advice": "Qisqa maslahat..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '{}';
    let parsedData = { subtasks: [] as string[], advice: '' };
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback in case JSON parsing fails
      parsedData = {
        subtasks: [
          `Birinchi qadam: ${title} bo'yicha tayyorgarlik`,
          `Ikkinchi qadam: Asosiy vazifani bajarish`,
          `Uchinchi qadam: Natijani tekshirish`,
        ],
        advice: `Kichik qadamlar bilan boshlang, diqqatni bir vaqtda bitta ishga qarating.`,
      };
    }

    res.json({
      subtasks: Array.isArray(parsedData.subtasks) && parsedData.subtasks.length > 0 ? parsedData.subtasks : [
        `Birinchi qadamni rejalashtirish`,
        `Asosiy ishni amalga oshirish`,
        `Natijani yakunlash`,
      ],
      advice: parsedData.advice || `Diqqatni jamlab, har bir qadamni ketma-ket bajaring!`,
      source: 'gemini',
    });
  } catch (error) {
    console.error('Gemini breakdown error:', error);
    res.json({
      subtasks: [
        `Rejalashtirish va kerakli vositalarni hozirlash`,
        `Asosiy qismini boshlash`,
        `Yakuniy natijani ko'rib chiqish`,
      ],
      advice: `Har qanday katta ish kichik birinchi qadamdan boshlanadi!`,
      source: 'fallback-on-error',
    });
  }
});

// AI Endpoint: Productivity Coach advice based on current state
app.post('/api/ai/coach', async (req: Request, res: Response) => {
  try {
    const { totalTasks, completedTasks, pendingTasks, streak } = req.body;
    const ai = getGemini();

    if (!ai) {
      const tips = [
        `Eng qiyin yoki muhim vazifani kunning birinchi yarmida bajarsangiz, qolgan kun ancha yengil o'tadi!`,
        `25 daqiqa qat'iy diqqat bilan ishlab, 5 daqiqa tanaffus qilish samaradorlikni 40% oshiradi.`,
        `Ajoyib ketyapsiz! Bitta bajarilgan vazifa ham sizni maqsadingizga yaqinlashtiradi.`,
      ];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      res.json({ advice: randomTip, source: 'smart-fallback' });
      return;
    }

    const prompt = `Foydalanuvchining bugungi vazifalar holati:
- Jami vazifalar soni: ${totalTasks || 0}
- Bajarilgan: ${completedTasks || 0}
- Qolgan (faol): ${pendingTasks || 0}
- Ketma-ket kunlik davomiylik (streak): ${streak || 1} kun

Foydalanuvchiga o'zbek tilida 1-2 ta jumlada samimiy, quvnoq, jonli va ruhlantiruvchi samaradorlik maslahati yoki xushomuz maqtov yozing.
Faqat matnni qaytaring, ortiqcha belgilarsiz.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    res.json({
      advice: response.text?.trim() || `Diqqatni jamlang, bugungi kuningiz unumli o'tishiga ishonamiz!`,
      source: 'gemini',
    });
  } catch (error) {
    console.error('Gemini coach error:', error);
    res.json({
      advice: `Kichik yutuqlardan quvoning, har bir qadam sizni maqsadingiz sari yetaklaydi!`,
      source: 'fallback',
    });
  }
});

// AI Endpoint: Generate task suggestions based on topic
app.post('/api/ai/suggest', async (req: Request, res: Response) => {
  try {
    const { theme } = req.body;
    const ai = getGemini();

    if (!ai) {
      const presets: Record<string, Array<{ title: string; category: string; priority: string }>> = {
        ish: [
          { title: 'Elektron pochtalarni tekshirish va javob berish', category: 'Ish', priority: 'medium' },
          { title: 'Haftalik hisobotni tayyorlash', category: 'Ish', priority: 'high' },
          { title: 'Jamoa bilan qisqa 15 daqiqalik yig\'ilish', category: 'Ish', priority: 'medium' },
        ],
        oqish: [
          { title: 'Chet tili bo\'yicha 20 ta yangi so\'z yodlash', category: 'O\'qish', priority: 'medium' },
          { title: 'Bugungi dars konspektini qayta ko\'rib chiqish', category: 'O\'qish', priority: 'high' },
          { title: 'Mavzuga oid 1 ta amaliy mashqni yechish', category: 'O\'qish', priority: 'medium' },
        ],
        soglik: [
          { title: 'Ertalabki 15 daqiqalik badantarbiya', category: 'Sog\'liq', priority: 'high' },
          { title: 'Kun davomida kamida 2 litr toza suv ichish', category: 'Sog\'liq', priority: 'medium' },
          { title: 'Kechki 20 daqiqalik toza havoda sayr', category: 'Sog\'liq', priority: 'low' },
        ],
        umumiy: [
          { title: 'Ertangi kun uchun ustuvor 3 ta vazifani belgilash', category: 'Shaxsiy', priority: 'high' },
          { title: 'Ish stolini tartibga keltirish', category: 'Shaxsiy', priority: 'low' },
          { title: '30 daqiqa foydali kitob mutolaa qilish', category: 'O\'qish', priority: 'medium' },
        ],
      };
      const key = (theme && theme.toLowerCase().includes('o\'qish')) ? 'oqish' :
                  (theme && theme.toLowerCase().includes('sog')) ? 'soglik' :
                  (theme && theme.toLowerCase().includes('ish')) ? 'ish' : 'umumiy';
      res.json({ suggestions: presets[key] || presets.umumiy, source: 'preset' });
      return;
    }

    const prompt = `Mavzu: "${theme || 'Bugungi samarali kun'}"
O'zbek tilida ushbu mavzuga mos 3 ta dolzarb, qulay va tez bajariladigan vazifa taklif qiling.
Quyidagi JSON formatda qaytaring:
{
  "suggestions": [
    { "title": "...", "category": "Ish yoki O'qish yoki Shaxsiy yoki Sog'liq", "priority": "high yoki medium yoki low" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let data = { suggestions: [] };
    try {
      data = JSON.parse(response.text || '{}');
    } catch {
      data = { suggestions: [] };
    }

    res.json({
      suggestions: Array.isArray(data.suggestions) && data.suggestions.length > 0 ? data.suggestions : [
        { title: 'Bugungi eng muhim vazifani belgilab olish', category: 'Shaxsiy', priority: 'high' },
        { title: '25 daqiqa chuqur diqqat bilan ishlash', category: 'Ish', priority: 'medium' },
        { title: 'Toza havoda qisqa tanaffus qilish', category: 'Sog\'liq', priority: 'low' },
      ],
      source: 'gemini',
    });
  } catch (error) {
    console.error('Suggest error:', error);
    res.json({
      suggestions: [
        { title: 'Bugungi rejalarni ko\'rib chiqish', category: 'Shaxsiy', priority: 'high' },
        { title: 'Asosiy vazifani bajarish', category: 'Ish', priority: 'medium' },
      ],
      source: 'fallback',
    });
  }
});

// Vite middleware or Static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
