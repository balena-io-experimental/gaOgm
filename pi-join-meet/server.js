const puppeteer = require('puppeteer-extra');
puppeteer.use(require('puppeteer-extra-plugin-stealth')());

async function getConfig() {
	return {
		executablePath: '/usr/bin/chromium-browser',
		args: [
			'--no-sandbox',
			'--use-fake-ui-for-media-stream',
			'--incognito',
		], 
		ignoreDefaultArgs: ['--mute-audio'],
	}
}

async function clickByText (page, text) {
	for (let i = 0; i < 10; i++) {
		const elementsWithText = await page.$x(`//*[contains(text(), '${text}')]`);
		if (elementsWithText.length < 1) {
			console.log(`Didn't find '${text}' yet, waiting...`);
			await page.waitFor(250);
		} else {
			return elementsWithText[0].click();
		}
	}
	throw new Error(`Link not found, even after waiting: '${text}'`);
};

(async () => {
	try {
		const config = await getConfig();
		const browser = await puppeteer.launch(config);
		const page = await browser.newPage();
		const URL = 'https://meet.google.com/znq-kvjd-bqt';
		await page.goto(URL, {waitUntil: 'networkidle2'});
		console.log(`Joined: ${URL}`);
		await clickByText(page, 'Your name');
		await page.keyboard.type(`tob-${Math.random().toString(36).substring(11)}`);
		await page.waitFor(500);
		await page.keyboard.type(String.fromCharCode(9));
		await page.waitFor(500);
		await page.keyboard.type(String.fromCharCode(13));

	} catch (err) {
		console.error(err);
	}
})();