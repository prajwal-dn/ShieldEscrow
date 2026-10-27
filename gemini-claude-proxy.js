import http from "node:http";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const PORT = Number(process.env.PORT) || 3456;

function convertAnthropicToGemini(body) {
  const contents = [];
  let systemInstruction = null;

  if (body.system) {
    let sysText = "";
    if (typeof body.system === "string") {
      sysText = body.system;
    } else if (Array.isArray(body.system)) {
      sysText = body.system.map(s => s.text || "").join("\n");
    }
    if (sysText) {
      systemInstruction = { parts: [{ text: sysText }] };
    }
  }

  for (const msg of body.messages || []) {
    const role = msg.role === "assistant" ? "model" : "user";
    const parts = [];

    if (typeof msg.content === "string") {
      parts.push({ text: msg.content });
    } else if (Array.isArray(msg.content)) {
      for (const item of msg.content) {
        if (item.type === "text" && item.text) {
          parts.push({ text: item.text });
        } else if (item.type === "tool_result") {
          parts.push({
            text: `[Tool Result ${item.tool_use_id}]: ${typeof item.content === "string" ? item.content : JSON.stringify(item.content)}`
          });
        }
      }
    }

    if (parts.length > 0) {
      contents.push({ role, parts });
    }
  }

  // Ensure conversation alternates correctly or has at least one message
  if (contents.length === 0) {
    contents.push({ role: "user", parts: [{ text: "Hello" }] });
  }

  const geminiPayload = { contents };
  if (systemInstruction) {
    geminiPayload.systemInstruction = systemInstruction;
  }

  return geminiPayload;
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok", provider: "gemini", model: DEFAULT_GEMINI_MODEL }));
  }

  // Capture POST body
  let rawBody = "";
  for await (const chunk of req) {
    rawBody += chunk;
  }

  let body = {};
  try {
    body = JSON.parse(rawBody || "{}");
  } catch (err) {
    console.error("Failed to parse request JSON:", err.message);
  }

  console.log(`[Proxy] ${req.method} ${req.url} (stream=${Boolean(body.stream)})`);

  try {
    const geminiPayload = convertAnthropicToGemini(body);
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[Proxy] Gemini API error:", geminiRes.status, errText);
      res.writeHead(geminiRes.status, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: { message: errText } }));
    }

    const geminiData = await geminiRes.json();
    const candidate = geminiData.candidates?.[0];
    const textPart = candidate?.content?.parts?.find(p => p.text)?.text || "";
    const promptTokens = geminiData.usageMetadata?.promptTokenCount || 50;
    const completionTokens = geminiData.usageMetadata?.candidatesTokenCount || 20;

    const msgId = "msg_" + Math.random().toString(36).substring(2, 12);

    if (body.stream) {
      // Stream Anthropic SSE events
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });

      const sendEvent = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      sendEvent("message_start", {
        type: "message_start",
        message: {
          id: msgId,
          type: "message",
          role: "assistant",
          content: [],
          model: DEFAULT_GEMINI_MODEL,
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: promptTokens, output_tokens: 1 },
        },
      });

      sendEvent("content_block_start", {
        type: "content_block_start",
        index: 0,
        content_block: { type: "text", text: "" },
      });

      sendEvent("content_block_delta", {
        type: "content_block_delta",
        index: 0,
        delta: { type: "text_delta", text: textPart },
      });

      sendEvent("content_block_stop", {
        type: "content_block_stop",
        index: 0,
      });

      sendEvent("message_delta", {
        type: "message_delta",
        delta: { stop_reason: "end_turn", stop_sequence: null },
        usage: { output_tokens: completionTokens },
      });

      sendEvent("message_stop", { type: "message_stop" });
      return res.end();
    } else {
      // Non-streaming Anthropic format
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        id: msgId,
        type: "message",
        role: "assistant",
        content: [{ type: "text", text: textPart }],
        model: DEFAULT_GEMINI_MODEL,
        stop_reason: "end_turn",
        usage: {
          input_tokens: promptTokens,
          output_tokens: completionTokens,
        },
      }));
    }
  } catch (err) {
    console.error("[Proxy] Internal error:", err.message);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: err.message } }));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[Gemini-Claude Proxy] Listening on http://127.0.0.1:${PORT}`);
});
