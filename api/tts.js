// api/tts.js — FPT TTS giọng Ban Mai (tối ưu)
const FPT_TTS_ENDPOINT = "https://api.fpt.ai/hmi/tts/v5";
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { text } = req.body || {};
  if (!text || text.trim().length < 2) return res.status(400).json({ error: "No text provided" });

  const API_KEY = process.env.FPT_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "FPT_API_KEY not configured" });

  try {
    const headers = {
      "api_key": API_KEY,
      "voice": "banmai",
      "speed": "0",
      "format": "mp3"
    };

    const ttsResp = await fetch(FPT_TTS_ENDPOINT, {
      method: "POST",
      headers,
      body: text
    });

    const data = await ttsResp.json();
    const asyncUrl = data?.async || data?.message;
    if (!asyncUrl) return res.status(500).json({ error: "No async URL" });

    let audioResp = null;
    for (let i = 0; i < 5; i++) {
      await sleep(400);
      audioResp = await fetch(asyncUrl);
      if (audioResp.ok) break;
    }

    const buf = Buffer.from(await audioResp.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buf);
  } catch (err) {
    console.error("TTS Error:", err);
    res.status(500).json({ error: err.message });
  }
}
