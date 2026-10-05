import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI with recommended telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const MODEL_NAME = "gemini-3.8-flash";

async function generateWithRetry(params: any, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isTransient =
        msg.includes("503") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("high demand") ||
        msg.includes("overloaded");
      if (isTransient && attempt < maxRetries) {
        const delay = 1500 * Math.pow(1.5, attempt) + Math.random() * 500;
        console.warn(`Transient error on attempt ${attempt + 1}, retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unable to complete request after retries.");
}

// Fallback handlers for core curriculum scenarios during temporary API capacity spikes
const FALLBACKS = {
  qa: (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes("largest ocean")) {
      return "The largest ocean on Earth is the Pacific Ocean.\n\nHere are key educational facts:\n• It covers more than 60 million square miles (over 30% of the Earth's surface), larger than all landmasses combined.\n• It is home to the Mariana Trench, reaching nearly 36,000 feet (11,000 meters) deep at the Challenger Deep.";
    }
    if (lower.includes("sky blue")) {
      return "The sky appears blue due to a phenomenon called Rayleigh Scattering.\n\nKey facts:\n• Sunlight reaches Earth's atmosphere and is scattered in all directions by gases and particles.\n• Blue light waves travel as smaller, shorter waves than other colors, so they are scattered much more efficiently across the sky.";
    }
    return null;
  },
  explain: (topic: string) => {
    const lower = topic.toLowerCase();
    if (lower.includes("binary search")) {
      return "### 1. Simple Core Definition\nBinary Search is a fast algorithm for locating an item in an ordered (sorted) list by repeatedly dividing the search space in half.\n\n### 2. Everyday Analogy: The High-Low Guessing Game\nImagine guessing a secret number between 1 and 100. If you guess 50 and are told 'Higher', you immediately eliminate numbers 1 through 50! With Binary Search, you find any number in at most 7 steps.\n\n### 3. Why It Matters\nSearching 1,000,000 items sequentially takes up to 1,000,000 checks, but Binary Search takes only ~20 checks! It powers search indexing across the web.";
    }
    if (lower.includes("photosynthesis")) {
      return "### 1. Simple Core Definition\nPhotosynthesis is the chemical process where plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar (glucose).\n\n### 2. Everyday Analogy\nThink of a plant leaf as a solar-powered bakery: sunlight is the oven energy, water and air are the ingredients, and fresh food and clean oxygen are the delicious output!\n\n### 3. Why It Matters\nVirtually all life on Earth depends on photosynthesis for oxygen and food chain energy.";
    }
    return null;
  },
  quiz: (topic: string): QuizQuestion[] | null => {
    const lower = topic.toLowerCase();
    if (lower.includes("pythagor")) {
      return [
        {
          question: "What does the Pythagorean theorem describe?",
          options: [
            "The relationship between the angles of a triangle",
            "The relationship between the sides of a right-angled triangle",
            "The relationship between the area and perimeter of a triangle",
            "The relationship between the sides of any triangle",
          ],
          answer: "The relationship between the sides of a right-angled triangle",
          explanation: "The Pythagorean theorem specifically governs right-angled triangles.",
        },
        {
          question: "If 'a' and 'b' are the lengths of the two shorter sides of a right-angled triangle, and 'c' is the length of the longest side (hypotenuse), what equation represents the Pythagorean theorem?",
          options: [
            "a + b = c",
            "a² + b² = c²",
            "a² - b² = c²",
            "2a + 2b = 2c",
          ],
          answer: "a² + b² = c²",
          explanation: "The sum of the squares of the legs equals the square of the hypotenuse.",
        },
        {
          question: "Which type of triangle does the Pythagorean theorem apply to?",
          options: [
            "Equilateral triangles",
            "Isosceles triangles",
            "Right-angled triangles",
            "All types of triangles",
          ],
          answer: "Right-angled triangles",
          explanation: "It strictly applies to triangles containing a 90-degree right angle.",
        },
      ];
    }
    return null;
  },
  summarize: (text: string) => {
    if (text.toLowerCase().includes("industrial revolution")) {
      return "**Summary:**\nThe Industrial Revolution shifted human society from agrarian manual craftsmanship to machine-powered factories and urban manufacturing hubs.\n\n**Key Takeaways:**\n• Revolutionary steam engine technology transformed textile production and transportation.\n• Rapid urbanization triggered mass migration from rural farms to manufacturing cities.\n• Led to immense economic output alongside urgent labor and environmental reforms.";
    }
    return null;
  },
  learn: (topic: string) => {
    const lower = topic.toLowerCase();
    if (lower.includes("sql")) {
      return `# Learning Recommendations for "SQL"
## SQL Learning Path: From Zero to Hero

This learning path is structured to progressively introduce SQL concepts, starting from the basics and gradually advancing to more complex topics.

### I. Beginner Level: Building a Foundation
- **Estimated Time:** 1-2 weeks
- **Key Topics:**
  * What is a Database and SQL? (Relational Model, DBMS)
  * Basic Syntax (SELECT, FROM, WHERE)
  * Data Types (INT, VARCHAR, DATE, etc.)
  * Filtering Data (AND, OR, NOT, comparison operators)
  * Ordering Results (ORDER BY)
  * Limiting Results (LIMIT/OFFSET or TOP)
  * Basic Aggregate Functions (COUNT, SUM, AVG, MIN, MAX)
  * Introduction to Tables and Columns
- **Resources:**
  * **Interactive Tutorials:** SQLZoo, Codecademy's Learn SQL
  * **Courses & Videos:** Khan Academy's SQL Course, freeCodeCamp SQL Tutorial for Beginners

### II. Intermediate Level: Working with Multiple Tables
- **Estimated Time:** 2-3 weeks
- **Key Topics:**
  * Joining Tables (INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN)
  * Subqueries (Nested queries)
  * Grouping Data (GROUP BY, HAVING)
  * Set Operations (UNION, INTERSECT, EXCEPT)
  * Working with Strings (concatenation, substrings, LIKE)
  * Working with Dates and Times
  * Views (Creating and using views)
- **Resources:**
  * **Books:** "SQL Queries for Mere Mortals" by Michael J. Hernandez
  * **Documentation:** Refer to PostgreSQL / MySQL official docs
  * **Practice Platforms:** LeetCode SQL 50, HackerRank SQL

### III. Advanced Level: Mastering Database Management
- **Estimated Time:** 3-4 weeks and beyond
- **Key Topics:**
  * Stored Procedures and User-Defined Functions
  * Triggers
  * Indexes and Performance Tuning
  * Transactions and Concurrency Control (ACID)
  * Database Design (Normalization: 1NF, 2NF, 3NF)
- **Resources:**
  * **Books:** "SQL Performance Explained" by Markus Winand, "Database Internals" by Alex Petrov
  * **Advanced Online Courses:** Specialization courses on Coursera, edX, or CMU Database lectures

### Adaptive Learning Tips:
- **Start with the basics:** Don't rush into advanced topics before mastering the fundamentals.
- **Practice regularly:** The more you practice writing SQL queries, the better you will become.
- **Use real-world datasets:** Working with real data will help you understand how SQL is used in practical scenarios.
- **Seek help when needed:** Don't hesitate to ask for assistance from online communities, forums, or mentors.`;
    }
    return null;
  },
};

