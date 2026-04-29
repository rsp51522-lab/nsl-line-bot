import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const LINE_TOKEN = "OqLHoETrRgu0+fZtpgBQyMG7jhujFR4o3XZCc7u2mnvERueWQ+hjITWadnoyg3cFStWw3z7MNLnWTWkOZPH/TlUOzq9Q5zrLgBSN/pmzc+Vu8sTg+gIla0QxDymcVyDRPRMeccTMkoXcX8tZ/naVbgdB04t89/1O/w1cDnyilFU=";
const OPENAI_API_KEY = "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";

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  const events = req.body.events;
  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;
      try {
        const aiResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "あなたはNSL相談所の営業支援AIです。固定費削減の提案、営業トーク作成、最適プランの提案を具体的に行ってください。必ず3つの提案パターンを出してください。"
              },
              {
                role: "user",
                content: userMessage
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`
            }
          }
        );
        const replyText = aiResponse.data.choices[0].message.content;
        await axios.post(
          "https://api.line.me/v2/bot/message/reply",
          {
            replyToken: event.replyToken,
            messages: [{ type: "text", text: replyText }]
          },
          {
            headers: {
              Authorization: `Bearer ${LINE_TOKEN}`
            }
          }
        );
      } catch (error) {
        console.error("エラー:", error.response?.data || error.message);
      }
    }
  }
});

app.listen(3000, () => console.log("サーバー起動中"));
