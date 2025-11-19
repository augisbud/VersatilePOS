import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'src/openapi/openapi.json',
  output: 'src/api/',
  plugins: ['@hey-api/client-axios'],
});