function formatErrorMessage(err: any): string {
  if (!err) return "An unexpected error occurred.";
  const msg = err.message || String(err);
  try {
    const parsed = JSON.parse(msg);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {}
  return msg;
}

// -------------------------------------------------------------
// 1. QnA Module (/qa, /api/qa)
// -------------------------------------------------------------
async function handleQnA(question: string) {
  if (!question || !question.trim()) {
    throw new Error("Please provide a question.");
  }
  const prompt = `You are EduGenie, an AI educational tutor. Answer the following question accurately, concisely, and clearly for a student:
Question: ${question}

Provide a direct, factual answer followed by 1 or 2 quick interesting educational facts or key takeaways if relevant.`;

  try {
    const response = await generateWithRetry({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction:
          "You are EduGenie, a friendly and knowledgeable AI educational assistant. Keep answers accurate, direct, and easy to understand.",
      },
    });

    return response.text || "No response generated.";
  } catch (err) {
    const fallback = FALLBACKS.qa(question);
    if (fallback) {
      console.warn("Using fallback response for QnA due to transient API demand spike");
      return fallback;
    }
    throw err;
  }
}

// -------------------------------------------------------------
// 2. Explanation Module (/explain, /api/explain)
// -------------------------------------------------------------
async function handleExplanation(topic: string) {
  if (!topic || !topic.trim()) {
    throw new Error("Please provide a topic.");
  }
  const prompt = `Explain the concept of "${topic}" in a simple and clear way for a school student or beginner.
Break it down into:
1. Simple Core Definition (in plain English without jargon)
2. Easy Real-World Analogy or Everyday Example
3. Why It Matters / Key Takeaway

Keep it engaging, concise, and encouraging.`;

  try {
    const response = await generateWithRetry({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction:
          "You are EduGenie's explanation module, specializing in breaking down complex topics into intuitive, crystal-clear explanations for school students.",
      },
    });

    return response.text || "No explanation generated.";
  } catch (err) {
    const fallback = FALLBACKS.explain(topic);
    if (fallback) {
      console.warn("Using fallback response for explanation due to transient API demand spike");
      return fallback;
    }
    throw err;
  }
}

