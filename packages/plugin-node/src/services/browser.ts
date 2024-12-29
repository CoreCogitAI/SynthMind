import { generateText, IBrowserService, trimTokens } from "@elizaos/core";
import { parseJSONObjectFromText } from "@elizaos/core";
import { Service } from "@elizaos/core";
import { settings } from "@elizaos/core";
import { IAgentRuntime, ModelClass, ServiceType } from "@elizaos/core";
import { stringToUuid } from "@elizaos/core";
import { PlaywrightBlocker } from "@cliqz/adblocker-playwright";
import CaptchaSolver from "capsolver-npm";
import { Browser, BrowserContext, chromium, Page } from "playwright";

/**
 * Asynchronously generates a summary for a given text using a specified AI model.
 * 
 * @param {IAgentRuntime} runtime - The agent runtime to use for the AI model.
 * @param {string} text - The text to generate a summary for.
 * @returns {Promise<{ title: string; description: string }>} A Promise that resolves to an object with the generated title and summary/description.
 */
async function generateSummary(
    runtime: IAgentRuntime,
    text: string
): Promise<{ title: string; description: string }> {
    // make sure text is under 128k characters
    text = trimTokens(text, 100000, "gpt-4o-mini"); // TODO: clean this up

    const prompt = `Please generate a concise summary for the following text:

  Text: """
  ${text}
  """

  Respond with a JSON object in the following format:
  \`\`\`json
  {
    "title": "Generated Title",
    "summary": "Generated summary and/or description of the text"
  }
  \`\`\``;

    const response = await generateText({
        runtime,
        context: prompt,
        modelClass: ModelClass.SMALL,
    });

    const parsedResponse = parseJSONObjectFromText(response);

    if (parsedResponse) {
        return {
            title: parsedResponse.title,
            description: parsedResponse.summary,
        };
    }

    return {
        title: "",
        description: "",
    };
}

/**
 * Represents the content of a page.
 * @typedef {Object} PageContent
 * @property {string} title - The title of the page.
 * @property {string} description - The description of the page.
 * @property {string} bodyContent - The main content of the page.
 */
type PageContent = {
    title: string;
    description: string;
    bodyContent: string;
};

/**
 * Represents a service for managing browser interactions and content retrieval.
 * @extends Service
 * @implements IBrowserService
 */
 */
export class BrowserService extends Service implements IBrowserService {
    private browser: Browser | undefined;
    private context: BrowserContext | undefined;
    private blocker: PlaywrightBlocker | undefined;
    private captchaSolver: CaptchaSolver;
    private cacheKey = "content/browser";

    static serviceType: ServiceType = ServiceType.BROWSER;

/**
 * Register the agent runtime for lazy loading.
 * 
 * @param {IAgentRuntime} runtime - The agent runtime to register
 * @returns {IAgentRuntime} The registered agent runtime
 */
    static register(runtime: IAgentRuntime): IAgentRuntime {
        // since we are lazy loading, do nothing
        return runtime;
    }

/**
 * Get an instance of IBrowserService.
 * @returns {IBrowserService} The instance of IBrowserService.
 */
    getInstance(): IBrowserService {
        return BrowserService.getInstance();
    }

/**
 * Constructor for a new instance of the class.
 */
    constructor() {
        super();
        this.browser = undefined;
        this.context = undefined;
        this.blocker = undefined;
        this.captchaSolver = new CaptchaSolver(
            settings.CAPSOLVER_API_KEY || ""
        );
    }

/**
 * Asynchronously initializes the object.
 */
    async initialize() {}

/**
 * Asynchronously initializes the browser if it is not already initialized.
 * The browser is launched with headless mode enabled and specific arguments to improve performance.
 * The user agent is customized based on the platform to reduce bot detection.
 * If the browser is successfully launched, a new browser context is created with a specified user agent and download behavior.
 */
    async initializeBrowser() {
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: true,
                args: [
                    "--disable-dev-shm-usage", // Uses /tmp instead of /dev/shm. Prevents memory issues on low-memory systems
                    "--block-new-web-contents", // Prevents creation of new windows/tabs
                ],
            });

            const platform = process.platform;
            let userAgent = "";

            // Change the user agent to match the platform to reduce bot detection
            switch (platform) {
                case "darwin":
                    userAgent =
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
                    break;
                case "win32":
                    userAgent =
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
                    break;
                case "linux":
                    userAgent =
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
                    break;
                default:
                    userAgent =
                        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
            }

            this.context = await this.browser.newContext({
                userAgent,
                acceptDownloads: false,
            });

            this.blocker =
                await PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch);
        }
    }

