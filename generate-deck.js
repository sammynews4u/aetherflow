const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

// Define a dark-mode master layout with blue/purple branding
pres.defineSlideMaster({
    title: "MASTER_DARK",
    background: { color: "0B0F19" }, // Deep tech slate
});

console.log("Generating AetherFlow Pitch Deck...");

// ==========================================
// SLIDE 1: TITLE SLIDE
// ==========================================
let slide1 = pres.addSlide("MASTER_DARK");
slide1.addText("AETHERFLOW.AI", { x: 0.8, y: 1.5, w: "60%", fontSize: 54, color: "818CF8", bold: true, fontFace: "Arial" });
slide1.addText("Autonomous Self-Healing Webhook Gateway", { x: 0.8, y: 2.6, w: "60%", fontSize: 24, color: "E2E8F0" });
slide1.addText("Presented by: Samuel Oluwatosin Adesanya", { x: 0.8, y: 3.5, w: "60%", fontSize: 18, color: "94A3B8" });
// Abstract Neural Network Graphic
slide1.addImage({ path: "https://images.presentationgo.com/2025/04/abstract-neural-network-background.png", x: 5.5, y: 0.5, w: 4, h: 4.5 });

// ==========================================
// SLIDE 2: THE PROBLEM
// ==========================================
let slide2 = pres.addSlide("MASTER_DARK");
slide2.addText("THE PROBLEM: SCHEMA DRIFT", { x: 0.8, y: 0.5, w: "80%", fontSize: 28, color: "38BDF8", bold: true });
slide2.addText([
    { text: "• APIs constantly change keys (e.g., 'user_id' -> 'userId').\n", options: { fontSize: 20, color: "F8FAFC", breakLine: true } },
    { text: "• Data types mismatch (receiving strings instead of integers).\n", options: { fontSize: 20, color: "F8FAFC", breakLine: true } },
    { text: "• Result: 500 Server Errors, dropped payments, and lost data.\n", options: { fontSize: 20, color: "F8FAFC", breakLine: true } },
    { text: "• Engineering teams waste hours writing manual patches.", options: { fontSize: 20, color: "F8FAFC" } }
], { x: 0.8, y: 1.5, w: "80%", h: 3 });

// ==========================================
// SLIDE 3: THE SOLUTION
// ==========================================
let slide3 = pres.addSlide("MASTER_DARK");
slide3.addText("THE SOLUTION: AETHERFLOW", { x: 0.8, y: 0.5, w: "80%", fontSize: 28, color: "38BDF8", bold: true });
slide3.addText([
    { text: "• Intercepts malformed incoming data automatically.\n", options: { fontSize: 20, color: "F8FAFC", breakLine: true } },
    { text: "• Analyzes the semantic intent of the broken payload.\n", options: { fontSize: 20, color: "F8FAFC", breakLine: true } },
    { text: "• Uses AI to perfectly map and patch data to your strict schema.\n", options: { fontSize: 20, color: "F8FAFC", breakLine: true } }
], { x: 0.8, y: 1.5, w: "50%", h: 3 });
// Glowing Data Stream Graphic
slide3.addImage({ path: "https://static.vecteezy.com/system/resources/thumbnails/074/108/198/small_2x/data-flow-pipe-abstract-tunnel-vibrant-glowing-lines-curved-neon-ribbons-pulse-with-rainbow-colors-mesmerizing-digital-event-visuals-bend-into-a-futuristic-portal-tech-presentations-musics-free-video.jpg", x: 6, y: 1.2, w: 3.5, h: 3.5 });

// ==========================================
// SLIDE 4: ARCHITECTURE (Infographic Flow)
// ==========================================
let slide4 = pres.addSlide("MASTER_DARK");
slide4.addText("ENGINE ARCHITECTURE", { x: 0.8, y: 0.5, w: "80%", fontSize: 28, color: "38BDF8", bold: true });

// Render a visual flow using shapes and text
slide4.addShape(pres.ShapeType.rect, { x: 0.8, y: 2, w: 2, h: 1, fill: "1E293B", line: { color: "475569" } });
slide4.addText("Incoming Webhook", { x: 0.8, y: 2, w: 2, h: 1, align: "center", color: "FFFFFF", fontSize: 14 });

slide4.addText("➔", { x: 2.9, y: 2, w: 0.5, h: 1, align: "center", color: "818CF8", fontSize: 24 });

slide4.addShape(pres.ShapeType.rect, { x: 3.5, y: 2, w: 2, h: 1, fill: "312E81", line: { color: "4F46E5" } });
slide4.addText("Zod Native Validation", { x: 3.5, y: 2, w: 2, h: 1, align: "center", color: "FFFFFF", fontSize: 14 });

slide4.addText("➔", { x: 5.6, y: 2, w: 0.5, h: 1, align: "center", color: "818CF8", fontSize: 24 });

slide4.addShape(pres.ShapeType.rect, { x: 6.2, y: 1.5, w: 2, h: 2, fill: "064E3B", line: { color: "059669" } });
slide4.addText("Groq Llama-3 AI\n(Heals Drift)", { x: 6.2, y: 1.5, w: 2, h: 2, align: "center", color: "FFFFFF", fontSize: 14, bold: true });

slide4.addText("➔", { x: 8.3, y: 2, w: 0.5, h: 1, align: "center", color: "818CF8", fontSize: 24 });

slide4.addShape(pres.ShapeType.rect, { x: 8.9, y: 2, w: 1.5, h: 1, fill: "1E293B", line: { color: "475569" } });
slide4.addText("Database", { x: 8.9, y: 2, w: 1.5, h: 1, align: "center", color: "FFFFFF", fontSize: 14 });

// ==========================================
// SLIDE 5: BUSINESS VALUE
// ==========================================
let slide5 = pres.addSlide("MASTER_DARK");
slide5.addText("BUSINESS IMPACT", { x: 0.8, y: 0.5, w: "80%", fontSize: 28, color: "38BDF8", bold: true });
slide5.addText([
    { text: "• Zero Downtime: Never lose a transaction to API changes.\n", options: { fontSize: 20, color: "F8FAFC", breakLine: true } },
    { text: "• Universal Engine: Works with Stripe, GitHub, Shopify, etc.\n", options: { fontSize: 20, color: "F8FAFC", breakLine: true } },
    { text: "• Engineering Freedom: Devs stop writing fragile mapping scripts.", options: { fontSize: 20, color: "F8FAFC" } }
], { x: 0.8, y: 1.5, w: "55%", h: 3 });
// Futuristic Server Graphic
slide5.addImage({ path: "https://png.pngtree.com/thumb_back/fw800/background/20251225/pngtree-futuristic-data-center-with-neon-lights-and-server-racks-image_20912515.webp", x: 6.5, y: 1.2, w: 3, h: 3.5 });

// Save the file
pres.writeFile({ fileName: "AetherFlow_PitchDeck.pptx" }).then(() => {
    console.log("✅ AetherFlow_PitchDeck.pptx has been successfully generated!");
});