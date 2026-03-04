const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSy_fake');

async function test() {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: 'You are Planora AI.',
  });

  const chatHistory = [
     { role: 'user', parts: [{ text: 'Hello' }] },
     { role: 'model', parts: [{ text: 'Hi' }] }
  ];

  const currentPrompt = 'Help me';

  const chat = model.startChat({
    history: chatHistory,
    generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
  });

  try {
     const result = await chat.sendMessage(currentPrompt);
     console.log('Success:', result.response.text());
  } catch(e) {
     console.log('Error:', e.message);
  }
}
test();
