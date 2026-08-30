import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export type DependencyStatus = 'installed' | 'outdated' | 'missing';

export interface DependencyInfo {
  id: string;
  name: string;
  status: DependencyStatus;
  current_version?: string;
  required_version: string;
}

export async function detectDependencies(): Promise<DependencyInfo[]> {
  const manifestPath = path.join(process.cwd(), 'harness', 'setup', 'manifest.json');
  const manifestData = await fs.readFile(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestData);

  const results: DependencyInfo[] = [];

  for (const dep of manifest.dependencies) {
    try {
      const { stdout, stderr } = await execAsync(dep.check_command);
      const output = (stdout || stderr).trim();
      
      // Simple logic: if the command succeeds, we assume it's installed.
      // In a more robust system, we would parse `output` to extract the exact version 
      // and compare it against `dep.min_version`.
      // For this v1, if it executes without throwing an error, we mark it as installed.
      
      results.push({
        id: dep.id,
        name: dep.name,
        status: 'installed',
        current_version: 'detected', // Placeholder
        required_version: dep.min_version
      });
      
    } catch (err) {
      results.push({
        id: dep.id,
        name: dep.name,
        status: 'missing',
        required_version: dep.min_version
      });
    }
  }

  return results;
}
