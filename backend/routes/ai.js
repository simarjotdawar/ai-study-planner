const router = require("express").Router();
const axios = require("axios");

const OPENAI_API_KEY = "sk-proj-yZvPqVlyyBtN6fIMCghPnxa65ml";

// 🤖 Generate Notes
router.post("/notes", async (req, res) => {
  const { subject, syllabus } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Create structured study notes for ${subject}.
Syllabus: ${syllabus}.
Include definitions, key points, and important questions.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    res.json({
      notes: response.data.choices[0].message.content,
    });
  } catch (err) {
    res.status(500).send("AI error");
  }
});

// 🤖 Generate Study Plan
router.post("/plan", async (req, res) => {
  const { subject, syllabus, hours, deadline } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Create a day-wise study plan for ${subject}.
Syllabus: ${syllabus}
Hours per day: ${hours}
Deadline: ${deadline}
Make it practical and balanced.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    res.json({
      plan: response.data.choices[0].message.content,
    });
  } catch {
    res.status(500).send("AI error");
  }
});

module.exports = router;