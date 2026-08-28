// Test the exact same Ollama flow that route.ts now uses
const OLLAMA_BASE = 'http://127.0.0.1:11434';

const OLLAMA_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'list_directory',
      description: 'List the contents of a directory',
      parameters: {
        type: 'object',
        properties: {
          dirPath: { type: 'string', description: 'The relative path to the directory' },
        },
        required: ['dirPath'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read the contents of a file',
      parameters: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'The relative path to the file' },
        },
        required: ['filePath'],
      },
    },
  },
];

import fsLib from 'fs/promises';
import path from 'path';

async function executeTool(name, args) {
  switch (name) {
    case 'list_directory': {
      const dirPath = args.dirPath || '.';
      const fullPath = path.join(process.cwd(), dirPath);
      const items = await fsLib.readdir(fullPath, { withFileTypes: true });
      return JSON.stringify(items.map(i => ({ name: i.name, isDirectory: i.isDirectory() })));
    }
    case 'read_file': {
      const filePath = args.filePath;
      const fullPath = path.join(process.cwd(), filePath);
      const content = await fsLib.readFile(fullPath, 'utf8');
      return content.length > 2000 ? content.slice(0, 2000) + '\n...[truncated]' : content;
    }
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

async function main() {
  const messages = [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'List the files in the current directory "." and tell me what you see.' },
  ];

  console.log("Sending request to Ollama with tools...\n");

  for (let step = 0; step < 5; step++) {
    const body = {
      model: 'llama3.1:latest',
      messages,
      tools: OLLAMA_TOOLS,
      stream: false,
    };

    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    const msg = data.message;

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      console.log(`[Step ${step}] Tool calls:`, msg.tool_calls.map(tc => tc.function.name));
      messages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls });

      for (const tc of msg.tool_calls) {
        const fnName = tc.function.name;
        const fnArgs = typeof tc.function.arguments === 'string' ? JSON.parse(tc.function.arguments) : tc.function.arguments;
        console.log(`  Executing "${fnName}" with args:`, fnArgs);
        const result = await executeTool(fnName, fnArgs);
        console.log(`  Result (${result.length} chars):`, result.substring(0, 200));
        messages.push({ role: 'tool', content: result });
      }
      continue;
    }

    console.log(`\n[FINAL RESPONSE]:\n${msg.content}\n`);
    return;
  }
  console.log("Max steps reached.");
}

main().catch(console.error);