/**
 * Close the browser and associated context.
 * If context exists, it is closed and set to undefined.
 * If browser exists, it is closed and set to undefined.
 */
    async closeBrowser() {
        if (this.context) {
            await this.context.close();
            this.context = undefined;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = undefined;
        }
    }

/**
 * Asynchronously retrieves the content of a web page specified by the given URL using the provided agent runtime.
 *
 * @param {string} url - The URL of the web page to retrieve the content from.
 * @param {IAgentRuntime} runtime - The agent runtime to be used for fetching page content.
 * @returns {Promise<PageContent>} - A promise that resolves to the content of the web page.
 */
    async getPageContent(
        url: string,
        runtime: IAgentRuntime
    ): Promise<PageContent> {
        await this.initializeBrowser();
        return await this.fetchPageContent(url, runtime);
    }

/**
 * Generate a cache key based on the provided URL using stringToUuid function
 * 
 * @param {string} url - The URL to generate the cache key from
 * @returns {string} The generated cache key
 */
    private getCacheKey(url: string): string {
        return stringToUuid(url);
    }

/**
 * Fetches the content of a webpage by providing the URL and the runtime environment.
 * This method handles caching, page initialization, setting headers, blocking ads,
 * navigating to the URL, detecting CAPTCHA, and storing the content in cache.
 * 
 * @param {string} url - The URL of the webpage to fetch content from.
 * @param {IAgentRuntime} runtime - The runtime environment required for fetching webpage content.
 * @returns {Promise<PageContent>} A promise that resolves to the content of the webpage.
 */
    private async fetchPageContent(
        url: string,
        runtime: IAgentRuntime
    ): Promise<PageContent> {
        const cacheKey = this.getCacheKey(url);
        const cached = await runtime.cacheManager.get<{
            url: string;
            content: PageContent;
        }>(`${this.cacheKey}/${cacheKey}`);

        if (cached) {
            return cached.content;
        }

        let page: Page | undefined;

        try {
            if (!this.context) {
                console.log(
                    "Browser context not initialized. Call initializeBrowser() first."
                );
            }

            page = await this.context.newPage();

            // Enable stealth mode
            await page.setExtraHTTPHeaders({
                "Accept-Language": "en-US,en;q=0.9",
            });

            // Apply ad blocker
            if (this.blocker) {
                await this.blocker.enableBlockingInPage(page);
            }

            const response = await page.goto(url, { waitUntil: "networkidle" });

            if (!response) {
                console.log("Failed to load the page");
            }

            if (response.status() === 403 || response.status() === 404) {
                return await this.tryAlternativeSources(url, runtime);
            }

            // Check for CAPTCHA
            const captchaDetected = await this.detectCaptcha(page);
            if (captchaDetected) {
                await this.solveCaptcha(page, url);
            }
            const documentTitle = await page.evaluate(() => document.title);
            const bodyContent = await page.evaluate(
                () => document.body.innerText
            );
            const { title: parsedTitle, description } = await generateSummary(
                runtime,
                documentTitle + "\n" + bodyContent
            );
            const content = { title: parsedTitle, description, bodyContent };
            await runtime.cacheManager.set(`${this.cacheKey}/${cacheKey}`, {
                url,
                content,
            });
            return content;
        } catch (error) {
            console.error("Error:", error);
            return {
                title: url,
                description: "Error, could not fetch content",
                bodyContent: "",
            };
        } finally {
            if (page) {
                await page.close();
            }
        }
    }

/**
 * Check the page for the presence of captcha elements using a list of predefined selectors.
 * 
 * @param {Page} page - The page to check for captcha elements.
 * @returns {Promise<boolean>} A boolean value indicating whether captcha elements were found on the page.
 */
    private async detectCaptcha(page: Page): Promise<boolean> {
        const captchaSelectors = [
            'iframe[src*="captcha"]',
            'div[class*="captcha"]',
            "#captcha",
            ".g-recaptcha",
            ".h-captcha",
        ];

        for (const selector of captchaSelectors) {
            const element = await page.$(selector);
            if (element) return true;
        }

        return false;
    }

