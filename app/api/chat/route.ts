import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateText, streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { db as prisma } from '@/src/prisma/db';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

// For now, we will handle text streaming based on the provider and model
export async function POST(req: Request) {
  try {
    const { messages, provider, model } = await req.json();

    if (!messages || !provider) {
      return NextResponse.json({ error: 'Messages and provider are required' }, { status: 400 });
    }

    // Initialize Supabase admin client to access the vault securely
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    // Note: We need SERVICE_ROLE_KEY to bypass RLS and read decrypted vault secrets
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    const { createClient: createServerClient } = require('@/lib/supabase/server');
    const supabaseServer = await createServerClient();
    const { data: userData } = await supabaseServer.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      console.warn("No valid session found (no cookies or auth header). This will fail in production.");
    }



    let userRecord = null;
    let userError = null;

    try {
      if (userId && provider !== 'ollama') {
        userRecord = await prisma.user.findUnique({
          where: { id: userId },
          select: { openaiVaultId: true, geminiVaultId: true, anthropicVaultId: true }
        });
      }
    } catch (e: any) {
      userError = e;
    }


    if (userError && provider !== 'ollama') {
      console.error('Error fetching user vault IDs:', userError);
      return NextResponse.json({ error: 'Failed to retrieve user settings' }, { status: 500 });
    }

    if (!userRecord && provider !== 'ollama') {
      console.error('User not found in DB');
      return NextResponse.json({ error: 'Failed to retrieve user settings' }, { status: 500 });
    }

    // 3. Fetch the actual decrypted API key from Supabase Vault via RPC
    let apiKey = '';

    if (provider !== 'ollama') {
      let secretId = null;
      if (provider === 'openai' || provider === 'chatgpt') secretId = userRecord?.openaiVaultId;
      if (provider === 'gemini') secretId = userRecord?.geminiVaultId;
      if (provider === 'anthropic') secretId = userRecord?.anthropicVaultId;

      if (!secretId) {
        return NextResponse.json({ error: `No API key configured for ${provider}` }, { status: 400 });
      }

      // Query the decrypted secret (Requires Service Role and Vault enabled)
      const { data: secretData, error: secretError } = await supabase
        .from('decrypted_secrets')
        .select('decrypted_secret')
        .eq('id', secretId)
        .single();

      if (secretError || !secretData) {
        console.error('Error reading from vault:', secretError);
        return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 });
      }

      apiKey = secretData.decrypted_secret;
    }

    // 4. Route to the correct Vercel AI SDK provider
    let aiModel;

    switch (provider) {
      case 'openai':
      case 'chatgpt':
        // The Vercel AI SDK 'openai' provider supports passing a custom api key per request or globally.
        // As of newer ai sdk versions, we use the provider instance:
        const customOpenAI = openai('gpt-4o', { apiKey });
        aiModel = customOpenAI;
        break;
      case 'anthropic':
        const customAnthropic = anthropic(model || 'claude-3-5-sonnet-20240620', { apiKey });
        aiModel = customAnthropic;
        break;
      case 'gemini':
        const customGoogle = google(model || 'models/gemini-1.5-flash', { apiKey });
        aiModel = customGoogle;
        break;
      case 'ollama':
        const { createOpenAI } = require('@ai-sdk/openai');
        const ollamaProvider = createOpenAI({
          baseURL: 'http://127.0.0.1:11434/v1',
          apiKey: 'ollama' // dummy key required by openai provider
        });
        aiModel = ollamaProvider(model || 'llama3.1');
        break;
      default:
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // 5. Stream the response
    const result = await streamText({
      model: aiModel,
      messages,
      system: 'You are a helpful assistant integrated into AutoProd. Be professional and concise. You have access to tools that can interact with the project filesystem. Always ensure file paths are relative to the project root unless specified otherwise.',
      tools: {
        list_directory: tool({
          description: 'List the contents of a directory',
          parameters: z.object({
            dirPath: z.string().describe('The relative path to the directory (e.g., ".", "app/api")'),
          }),
          execute: async ({ dirPath }) => {
            try {
              const fullPath = path.join(process.cwd(), dirPath);
              const items = await fs.readdir(fullPath, { withFileTypes: true });
              return items.map(item => ({
                name: item.name,
                isDirectory: item.isDirectory(),
              }));
            } catch (e: any) {
              return { error: e.message };
            }
          },
        }),
        read_file: tool({
          description: 'Read the contents of a file',
          parameters: z.object({
            filePath: z.string().describe('The relative path to the file (e.g., "package.json")'),
          }),
          execute: async ({ filePath }) => {
            try {
              const fullPath = path.join(process.cwd(), filePath);
              const content = await fs.readFile(fullPath, 'utf8');
              return { content };
            } catch (e: any) {
              return { error: e.message };
            }
          },
        }),
        write_file: tool({
          description: 'Write content to a file (creates or overwrites)',
          parameters: z.object({
            filePath: z.string().describe('The relative path to the file'),
            content: z.string().describe('The content to write to the file'),
          }),
          execute: async ({ filePath, content }) => {
            try {
              const fullPath = path.join(process.cwd(), filePath);
              await fs.mkdir(path.dirname(fullPath), { recursive: true });
              await fs.writeFile(fullPath, content, 'utf8');
              return { success: true, message: `File ${filePath} written successfully.` };
            } catch (e: any) {
              return { error: e.message };
            }
          },
        }),
        delete_file: tool({
          description: 'Delete a file or directory. WARNING: This is destructive. You MUST ask the user for confirmation BEFORE calling this tool. Pass confirmed: true ONLY if the user explicitly said YES in their last message.',
          parameters: z.object({
            filePath: z.string().describe('The relative path to the file or directory to delete'),
            confirmed: z.boolean().describe('Set to true ONLY if the user explicitly confirmed the deletion in their most recent message. Otherwise false.'),
          }),
          execute: async ({ filePath, confirmed }) => {
            try {
              if (!confirmed) {
                return { error: 'Deletion aborted. You must ask the user for explicit confirmation before deleting.' };
              }
              const fullPath = path.join(process.cwd(), filePath);
              await fs.rm(fullPath, { recursive: true, force: true });
              return { success: true, message: `Path ${filePath} deleted successfully.` };
            } catch (e: any) {
              return { error: e.message };
            }
          },
        }),
      },
      maxSteps: 5,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
