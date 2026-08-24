require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the 'public' folder (for your frontend dashboard)
// Serve static files using absolute paths for Vercel
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve the dashboard on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// 1. INITIALIZE GROQ VIA OPENAI SDK
// ==========================================
const openai = new OpenAI({ 
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1" 
});

// ==========================================
// 2. THE TARGET CONTRACT (Zod Schema)
// ==========================================
const targetSchema = z.object({
    userId: z.string().uuid(),
    accountStatus: z.enum(["active", "suspended", "pending"]),
    transactionAmount: z.number().positive()
});

// ==========================================
// 3. LIVE AI SELF-HEALING ENGINE (Groq)
// ==========================================
async function invokeAIHealer(brokenPayload) {
    console.log("-> [AI ENGINE] Analyzing schema drift and synthesizing patch...");
    
    const prompt = `
    You are an autonomous API self-healing gateway. 
    The following JSON payload failed validation.
    Broken Payload: ${JSON.stringify(brokenPayload)}
    
    You must map the broken data to this exact schema structure:
    {
      "userId": "UUID string (generate a valid random UUID v4 if missing or invalid)",
      "accountStatus": "Must be exactly 'active', 'suspended', or 'pending'",
      "transactionAmount": "Must be a positive number"
    }
    
    Return ONLY a raw JSON object matching this schema. No markdown, no explanations, no backticks.
    `;

    const response = await openai.chat.completions.create({
        model: "openai/gpt-oss-20b", 
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1 
    });

    const healedPayload = JSON.parse(response.choices[0].message.content);
    return { healedPayload };
}

// ==========================================
// 4. THE GATEWAY ENDPOINT
// ==========================================
app.post('/api/v1/webhook', async (req, res) => {
    try {
        // Attempt strict validation natively first
        targetSchema.parse(req.body);
        console.log("[SUCCESS] Payload Validated Natively.");
        return res.status(200).json({ status: "success" });
    } catch (error) {
        console.log("\n[CRITICAL] Schema Mismatch Detected. Engaging AI...");
        
        try {
            // Route to AI Healer
            const fix = await invokeAIHealer(req.body);
            
            // Double-check the AI's work against the strict contract
            const verifiedFix = targetSchema.parse(fix.healedPayload);
            
            console.log("[RESOLVED] AI Patched Payload:", verifiedFix);
            return res.status(200).json({ status: "healed", data: verifiedFix });
        } catch (aiError) {
            console.error("[FATAL ERROR DETAILS]:", aiError.message || aiError);
            return res.status(500).json({ error: "Unrecoverable Schema Drift.", details: aiError.message });
        }
    }
});

// ==========================================
// 5. EXPORT & LOCAL LISTENER
// ==========================================
// Export app for Vercel Serverless deployment
module.exports = app;

// Only run local listener if not in production (Vercel handles its own server)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`🚀 AetherFlow AI Gateway (Groq Powered) running on port ${PORT}`));
}