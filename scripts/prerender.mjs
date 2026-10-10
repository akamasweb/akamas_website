// Τρέχει στο τέλος του npm run build.
// Παράγει έτοιμο HTML για κάθε σελίδα και γλώσσα (/, /en/, /privacy/, /en/privacy/),
// καθώς και τα sitemap.xml και robots.txt.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const { routes, render, head, sitemap, robots } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf-8')
const SEO_BLOCK = /<!--seo-start-->[\s\S]*?<!--seo-end-->/
if (!SEO_BLOCK.test(template) || !template.includes('<!--app-html-->')) {
  throw new Error('Στο index.html λείπουν τα σημεία <!--seo-start-->…<!--seo-end--> ή <!--app-html-->')
}

for (const route of routes) {
  // Συναρτήσεις στο replace, ώστε τυχόν «$» στο κείμενο να μην ερμηνευτούν ειδικά
  const html = template
    .replace('<html lang="el">', () => `<html lang="${route.lang}">`)
    .replace(SEO_BLOCK, () => head(route.lang, route.page))
    .replace('<!--app-html-->', () => render(route.lang, route.page))

  const file = path.join(dist, route.path, 'index.html')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, html)
  console.log(`  prerendered ${route.path}`)
}

fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap())
fs.writeFileSync(path.join(dist, 'robots.txt'), robots())
console.log('  sitemap.xml, robots.txt')

fs.rmSync(ssrDir, { recursive: true, force: true })
