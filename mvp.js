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
    baseURL: "https://api.groq.com/openai/v1"
});

// ==========================================
// 2. THE CONTRACT (ZOD SCHEMA)
// ==========================================
const targetSchema = z.object({
    transactionId: z.string(),
    totalAmount: z.number().positive(),
    customerEmail: z.string().email().optional(),
    status: z.enum(["active", "pending", "failed"])
});

const targetSchemaString = `{
  "transactionId": "string",
  "totalAmount": "positive number",
  "customerEmail": "string (email, optional)",
  "status": "active | pending | failed"
}`;

// ==========================================
// 3. THE AUTONOMOUS HEALER
// ==========================================
async function invokeAIHealer(brokenPayload) {
    const prompt = `
    You are a strict zero-latency data-healing middleware.
    Your job is to map the provided Broken Payload to the Target Schema.
    Fix data types, infer missing fields, and map mismatched keys.
    
    TARGET SCHEMA:
    ${targetSchemaString}
    
    BROKEN PAYLOAD:
    ${JSON.stringify(brokenPayload)}
    
    Return ONLY a valid JSON object matching the Target Schema perfectly. Do not include markdown formatting or explanations.
    `;

    const response = await openai.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
    });

    const aiResponse = response.choices[0].message.content.trim();
    const cleanJson = aiResponse.replace(/```json/g, "").replace(/```/g, "");
    
    return { healedPayload: JSON.parse(cleanJson) };
}

// ==========================================
// 4. PLATFORM API ROUTES
// ==========================================
app.get('/api/v1/setup', async (req, res) => {
    try {
        const user = await prisma.user.create({
            data: { email: "samuel@aetherflow.ai", name: "Samuel Adesanya" }
        });
        const apiKey = await prisma.apiKey.create({
            data: { key: "aether_test_key_123", name: "Development Key", userId: user.id }
        });
        res.json({ message: "Database seeded!", user, apiKey });
    } catch (error) {
        res.status(500).json({ error: "Setup failed or already ran", details: error.message });
    }
});

app.post('/api/v1/users', async (req, res) => {
    try {
        const { email, name } = req.body;
        const user = await prisma.user.create({ data: { email, name } });
        return res.status(201).json({ status: "success", data: user });
    } catch (error) {
        return res.status(400).json({ error: "Could not create user." });
    }
});

app.post('/api/v1/apikeys', async (req, res) => {
    try {
        const { keyName } = req.body;
        let user = await prisma.user.findFirst();
        if (!user) user = await prisma.user.create({ data: { email: "demo@aetherflow.ai", name: "Demo User" } });

        const rawKey = "aether_" + crypto.randomBytes(24).toString('hex');
        const apiKey = await prisma.apiKey.create({
            data: { key: rawKey, name: keyName || "Production Webhook Key", userId: user.id }
        });
        return res.status(201).json({ status: "success", data: apiKey });
    } catch (error) {
        return res.status(500).json({ error: "Failed to generate API key." });
    }
});

app.post('/api/v1/schemas', async (req, res) => {
    try {
        const { name, schemaDef } = req.body;
        let user = await prisma.user.findFirst();
        if (!user) user = await prisma.user.create({ data: { email: "demo@aetherflow.ai", name: "Demo User" } });
        
        const targetSchema = await prisma.targetSchema.create({
            data: { name: name || "Custom Webhook Schema", schemaDef, userId: user.id }
        });
        return res.status(201).json({ status: "success", data: targetSchema });
    } catch (error) {
        return res.status(500).json({ error: "Failed to save schema." });
    }
});

app.get('/api/v1/schemas', async (req, res) => {
    try {
        let user = await prisma.user.findFirst();
        if (!user) return res.status(200).json({ status: "success", data: [] });

        const schemas = await prisma.targetSchema.findMany({ 
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ status: "success", data: schemas });
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch schemas." });
    }
});

// ==========================================
// 5. THE CORE GATEWAY
// ==========================================
app.post('/api/v1/webhook', async (req, res) => {
    const startTime = Date.now();
    const user = await prisma.user.findFirst();
    const userId = user ? user.id : null; 

    try {
        targetSchema.parse(req.body);
        const computeTime = Date.now() - startTime;
        console.log("[SUCCESS] Payload Validated Natively.");
        
        if (userId) {
            await prisma.webhookLog.create({
                data: { status: "SUCCESS_NATIVE", originalPayload: req.body, computeTimeMs: computeTime, userId: userId }
            });
        }
        return res.status(200).json({ status: "success" });
    } catch (error) {
        console.log("\n[CRITICAL] Schema Mismatch Detected. Engaging AI...");
        try {
            const fix = await invokeAIHealer(req.body);
            const verifiedFix = targetSchema.parse(fix.healedPayload);
            const computeTime = Date.now() - startTime;
            console.log("[RESOLVED] AI Patched Payload:", verifiedFix);
            
            if (userId) {
                await prisma.webhookLog.create({
                    data: { status: "SUCCESS_HEALED", originalPayload: req.body, healedPayload: verifiedFix, computeTimeMs: computeTime, userId: userId }
                });
            }
            return res.status(200).json({ status: "healed", data: verifiedFix });
        } catch (aiError) {
            const computeTime = Date.now() - startTime;
            if (userId) {
                await prisma.webhookLog.create({
                    data: { status: "FAILED", originalPayload: req.body, errorMessage: aiError.message, computeTimeMs: computeTime, userId: userId }
                });
            }
            return res.status(500).json({ error: "Unrecoverable Schema Drift.", details: aiError.message });
        }
    }
});

// ==========================================
// 6. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`\n======================================`);
    console.log(`🚀 AetherFlow Gateway Online`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`======================================\n`);
});

module.exports = app;