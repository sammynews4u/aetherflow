import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';

// Explicitly load the .env file so process.env.DIRECT_URL is available
config();

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL,
  },
});