/**
 * Solves the CAPTCHA on the provided page with the given URL.
 * Attempts to solve HCaptcha and ReCaptcha challenges using the respective website keys.
 * 
 * @param {Page} page - The Puppeteer page object where the CAPTCHA challenge is presented.
 * @param {string} url - The URL of the webpage with the CAPTCHA challenge.
 * @returns {Promise<void>} - A Promise that resolves once the CAPTCHA has been solved successfully.
 */
    private async solveCaptcha(page: Page, url: string): Promise<void> {
        try {
            const hcaptchaKey = await this.getHCaptchaWebsiteKey(page);
            if (hcaptchaKey) {
                const solution = await this.captchaSolver.hcaptchaProxyless({
                    websiteURL: url,
                    websiteKey: hcaptchaKey,
                });
                await page.evaluate((token) => {
                    // eslint-disable-next-line
                    // @ts-ignore
                    window.hcaptcha.setResponse(token);
                }, solution.gRecaptchaResponse);
                return;
            }

            const recaptchaKey = await this.getReCaptchaWebsiteKey(page);
            if (recaptchaKey) {
                const solution = await this.captchaSolver.recaptchaV2Proxyless({
                    websiteURL: url,
                    websiteKey: recaptchaKey,
                });
                await page.evaluate((token) => {
                    // eslint-disable-next-line
                    // @ts-ignore
                    document.getElementById("g-recaptcha-response").innerHTML =
                        token;
                }, solution.gRecaptchaResponse);
            }
        } catch (error) {
            console.error("Error solving CAPTCHA:", error);
        }
    }

/**
 * Retrieve the hCaptcha website key from a given page by evaluating the content of an iframe.
 * 
 * @param {Page} page - The page to evaluate
 * @returns {Promise<string>} The hCaptcha website key
 */
    private async getHCaptchaWebsiteKey(page: Page): Promise<string> {
        return page.evaluate(() => {
            const hcaptchaIframe = document.querySelector(
                'iframe[src*="hcaptcha.com"]'
            );
            if (hcaptchaIframe) {
                const src = hcaptchaIframe.getAttribute("src");
                const match = src?.match(/sitekey=([^&]*)/);
                return match ? match[1] : "";
            }
            return "";
        });
    }

/**
 * Retrieves and returns the ReCaptcha website key from the given page.
 * 
 * @param {Page} page - The page to retrieve the ReCaptcha website key from.
 * @returns {Promise<string>} The ReCaptcha website key.
 */
    private async getReCaptchaWebsiteKey(page: Page): Promise<string> {
        return page.evaluate(() => {
            const recaptchaElement = document.querySelector(".g-recaptcha");
            return recaptchaElement
                ? recaptchaElement.getAttribute("data-sitekey") || ""
                : "";
        });
    }

/**
 * Tries to fetch page content from alternative sources if the initial fetch fails.
 * First tries the Internet Archive, then falls back to Google Search as a last resort.
 * 
 * @param {string} url - The URL of the page to fetch content from.
 * @param {IAgentRuntime} runtime - The runtime object containing necessary information for executing the fetch operation.
 * @returns {Promise<{ title: string; description: string; bodyContent: string }>} Returns a promise that resolves to an object containing the fetched content (title, description, bodyContent) or an error message if fetching fails.
 */
    private async tryAlternativeSources(
        url: string,
        runtime: IAgentRuntime
    ): Promise<{ title: string; description: string; bodyContent: string }> {
        // Try Internet Archive
        const archiveUrl = `https://web.archive.org/web/${url}`;
        try {
            return await this.fetchPageContent(archiveUrl, runtime);
        } catch (error) {
            console.error("Error fetching from Internet Archive:", error);
        }

        // Try Google Search as a last resort
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        try {
            return await this.fetchPageContent(googleSearchUrl, runtime);
        } catch (error) {
            console.error("Error fetching from Google Search:", error);
            console.error("Failed to fetch content from alternative sources");
            return {
                title: url,
                description:
                    "Error, could not fetch content from alternative sources",
                bodyContent: "",
            };
        }
    }
}
