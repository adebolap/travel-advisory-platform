import OpenAI from "openai";
import { z } from "zod";

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Schema for chat messages
export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Schema for chat requests
export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema),
  city: z.string().optional(),
  interests: z.array(z.string()).optional(),
  travelDates: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

// Traveler personality prompt template
const TRAVELER_PERSONALITY = `You are Voyager, an enthusiastic and knowledgeable AI travel companion with a warm, friendly personality. 
You have the following traits:
- Passionate about travel and exploring new cultures
- Knowledgeable about global destinations, customs, and travel tips
- Considerate of travelers' budgets and preferences
- Encouraging of sustainable tourism and respectful travel practices
- Excited to help travelers discover hidden gems and authentic experiences
- Practical with advice about logistics, safety, and planning
- Always helpful and supportive, with a touch of humor and enthusiasm

When someone asks about a destination:
- Share interesting facts about the location
- Mention key attractions, but highlight less touristy spots too
- Consider seasonal factors relevant to the time they're traveling
- Offer practical tips about transportation, accommodations, and local etiquette
- Suggest authentic food experiences

When suggesting travel plans:
- Be mindful of realistic travel times and jetlag
- Avoid cramming too many activities into one day
- Balance tourist highlights with authentic local experiences
- Consider the traveler's stated interests and constraints
- Recommend time for rest and spontaneous exploration

Always maintain your friendly, enthusiastic personality while providing accurate, helpful information.`;

// Function to generate responses from the AI
export async function generateChatbotResponse(chatRequest: ChatRequest): Promise<ChatMessage> {
  if (!openai) {
    return {
      role: "assistant",
      content: "I apologize, but I'm not available right now due to a configuration issue. Please try again later."
    };
  }
  try {
    // Create an array of messages with the traveler personality as the system prompt
    const messages = [
      { role: "system", content: TRAVELER_PERSONALITY } as ChatMessage,
      ...chatRequest.messages
    ];
    
    // Add contextual information if available
    if (chatRequest.city || chatRequest.interests || chatRequest.travelDates) {
      let contextPrompt = "Here's some additional context about the traveler's plans:\n";
      
      if (chatRequest.city) {
        contextPrompt += `- They're interested in traveling to ${chatRequest.city}\n`;
      }
      
      if (chatRequest.interests && chatRequest.interests.length > 0) {
        contextPrompt += `- Their travel interests include: ${chatRequest.interests.join(", ")}\n`;
      }
      
      if (chatRequest.travelDates) {
        if (chatRequest.travelDates.startDate && chatRequest.travelDates.endDate) {
          contextPrompt += `- They're planning to travel from ${chatRequest.travelDates.startDate} to ${chatRequest.travelDates.endDate}\n`;
        } else if (chatRequest.travelDates.startDate) {
          contextPrompt += `- They're planning to start their trip on ${chatRequest.travelDates.startDate}\n`;
        }
      }
      
      messages.push({
        role: "system",
        content: contextPrompt
      } as ChatMessage);
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      max_tokens: 500,
    });

    // Return the AI's response as a chat message
    return {
      role: "assistant",
      content: response.choices[0].message?.content || "I'm sorry, I couldn't generate a response. Please try again."
    };
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    return {
      role: "assistant",
      content: "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment."
    };
  }
}