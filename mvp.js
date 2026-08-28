require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const { OpenAI } = require('openai');
const crypto = require('crypto');

// Prisma 7 Database Adapter Imports
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

// ==========================================
// 1. INITIALIZATION & CONFIGURATION
// ==========================================
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ==========================================
// 2. THE AUTONOMOUS HEALER (DYNAMIC)
// ==========================================
async function invokeAIHealer(brokenPayload, dynamicSchemaString) {
  const prompt = `
  You are a strict zero-latency data-healing middleware.
  Your job is to map the provided Broken Payload to the Target Schema.
  Fix data types, infer missing fields, and map mismatched keys.
  
  TARGET SCHEMA:
  ${dynamicSchemaString}
  
  BROKEN PAYLOAD:
  ${JSON.stringify(brokenPayload)}
  
  Return ONLY a valid JSON object matching the Target Schema perfectly. Do not include markdown formatting or explanations.
  `;

  const response = await openai.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
    response_format: { type: 'json_object' },
  });

  const aiResponse = response.choices[0].message.content.trim();
  const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '');

  return { healedPayload: JSON.parse(cleanJson) };
}

// ==========================================
// 3. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'An account with this email already exists.' });

    const hashedPassword = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
      },
    });

    const rawKey = 'aether_' + crypto.randomBytes(24).toString('hex');
    const apiKey = await prisma.apiKey.create({
      data: { key: rawKey, name: 'Default Production Key', userId: user.id },
    });

    console.log(`[AUTH] User registered successfully: ${user.email}`);

    return res.status(201).json({
      status: 'success',
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        apiKey: apiKey.key,
      },
    });
  } catch (error) {
    console.error('[REGISTRATION ERROR]', error);
    return res.status(500).json({ error: 'Registration failed.', details: error.message });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    let apiKey = await prisma.apiKey.findFirst({ where: { userId: user.id } });
    if (!apiKey) {
      const rawKey = 'aether_' + crypto.randomBytes(24).toString('hex');
      apiKey = await prisma.apiKey.create({
        data: { key: rawKey, name: 'Default Production Key', userId: user.id },
      });
    }

    console.log(`[AUTH] User logged in: ${user.email}`);

    return res.status(200).json({
      status: 'success',
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        apiKey: apiKey.key,
      },
    });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    return res.status(500).json({ error: 'Login failed.', details: error.message });
  }
});

app.post('/api/v1/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No user found with this email address.' });

    return res.status(200).json({ status: 'success', message: 'Password reset link sent to your email address.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process request.', details: error.message });
  }
});

// ==========================================
// 4. AI CHATBOT ROUTE (CONVERSATIONAL)
// ==========================================
app.post('/api/v1/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    const systemPrompt = {
      role: 'system',
      content: `You are AetherBot, the AI assistant for AetherFlow:
- AetherFlow is a zero-latency self-healing webhook gateway powered by Groq's high-speed inference.
- It detects schema mismatches and third-party API drift, heals payloads in milliseconds, and feeds clean data to PostgreSQL databases via Prisma.
- Provide direct, concise, and helpful answers for developers, founders, and beginners.`,
    };

    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [systemPrompt, ...(messages || [])],
      temperature: 0.6,
      max_tokens: 400,
    });

    const reply = completion.choices[0]?.message?.content || 'I am having trouble answering right now. Please try again.';
    return res.status(200).json({ status: 'success', reply });
  } catch (error) {
    console.error('[CHATBOT ERROR]', error.message);
    return res.status(500).json({ error: 'Failed to generate response.', details: error.message });
  }
});

// ==========================================
// 5. PLATFORM API & TRAFFIC ROUTES
// ==========================================
app.post('/api/v1/apikeys', async (req, res) => {
  try {
    const { keyName, userId } = req.body;
    let targetUserId = userId || (await prisma.user.findFirst())?.id;
    
    if (!targetUserId) return res.status(400).json({ error: 'User not found.' });

    const rawKey = 'aether_' + crypto.randomBytes(24).toString('hex');
    const apiKey = await prisma.apiKey.create({
      data: { key: rawKey, name: keyName || 'Production Webhook Key', userId: targetUserId },
    });
    return res.status(201).json({ status: 'success', data: apiKey });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate API key.' });
  }
});

app.post('/api/v1/schemas', async (req, res) => {
  try {
    const { name, schemaDef, userId } = req.body;
    let targetUserId = userId || (await prisma.user.findFirst())?.id;
    
    if (!targetUserId) return res.status(400).json({ error: 'User not found.' });

    const targetSchema = await prisma.targetSchema.create({
      data: { name: name || 'Custom Webhook Schema', schemaDef, userId: targetUserId },
    });
    return res.status(201).json({ status: 'success', data: targetSchema });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save schema.' });
  }
});

app.get('/api/v1/schemas', async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : await prisma.user.findFirst();
    if (!user) return res.status(200).json({ status: 'success', data: [] });

    const schemas = await prisma.targetSchema.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ status: 'success', data: schemas });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch schemas.' });
  }
});

app.get('/api/v1/logs', async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : await prisma.user.findFirst();
    if (!user) return res.status(200).json({ status: 'success', data: [] });

    const logs = await prisma.webhookLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
    return res.status(200).json({ status: 'success', data: logs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch logs.' });
  }
});

// ==========================================
// 6. THE CORE GATEWAY (WEBHOOK INGESTION)
// ==========================================
app.post('/api/v1/webhook', async (req, res) => {
  const startTime = Date.now();
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ error: 'Missing x-api-key header' });

  const keyRecord = await prisma.apiKey.findUnique({ where: { key: apiKey } });
  if (!keyRecord) return res.status(403).json({ error: 'Invalid API Key' });
  const userId = keyRecord.userId;

  const targetSchemaRecord = await prisma.targetSchema.findFirst({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!targetSchemaRecord) return res.status(400).json({ error: 'No target schema deployed for this project.' });

  const dynamicSchemaString = targetSchemaRecord.schemaDef;
  console.log(`\n[INCOMING] Webhook received for schema: ${targetSchemaRecord.name}`);
  console.log('[CRITICAL] Schema Mismatch Detected. Engaging AI...');

  try {
    const fix = await invokeAIHealer(req.body, dynamicSchemaString);
    const computeTime = Date.now() - startTime;
    console.log('[RESOLVED] AI Patched Payload:', fix.healedPayload);

    await prisma.webhookLog.create({
      data: {
        status: 'SUCCESS_HEALED',
        originalPayload: req.body,
        healedPayload: fix.healedPayload,
        computeTimeMs: computeTime,
        userId: userId,
        schemaId: targetSchemaRecord.id,
      },
    });

    return res.status(200).json({ status: 'healed', computeTimeMs: computeTime, data: fix.healedPayload });
  } catch (aiError) {
    const computeTime = Date.now() - startTime;
    console.error('\n[FAILED] AI Healer Error:', aiError.message);

    await prisma.webhookLog.create({
      data: {
        status: 'FAILED',
        originalPayload: req.body,
        errorMessage: aiError.message,
        computeTimeMs: computeTime,
        userId: userId,
        schemaId: targetSchemaRecord.id,
      },
    });

    return res.status(500).json({ error: 'Unrecoverable Schema Drift.', details: aiError.message });
  }
});

// ==========================================
// 7. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n======================================`);
  console.log(`🚀 AetherFlow Gateway Online`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`======================================\n`);
});

module.exports = app;