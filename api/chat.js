// api/chat.js — Chat GPT phản hồi nhanh, không cần import node-fetch
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { message, contextIndex } = req.body || {};
  if (!message) return res.status(400).json({ error: "No message provided" });

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(500).json({ error: "OPENAI_API_KEY not found" });

  const QUESTIONS = [
    "Chào bạn, hôm nay bạn thế nào?",
    "Tôi thấy bạn thường đến họp hơi trễ vài phút. Bạn nghĩ sao về điều này?",
    "Tôi đã giúp bạn hoàn thành phần bài của bạn rồi đó.",
    "Cảm ơn bạn vì cuộc trao đổi hôm nay."
  ];

  const currentContext = QUESTIONS[Math.min(contextIndex || 0, QUESTIONS.length - 1)];
  const systemPrompt = `
  Bạn là Mỹ Tiên — một chuyên viên nhân sự chuyên nghiệp, giọng nữ nhẹ nhàng và thân thiện.
  Trả lời ngắn gọn (1–2 câu), bằng tiếng Việt, tự nhiên, đúng nội dung.
  Nếu là câu hỏi cuối, hãy nói lời cảm ơn và tạm biệt.
  `;
  const userPrompt = `Câu hỏi hiện tại: "${currentContext}"\nỨng viên nói: "${message}"\nHãy phản hồi tự nhiên.`;

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 120
      })
    });

    const j = await r.json();
    const reply = j.choices?.[0]?.message?.content?.trim() || "Cảm ơn bạn nhé!";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: err.message });
  }
}