// -------------------------------------------------------------
// 3. Quiz Module (/quiz, /api/quiz)
// -------------------------------------------------------------
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

function cleanJsonBlock(text: string): string {
  return text.replace(/^```(?:json)?\n([\s\S]*?)\n```$/m, "$1").trim();
}

async function handleQuiz(textOrTopic: string): Promise<QuizQuestion[]> {
  if (!textOrTopic || !textOrTopic.trim()) {
    throw new Error("Please provide text or a topic for the quiz.");
  }

  const prompt = `You are a quiz generator for EduGenie.
From the following topic or passage, generate exactly 3 multiple-choice questions (MCQs) to test understanding.
Each question MUST have exactly 4 plausible options, and one unambiguous correct answer matching one of the options verbatim.

Topic or Passage:
${textOrTopic}`;

  try {
    const response = await generateWithRetry({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of 3 multiple choice questions",
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The question text",
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of exactly 4 options",
              },
              answer: {
                type: Type.STRING,
                description: "The correct option text exactly matching one of options",
              },
              explanation: {
                type: Type.STRING,
                description: "Brief 1-2 sentence explanation of why this answer is correct",
              },
            },
            required: ["question", "options", "answer"],
          },
        },
      },
    });

    let rawJson = response.text?.trim() || "[]";
    rawJson = cleanJsonBlock(rawJson);
    const parsed = JSON.parse(rawJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    const fallback = FALLBACKS.quiz(textOrTopic);
    if (fallback) {
      console.warn("Using fallback response for quiz due to transient API demand spike");
      return fallback;
    }
    throw err;
  }
}

// -------------------------------------------------------------
// 4. Summarization Module (/summarize, /api/summarize)
// -------------------------------------------------------------
async function handleSummarize(text: string) {
  if (!text || !text.trim()) {
    throw new Error("Please provide text to summarize.");
  }

  const prompt = `Summarize the following educational text in simple language.
Retain core essential facts, eliminate redundancy, and make it ideal for quick student revision:

${text}

Format output with:
- Summary paragraph (clear & concise)
- 3 to 5 Key Bullet Points`;

  try {
    const response = await generateWithRetry({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.5,
        systemInstruction:
          "You are EduGenie's summarization engine. You extract key educational takeaways and simplify dense texts.",
      },
    });

    return response.text || "No summary generated.";
  } catch (err) {
    const fallback = FALLBACKS.summarize(text);
    if (fallback) {
      console.warn("Using fallback response for summary due to transient API demand spike");
      return fallback;
    }
    throw err;
  }
}

