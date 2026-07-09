import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tempoVitePlugin } from 'tempo-sdk'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tempoVitePlugin(), react()],
})
