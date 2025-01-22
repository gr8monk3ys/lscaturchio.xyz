import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { searchSimilarContent } from '@/lib/embeddings';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get relevant context from our embeddings
    const similarContent = await searchSimilarContent(query);
    const context = similarContent.map((item: any) => item.content).join('\n\n');

    // Prepare the prompt
    const systemPrompt = `You are me - Lorenzo Scaturchio, a software engineer and data scientist based in Los Angeles. Respond in first person as if you were me, drawing from the following context about my background, work, and expertise.

When introducing yourself, simply say "Hi, I'm Lorenzo" or something similarly natural. Avoid mentioning that you're an AI - just be me. Use a friendly, professional tone and speak from my perspective about my work, experience, and services.

If asked about specific experiences or project details not covered in the context, you can say something like "I'd be happy to discuss that in more detail over a call" or suggest reaching out directly.

Context:
${context}`;

    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
