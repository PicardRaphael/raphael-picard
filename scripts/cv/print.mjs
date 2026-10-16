// Prints the /cv page (generated from content/*) to public/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf.
// usage: node scripts/cv/print.mjs [baseUrl=http://localhost:3000]
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';

const base = process.argv[2] ?? 'http://localhost:3000';
const out = path.resolve('public/raphael-picard-cv-senior-ai-engineer-responsable-ia.pdf');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/cv`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.emulateMedia({ media: 'print' });
await page.pdf({
	path: out,
	format: 'A4',
	printBackground: true,
	preferCSSPageSize: true,
	// tagged PDF (structure, /Lang fr from <html lang>) and bookmarks per heading: read better by ATS and screen readers
	tagged: true,
	outline: true,
	displayHeaderFooter: true,
	headerTemplate: '<span></span>',
	// the page number only (drawn in the bottom margin of the @page rule): a repeated name line would be extracted
	// between the bullets of two pages
	footerTemplate: '<div style="width:100%;padding:0 13mm;font:9.5px Arial,sans-serif;color:#6f6889;text-align:right"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
});
await browser.close();

// document properties (title, author, subject, keywords, language) for ATS and file managers
const pdf = await PDFDocument.load(await readFile(out), { updateMetadata: false });
pdf.setTitle('Raphaël Picard — CV Senior AI Engineer & Responsable IA', { showInWindowTitleBar: true });
pdf.setAuthor('Raphaël Picard');
pdf.setSubject('CV : Senior AI Engineer & Responsable IA, agents LLM en production');
pdf.setKeywords(['Senior AI Engineer', 'Responsable IA', 'IA générative', 'agents LLM', 'RAG', 'LLMOps', 'MCP', 'LangGraph', 'Python', 'TypeScript', 'GCP']);
pdf.setLanguage('fr-FR');
pdf.setCreator('raphaelpicard.com');
pdf.setProducer('raphaelpicard.com');
await writeFile(out, await pdf.save({ useObjectStreams: false }));
console.log(`CV written to ${out}`);