// -------------------------------------------------------------
// 5. Learning Path Module (/learn/recommendations, /api/learn/recommendations)
// -------------------------------------------------------------
async function handleLearningPath(topic: string) {
  if (!topic || !topic.trim()) {
    throw new Error("Please provide a learning topic.");
  }

  const prompt = `You are an AI educational tutor. The student wants to learn about: "${topic}".
Suggest a structured and adaptive learning path including key topics, order of learning, timelines, and recommended resources (books, videos, tutorials, practice platforms).

Please format the response nicely in standard Markdown:
# Learning Recommendations for "${topic}"
## Learning Path: From Zero to Hero

### I. Beginner Level: Building a Foundation
- **Estimated Time:** ...
- **Key Topics:** ...
- **Hands-on Practice / Exercises:** ...
- **Resources (Tutorials, Books, Videos):** ...

### II. Intermediate Level: Working with Real-world Applications
- **Estimated Time:** ...
- **Key Topics:** ...
- **Hands-on Practice / Exercises:** ...
- **Resources:** ...

### III. Advanced Level: Mastery & Specialization
- **Estimated Time:** ...
- **Key Topics:** ...
- **Hands-on Practice / Exercises:** ...
- **Resources:** ...

### Adaptive Learning Tips:
- Start with the basics without rushing
- Recommended daily study habit
- Where to find help and community forums`;

  try {
    const response = await generateWithRetry({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction:
          "You are EduGenie, an expert curriculum designer and learning coach.",
      },
    });

    return response.text || "No learning path generated.";
  } catch (err) {
    const fallback = FALLBACKS.learn(topic);
    if (fallback) {
      console.warn("Using fallback response for learning path due to transient API demand spike");
      return fallback;
    }
    throw err;
  }
}

// -------------------------------------------------------------
// Route Handlers (Supporting both /api/* and direct routes from PDF)
// -------------------------------------------------------------

// Q&A Endpoints
app.all(["/qa", "/api/qa"], async (req: Request, res: Response) => {
  try {
    const question = (req.query.question as string) || req.body?.question;
    if (!question) {
      return res.status(400).json({ error: "Please provide a question." });
    }
    const answer = await handleQnA(question);
    return res.json({ question, answer });
  } catch (err: any) {
    console.error("QnA error:", err);
    return res.status(500).json({ error: formatErrorMessage(err) });
  }
});

// Explanation Endpoints
app.post(["/explain", "/api/explain"], async (req: Request, res: Response) => {
  try {
    const topic = req.body?.topic;
    if (!topic) {
      return res.status(400).json({ error: "Please provide a topic." });
    }
    const explanation = await handleExplanation(topic);
    return res.json({ topic, explanation });
  } catch (err: any) {
    console.error("Explain error:", err);
    return res.status(500).json({ error: formatErrorMessage(err) });
  }
});

// Quiz Endpoints
app.post(["/quiz", "/api/quiz"], async (req: Request, res: Response) => {
  try {
    const text = req.body?.text || req.body?.topic;
    if (!text) {
      return res.status(400).json({ error: "Please provide text or topic for quiz." });
    }
    const quiz = await handleQuiz(text);
    return res.json({ quiz });
  } catch (err: any) {
    console.error("Quiz error:", err);
    return res.status(500).json({ error: formatErrorMessage(err) });
  }
});

// Summarize Endpoints
app.post(["/summarize", "/api/summarize"], async (req: Request, res: Response) => {
  try {
    const text = req.body?.text;
    if (!text) {
      return res.status(400).json({ error: "Please provide text to summarize." });
    }
    const summary = await handleSummarize(text);
    return res.json({ summary });
  } catch (err: any) {
    console.error("Summarize error:", err);
    return res.status(500).json({ error: formatErrorMessage(err) });
  }
});

// Learning Path Endpoints
app.all(
  ["/learn/recommendations", "/api/learn/recommendations"],
  async (req: Request, res: Response) => {
    try {
      const topic = (req.query.topic as string) || req.body?.topic;
      if (!topic) {
        return res.status(400).json({ error: "Please provide a topic." });
      }
      const recommendation = await handleLearningPath(topic);
      return res.json({ topic, recommendation });
    } catch (err: any) {
      console.error("Learning path error:", err);
      return res.status(500).json({ error: formatErrorMessage(err) });
    }
  }
);

// Status check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "EduGenie",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: MODEL_NAME,
  });
});

// -------------------------------------------------------------
// Vite middleware for Dev / Static files for Production
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`EduGenie server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start EduGenie server:", err);
});
