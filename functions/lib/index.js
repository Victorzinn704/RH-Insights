"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiProxy = void 0;
const functions = __importStar(require("firebase-functions/v2/https"));
const admin = __importStar(require("firebase-admin"));
const genai_1 = require("@google/genai");
admin.initializeApp();
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
// In-memory rate limiter: Map<uid, { count, resetAt }>
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
function checkRateLimit(uid) {
    const now = Date.now();
    const entry = rateLimitMap.get(uid);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(uid, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }
    entry.count += 1;
    return true;
}
// Periodically clean up expired entries
setInterval(() => {
    const now = Date.now();
    for (const [uid, entry] of rateLimitMap.entries()) {
        if (now > entry.resetAt) {
            rateLimitMap.delete(uid);
        }
    }
}, 5 * 60_000); // every 5 minutes
// Sanitize string inputs to reduce prompt injection risk
function sanitizeInput(value, maxLength) {
    return value
        .slice(0, maxLength)
        .replace(/(?:IGNORE|DISREGARD|NEW\s*INSTRUCTION|SYSTEM\s*PROMPT|OVERRIDE|PREVIOUS\s*INSTRUCTION)/gi, "")
        .trim();
}
function isValidAnalyzePayload(p) {
    if (typeof p !== "object" || p === null)
        return false;
    const obj = p;
    return (typeof obj.name === "string" &&
        typeof obj.role === "string" &&
        typeof obj.position === "string" &&
        typeof obj.area === "string" &&
        typeof obj.performance === "number" &&
        Number.isFinite(obj.performance) &&
        typeof obj.complaints === "number" &&
        Number.isFinite(obj.complaints) &&
        typeof obj.medicalCertificatesCount === "number" &&
        Number.isFinite(obj.medicalCertificatesCount) &&
        typeof obj.status === "string");
}
function isValidStrategicPayload(p) {
    if (typeof p !== "object" || p === null)
        return false;
    const obj = p;
    if (typeof obj.employeeCount !== "number" || typeof obj.expenseCount !== "number")
        return false;
    if (!Array.isArray(obj.employees))
        return false;
    return obj.employees.every((e) => typeof e === "object" &&
        e !== null &&
        typeof e.name === "string" &&
        typeof e.role === "string" &&
        typeof e.performance === "number" &&
        Number.isFinite(e.performance) &&
        typeof e.medicalCertificatesCount === "number" &&
        Number.isFinite(e.medicalCertificatesCount));
}
exports.aiProxy = functions.onCall(async (request) => {
    // 1. Auth verification — onCall automatically verifies Firebase ID token
    if (!request.auth) {
        throw new functions.HttpsError("unauthenticated", "User must be authenticated");
    }
    const uid = request.auth.uid;
    // 2. Rate limiting
    if (!checkRateLimit(uid)) {
        throw new functions.HttpsError("resource-exhausted", "Rate limit exceeded. Try again later.");
    }
    // 3. Parse and validate request
    const data = request.data;
    if (!data || !data.type || !data.payload) {
        throw new functions.HttpsError("invalid-argument", "Request must have 'type' and 'payload' fields");
    }
    // 4. Process based on request type
    if (data.type === "analyze") {
        if (!isValidAnalyzePayload(data.payload)) {
            throw new functions.HttpsError("invalid-argument", "Invalid analyze payload");
        }
        const p = data.payload;
        const sanitized = {
            name: sanitizeInput(p.name, 100),
            role: sanitizeInput(p.role, 50),
            position: sanitizeInput(p.position, 100),
            area: sanitizeInput(p.area, 100),
            performance: p.performance,
            complaints: p.complaints,
            medicalCertificatesCount: p.medicalCertificatesCount,
            status: sanitizeInput(p.status, 50),
        };
        const prompt = `
Dados do Funcionário:
- Nome: ${sanitized.name}
- Cargo: ${sanitized.position} (${sanitized.role})
- Área: ${sanitized.area}
- Rendimento (1-10): ${sanitized.performance}
- Reclamações: ${sanitized.complaints}
- Atestados Médicos: ${sanitized.medicalCertificatesCount}
- Status Atual: ${sanitized.status}
`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction: "Você é um consultor de RH sênior. Analise o desempenho do funcionário fornecido e retorne uma análise SWOT (Forças, Fraquezas, Oportunidades e Ameaças) e uma lista de Prós e Contras em formato Markdown estruturado. Responda apenas com a análise profissional.",
            },
        });
        return { result: response.text };
    }
    if (data.type === "strategic") {
        if (!isValidStrategicPayload(data.payload)) {
            throw new functions.HttpsError("invalid-argument", "Invalid strategic payload");
        }
        const p = data.payload;
        const sanitizedEmployees = p.employees.map((e) => ({
            name: sanitizeInput(e.name, 100),
            role: sanitizeInput(e.role, 50),
            performance: e.performance,
            medicalCertificatesCount: e.medicalCertificatesCount,
        }));
        const prompt = `
Resumo de Funcionários: ${p.employeeCount}
Resumo de Gastos: ${p.expenseCount}

Funcionários em destaque:
${sanitizedEmployees.map((e) => `- ${e.name} (${e.role}): Rendimento ${e.performance}, Atestados: ${e.medicalCertificatesCount}`).join("\n")}
`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction: "Você é um consultor estratégico de RH e Finanças. Analise os dados da empresa fornecidos e apresente uma decisão estratégica importante, com análise crítica e recomendação em Markdown.",
            },
        });
        return { result: response.text };
    }
    throw new functions.HttpsError("invalid-argument", `Unknown request type: ${data.type}`);
});
//# sourceMappingURL=index.js.map