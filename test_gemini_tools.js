import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, tool } from 'ai';
import { z } from 'zod';

const googleProvider = createGoogleGenerativeAI({
  apiKey: 'dummy',
  fetch: async (url, options) => { console.log(options.body); return fetch(url, options); }
});

async function main() {
  console.log("Starting test...");
  try {
    const result = await generateText({
      model: googleProvider('gemini-1.5-pro'),
      messages: [{ role: 'user', content: 'List files in .' }],
      tools: {
        list_dir: tool({
          description: 'List files',
          parameters: z.object({ dirPath: z.string() }),
          execute: async () => 'done'
        })
      },
      maxSteps: 5
    });
    console.log("FINAL TEXT:", result.text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

main();
