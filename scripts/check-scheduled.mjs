#!/usr/bin/env node

import { readdir, readFile, appendFile } from 'fs/promises';
import { join } from 'path';
import yaml from 'js-yaml';

const ARTICLES_DIR = join(process.cwd(), 'src/content/articles');
const now = new Date();

try {
  const files = await readdir(ARTICLES_DIR);
  let hasScheduled = false;

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const filePath = join(ARTICLES_DIR, file);
    const content = await readFile(filePath, 'utf-8');

    // Extraire le frontmatter YAML
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) continue;

    const frontmatter = yaml.load(match[1]);
    if (!frontmatter) continue;

    const scheduledDate = frontmatter.scheduledPublishAt;
    if (!scheduledDate) continue;

    const scheduled = new Date(scheduledDate);
    if (scheduled <= now) {
      console.log(`✓ Article ready: ${file} (was scheduled for ${scheduledDate})`);
      hasScheduled = true;
    }
  }

  // Output pour GitHub Actions
  const output = hasScheduled ? 'true' : 'false';
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `has_scheduled=${output}\n`);
  } else {
    console.log(`::set-output name=has_scheduled::${output}`);
  }

  if (hasScheduled) {
    console.log('\n🚀 Publishing scheduled articles...');
  } else {
    console.log('\n✓ No articles to publish at this time');
  }

  process.exit(0);
} catch (err) {
  console.error('Error checking scheduled articles:', err);
  process.exit(1);
}
