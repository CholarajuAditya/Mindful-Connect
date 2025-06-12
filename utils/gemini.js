// utils/gemini-helper.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// --- API Key Validation on Startup ---
// Check if the API key is provided before initializing the AI client
if (!process.env.GEMINI_API_KEY) {
    console.error(
        "CRITICAL ERROR: GEMINI_API_KEY is not set in your .env file!"
    );
    console.error(
        "Please create a .env file in your project root with GEMINI_API_KEY=YOUR_API_KEY."
    );
    process.exit(1); // Exit the application if the key is missing
}

// Initialize the Google Generative AI client once globally
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Tests the validity of the Gemini API key and connectivity.
 * @returns {Promise<boolean>} True if the API key is valid and connection is established, false otherwise.
 */
const testKey = async () => {
    try {
        // Attempt to get a model instance to test connectivity using the global genAI instance
        await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Gemini API Key is valid and connectivity established.");
        return true;
    } catch (e) {
        console.error("Gemini API Key test failed:", e.message || e);
        // Log the specific error for debugging purposes
        console.error(
            "Please ensure your GEMINI_API_KEY is correct and has access to 'gemini-1.5-flash'."
        );
        return false; // Indicate failure
    }
};

// Immediately test the API key on application startup.
// If the key is invalid, the application will exit.
testKey().then((isValid) => {
    if (!isValid) {
        console.error(
            "Application cannot proceed without a valid Gemini API Key. Exiting."
        );
        process.exit(1);
    }
});

/**
 * Sends user input to the Gemini AI model, acting as a professional mental health assistant,
 * and maintains conversational history.
 *
 * @param {string} userInput - The user's current message.
 * @param {Array<Object>} [chatHistory=[]] - An optional array of previous chat messages
 * in the format expected by the Gemini API ({ role: 'user' | 'model', parts: [{ text: '...' }] }).
 * This is crucial for maintaining conversation context.
 * @returns {Promise<{responseText: string, newHistory: Array<Object>}>} An object
 * containing the AI's response text and the updated chat history (including the current turn).
 */
async function getGeminiResponse(userInput, chatHistory = []) {
    try {
        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Define the initial system prompt history (this sets the AI's persona and rules)
        const initialSystemHistory = [
            {
                role: "user",
                parts: [
                    {
                        text: "You are a professional mental health assistant. Only reply to mental health related topics like stress, anxiety, sadness, mindfulness, emotional wellbeing. If anything else is asked, politely decline.",
                    },
                ],
            },
            {
                role: "model",
                parts: [
                    {
                        text: "Understood. I will focus exclusively on mental health topics and politely decline other requests.",
                    },
                ],
            },
        ];

        // Combine the system prompt history with the ongoing chat history provided by the caller
        const fullHistory = [...initialSystemHistory, ...chatHistory];

        // Start a new chat session with the combined history
        const chat = model.startChat({
            history: fullHistory,
            generationConfig: {
                temperature: 0.7, // Controls randomness: 0.0 (deterministic) to 1.0 (very creative)
                maxOutputTokens: 1000, // Maximum number of tokens in the response
            },
        });

        // Send the user's current message.
        // The `sendMessage` method expects an array of Parts (e.g., [{ text: "..." }]) for text content.
        const result = await chat.sendMessage([{ text: userInput }]);

        // Extract the response text
        const response = await result.response;
        const responseText = response.text();

        // Prepare the updated history to be returned.
        // This includes all previous history, the current user message, and the model's response.
        const newHistory = [
            ...fullHistory, // All previous turns (system prompt + past conversation)
            { role: "user", parts: [{ text: userInput }] }, // Current user input
            { role: "model", parts: [{ text: responseText }] }, // Model's response
        ];

        // Return both the response text and the updated history
        return { responseText, newHistory };
    } catch (error) {
        console.error("Gemini API Error:", error);

        // Provide more detailed error logging for debugging purposes, if available
        if (
            error.response &&
            error.response.candidates &&
            error.response.candidates.length > 0
        ) {
            console.error(
                "Gemini API Finish Reason (if applicable):",
                error.response.candidates[0].finishReason
            );
        } else if (error.message) {
            console.error("Error message:", error.message);
        }

        // Return a structured error response, including the original history
        // so the calling application can decide whether to retry or inform the user.
        return {
            responseText:
                "I apologize, but I'm currently experiencing technical difficulties. Please try again later.",
            newHistory: chatHistory, // Return the original history so it's not lost on error
        };
    }
}

// Export the function for use in other modules
export default getGeminiResponse;
