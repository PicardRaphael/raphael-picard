import { PuppeteerWebBaseLoader } from '@langchain/community/document_loaders/web/puppeteer';

export class WebScraperService {
	async scrapePage(url: string): Promise<string> {
		const loader = new PuppeteerWebBaseLoader(url, {
			launchOptions: {
				headless: true,
			},
			gotoOptions: {
				waitUntil: 'load',
			},
			evaluate: async (page, browser) => {
				const result = await page.evaluate(() => document.body.innerHTML);
				await browser.close();
				return result;
			},
		});
		return (await loader.scrape())?.replace(/<[^>]*>?/gm, '');
	}
}
