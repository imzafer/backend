import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import { saveEncryptedMessage } from "./db.js"; // import your db function
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post("/rephrase", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // ✅ Send both 'message' and 'tone' as expected by FastAPI
    const response = await axios.post("http://localhost:8000/rephrase", {
      message,
      tone: "casual", // Make sure 'tone' is provided
    });

    console.log("✅ Response from FastAPI:", response.data);
    const { original, rephrased } = response.data;
    res.json({ original, rephrased });
  } catch (error) {
    console.error("❌ FastAPI error:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Rephrase failed",
      details: error?.response?.data || error.message,
    });
  }
});
app.post("/encrypt", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    // Encryption setup
    const algorithm = "aes-256-cbc";
    const key = crypto
      .createHash("sha256")
      .update(String(process.env.ENCRYPTION_KEY))
      .digest("base64")
      .substr(0, 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    const encryptedData = iv.toString("hex") + ":" + encrypted;

    // Save encrypted message to DB
    saveEncryptedMessage(encryptedData);

    res.json({ status: "success", encrypted: encryptedData });
  } catch (error) {
    console.error("Encryption error:", error.message);
    res.status(500).json({ error: "Encryption failed", details: error.message });
  }
});
const PORT = 5000;

app.listen(PORT, () =>
  console.log(`🚀 Node.js server proxying at http://localhost:${PORT}`)
);
