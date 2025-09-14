import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import db from '@astrojs/db';

export default defineConfig({
  integrations: [tailwind(), db()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});