// Prints the /cv page (generated from content/*) to public/cv-RaphaelPICARD-IA.pdf.
// usage: node scripts/cv/print.mjs [baseUrl=http://localhost:3000]
import { chromium } from '@playwright/test';
import path from 'node:path';

const base = process.argv[2] ?? 'http://localhost:3000';
const out = path.resolve('public/cv-RaphaelPICARD-IA.pdf');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${base}/cv`, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({
	path: out,
	format: 'A4',
	printBackground: true,
	preferCSSPageSize: true,
	displayHeaderFooter: true,
	headerTemplate: '<span></span>',
	// drawn in the bottom page margin set by the page's @page rule
	footerTemplate:
		'<div style="width:100%;padding:0 13mm;font:8px Inter,Arial,sans-serif;color:#8a84a3;display:flex;justify-content:space-between">' +
		'<span>Raphaël Picard · Senior AI Engineer & Responsable IA</span>' +
		'<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
});
await browser.close();
console.log(`CV written to ${out}`);
