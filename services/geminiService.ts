import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Initialize the client
// API key is strictly from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the assistant
const SYSTEM_INSTRUCTION = `You are FocusFlow AI, an intelligent productivity assistant embedded in a comprehensive study and work management app.
Your goal is to help users organize their life, break down complex tasks, explain academic concepts, and provide motivation.
The app includes modules for:
- Dashboard (Overview of progress)
- Task Management (To-dos, projects)
- Focus Timer (Pomodoro technique)
- Journaling & Social Study Rooms (Coming soon)

You have access to a "Thinking Mode" for complex queries which allows you to reason deeply before answering.
Keep answers concise and actionable unless asked for a detailed explanation. Use Markdown for formatting.`;

/**
 * Creates a chat session with the specific model configuration requested.
 * Uses gemini-3-pro-preview with a high thinking budget for complex reasoning tasks.
 */
export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: {
        thinkingBudget: 32768, // Max budget for deep reasoning
      },
    },
  });
};

/**
 * Sends a message to the chat and returns a stream of responses.
 */
export const sendMessageStream = async (
  chat: Chat,
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    return await chat.sendMessageStream({ message });
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

/**
 * Generates a short, daily reflective prompt.
 */
export const getDailyPrompt = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a short, one-sentence reflective prompt for a student or professional to start their day. It should be inspiring and thought-provoking. For example: 'What is one thing you are grateful for today?' or 'What is a small step you can take towards a big goal?'",
    });
    return response.text?.trim() || "What will you accomplish today?";
  } catch (error) {
    console.error("Error fetching daily prompt:", error);
    return "What is your main focus for today?"; // Return a fallback prompt
  }
};