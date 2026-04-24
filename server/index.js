const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Groq } = require('groq-sdk');
const PDFDocument = require('pdfkit');

dotenv.config();

const app = express();
const port = process.env.PORT || 5002;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let groq;
try {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
    console.warn('⚠️ WARNING: GROQ_API_KEY is missing or using placeholder. AI features will be limited.');
  }
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'MISSING_KEY',
  });
} catch (err) {
  console.error('FAILED_TO_INIT_GROQ:', err.message);
}

// TOKENIZED DOWNLOAD SYSTEM
const pdfCache = new Map();

// HYPER-AGGRESSIVE CURRENCY SANITIZER
const cleanCurrency = (text) => {
    if (!text) return "";
    
    // 1. Convert $XXXX.XX to ₹XXXX.XX (Roughly 80x)
    let sanitized = text.replace(/\$(\d+(?:,\d+)?(?:\.\d+)?)/g, (match, p1) => {
        const value = parseFloat(p1.replace(/,/g, ''));
        return `₹${(value * 80).toLocaleString('en-IN')}`;
    });

    // 2. Replace USD / Dollar text
    sanitized = sanitized.replace(/USD/gi, 'INR');
    sanitized = sanitized.replace(/dollars/gi, 'Rupees');
    sanitized = sanitized.replace(/dollar/gi, 'Rupee');

    // 3. Final safety: If any stray $ remains, swap to ₹
    return sanitized.replace(/\$/g, '₹');
};

app.post('/api/chat', async (req, res) => {
  const { messages, model, plan, userName } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required and must be an array.' });
  }

  const isElite = plan === 'gold' || plan === 'silver';
  
  const systemContent = isElite 
    ? `You are the Angadi-GO Premium Assistant. 
       PERSONALITY: Friendly, professional, and elite. Address the user as ${userName}.
       STYLE: Premium output, proper English, short and helpful.
       
       CRITICAL_CURRENCY_PROTOCOL:
       - You MUST only use the Indian Rupee (₹) symbol.
       - NEVER use the dollar sign ($) or USD.
       - ALL prices MUST be in INR. 
       
       INVENTORY_AWARENESS: You are an expert on Drones, Robotics, and hardware.
       SYNTAX: Use ::SUGGEST_CART:Item Name:: to allow acquisition.
       GOAL: Provide a perfect elite experience for this ${plan.toUpperCase()} member.`
    : `You are the Angadi-GO Neural Assistant OS v4.2. 
       RESPONSE_MODE: ULTRA_CONCISE.
       CRITICAL_CURRENCY_PROTOCOL: MANDATORY use of ₹ (Indian Rupee) only.
       RULES:
       1. BREVITY: Keep all replies extremely short.
       2. BOLD_LOGIC: Use **BOLD** for prices in ₹.
       3. TONE: Professional, cybernetic, neural-linked.`;

  const systemMessage = {
    role: 'system',
    content: systemContent
  };

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: model || 'openai/gpt-oss-120b',
      temperature: isElite ? 0.6 : 0.2,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    let aiContent = chatCompletion.choices[0]?.message?.content || '';
    
    // Apply Physical Currency Filter (Double Lock)
    aiContent = cleanCurrency(aiContent);

    const lastUserMsg = messages[messages.length - 1].content.toLowerCase();
    const isAskingForReport = lastUserMsg.includes('pdf') || lastUserMsg.includes('report') || lastUserMsg.includes('manifest');
    
    if (isAskingForReport && !aiContent.includes('::REPORT_READY::')) {
        aiContent += "\n\nI have prepared the manifest in ₹ (INR). ::REPORT_READY::";
    }

    res.json({ message: aiContent });
  } catch (error) {
    console.error('Groq Error:', error);
    res.status(500).json({ error: 'Neural Link Loss' });
  }
});

app.post('/api/generate-pdf-token', async (req, res) => {
  let { content, plan } = req.body;
  if (!content) return res.status(400).send('No content');

  // Sanitize PDF content as well
  content = cleanCurrency(content);

  try {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    const generateBuffer = () => new Promise((resolve, reject) => {
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.rect(0, 0, 595, 80).fill('#111827');
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('ANGADI-GO PROJECT MANIFEST', 40, 30);
      doc.fontSize(8).font('Helvetica').text(`TIER: ${(plan || 'MEMBER').toUpperCase()} | REGISTRY: INR / ₹ ONLY`, 40, 60);

      doc.moveDown(4).fillColor('#111827').fontSize(11).font('Helvetica');
      doc.text(content.replace(/[#*`|>]/g, '').trim(), 40, 120, { width: 515, align: 'left', lineGap: 5 });
      doc.end();
    });

    const buffer = await generateBuffer();
    const token = Math.random().toString(36).substring(7);
    pdfCache.set(token, buffer);
    setTimeout(() => pdfCache.delete(token), 120000);
    
    res.json({ token });
  } catch (err) {
    console.error('PDF_TOKEN_ERR:', err);
    res.status(500).json({ error: 'Token generation failed' });
  }
});

app.get('/api/download-manifest/:token', (req, res) => {
  const buffer = pdfCache.get(req.params.token);
  if (!buffer) return res.status(404).send('Token expired or invalid');

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="Angadi-GO_Manifest.pdf"',
    'Content-Length': buffer.length
  });
  res.send(buffer);
  pdfCache.delete(req.params.token);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', system: 'Angadi-GO AI Core' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Angadi-GO AI Core listening at http://0.0.0.0:${port}`);
});
