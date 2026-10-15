import path from 'path';
import fs from 'fs';
import { generatePromptsPdf } from '../src/server/generatePromptsPdf.js';

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const targetPdf = path.join(publicDir, 'speak-dolphin-prompts-compilation.pdf');
  console.log(`Generating prompts compilation PDF at: ${targetPdf}`);
  await generatePromptsPdf(targetPdf);

  const stats = fs.statSync(targetPdf);
  console.log(`Successfully generated PDF! Size: ${stats.size} bytes.`);
}

main().catch((err) => {
  console.error('Failed to generate prompts PDF:', err);
  process.exit(1);
});
