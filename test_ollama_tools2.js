import { createOllama } from 'ollama-ai-provider';
import { generateText, tool } from 'ai';
import { z } from 'zod';

const ollamaProvider = createOllama({
  baseURL: 'http://127.0.0.1:11434/api',
});

async function main() {
  console.log("Starting test...");
  try {
    const result = await generateText({
      model: ollamaProvider('llama3.1:latest'),
      messages: [{ role: 'user', content: 'hello' }],
      tools: {
        list_directory: tool({
          description: 'List the contents of a directory',
          parameters: z.object({
            dirPath: z.string(),
          }),
          execute: async ({ dirPath }) => {
            console.log("TOOL CALLED:", dirPath);
            return [{ name: "test.txt", isDirectory: false }];
          }
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
