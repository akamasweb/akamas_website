import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Κάθε φάκελος template/<όνομα>/ με δικό του index.html είναι μια ξεχωριστή σελίδα-template
// (π.χ. /template/coffee-shop/). Οι φάκελοι που ξεκινούν με «_» είναι κοινόχρηστα αρχεία, όχι σελίδες.
const templatesDir = path.resolve(import.meta.dirname, 'template')
const templatePages = fs.existsSync(templatesDir)
  ? Object.fromEntries(
      fs
        .readdirSync(templatesDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
        .filter((d) => fs.existsSync(path.join(templatesDir, d.name, 'index.html')))
        .map((d) => [`template-${d.name}`, path.join(templatesDir, d.name, 'index.html')]),
    )
  : {}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        ...templatePages,
      },
    },
  },
})
