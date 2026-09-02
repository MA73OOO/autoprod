import { db } from './src/prisma/db'; async function main() { console.log(await db.agentTool.findMany({include: {tool: true}})); } main();
