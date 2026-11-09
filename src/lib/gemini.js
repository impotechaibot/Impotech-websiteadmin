import { GoogleGenerativeAI } from '@google/generative-ai';

const key = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = key ? new GoogleGenerativeAI(key) : null;

// ফ্রি টিয়ারে Flash মডেলগুলোই চলে (Pro মডেল পেইড)
const MODEL = 'gemini-2.5-flash';

export const geminiReady = () => Boolean(genAI);

export async function generateText(prompt) {
  if (!genAI) throw new Error('Gemini API key সেট করা নেই');
  const model = genAI.getGenerativeModel({ model: MODEL });
  const res = await model.generateContent(prompt);
  return res.response.text();
}

/** প্রোডাক্টের জন্য বাংলা ডেসক্রিপশন বানায় */
export const generateProductDescription = (name, category) =>
  generateText(
    `তুমি একজন ই-কমার্স কপিরাইটার। "${name}" (ক্যাটাগরি: ${category}) নামের একটি বাইক-অ্যাক্সেসরিজ প্রোডাক্টের জন্য ` +
      `২-৩ বাক্যের আকর্ষণীয় বাংলা ডেসক্রিপশন লেখো। শুধু ডেসক্রিপশন দাও, কোনো ভূমিকা নয়।`
  );

/** SEO মেটা বানায় */
export const generateSeo = (pageName, context) =>
  generateText(
    `"${pageName}" পেজের জন্য একটি SEO title (৬০ অক্ষরের মধ্যে) ও meta description (১৫৫ অক্ষরের মধ্যে) বাংলায় লেখো। ` +
      `প্রসঙ্গ: ${context}. ফরম্যাট: "TITLE: ...\nDESC: ..."`
  );
