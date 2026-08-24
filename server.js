require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { z } = require('zod');

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. IN-MEMORY LEDGER (Zero Latency MVP)
// ==========================================
const db = {
    webhooks: [],
    healingLogs: []
};

// ==========================================
// 2. THE TARGET CONTRACT (Zod Schema)
// ==========================================
const targetSchema = z.object({
    userId: z.string().uuid(),
    accountStatus: z.enum(["active", "suspended", "pending"]),
    transactionAmount: z.number().positive()
});

// ==========================================
// 3. AI SELF-HEALING ENGINE (Mocked)
// ==========================================
async function invokeAIHealer(brokenPayload, errorMessage) {
    console.log("-> [AI ENGINE] Analyzing schema drift and matching intent...");
    
    // Simulating LLM API latency
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const healedPayload = {
        userId: brokenPayload.user_id || "550e8400-e29b-41d4-a716-446655440000",
        accountStatus: brokenPayload.status || "active",
        transactionAmount: Number(brokenPayload.amount) || 100
    };
    
    return {
        healedPayload,
        confidence: 0.98,
        patchNotes: "Mapped 'user_id' to 'userId', cast 'amount' string to positive number."
    };
}

// ==========================================
// 4. THE GATEWAY ENDPOINT
// ==========================================
app.post('/api/v1/webhook', async (req, res) => {
    const rawPayload = req.body;
    const webhookId = Date.now().toString();
    
    // Log incoming webhook to in-memory array
    db.webhooks.push({ id: webhookId, rawPayload, status: "pending" });

    try {
        // Attempt strict validation
        const validPayload = targetSchema.parse(rawPayload);
        console.log(`[SUCCESS] Payload Validated Natively.`);
        return res.status(200).json({ status: "success", data: validPayload });

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log(`\n[CRITICAL] Schema Mismatch Detected. Engaging AetherFlow AI...`);
            
            try {
                // Route to Self-Healing Engine
                const aiResponse = await invokeAIHealer(rawPayload, error.errors);
                
                // Validate the AI's fix
                const verifiedFix = targetSchema.parse(aiResponse.healedPayload);
                
                // Log the Audit Trail
                db.healingLogs.push({
                    webhookId,
                    originalPayload: rawPayload,
                    healedPayload: verifiedFix,
                    notes: aiResponse.patchNotes
                });

                console.log(`[RESOLVED] AI Successfully Mapped Payload:`, verifiedFix);
                return res.status(200).json({ 
                    status: "healed", 
                    message: "Payload dynamically patched by AI.",
                    data: verifiedFix 
                });

            } catch (aiError) {
                console.log(`[FATAL] AI failed to heal payload.`);
                return res.status(500).json({ error: "Unrecoverable Schema Drift." });
            }
        }
        return res.status(500).json({ error: "Internal Gateway Error" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 AetherFlow Gateway (In-Memory MVP) running on port ${PORT}`);
});