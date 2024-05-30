require('dotenv').config();
import puppeteer from 'puppeteer';

import {
  generateFilename,
  saveResult
} from './util'

import { queries } from './queries'

const puppeteerConfig = {
  headless: true,
  devtools: false,
  timeout: 0,
  defaultViewport: {
    width: 1900,
    height: 1080
  },
  args: [`--window-size=${1900},${1080}`]
}

function getNumberOfResults(textContent) {
  const matches = textContent.match(/([\d,]+)/);
  return parseInt(matches[1].replace(/,/g, ''));
}

(async () => {
  const browser = await puppeteer.launch(puppeteerConfig);
  const page = await browser.newPage();

  await login()

  const filename = generateFilename()

  for (const query of queries) {
    await handleQuery(query, filename)
  }

  async function handleQuery(query, filename) {
    const jobs = await scrapeJobs(query.jobQuery)
    const people = await scrapePeople(query.peopleQuery)
    const result = {
      'job query': query.jobQuery,
      jobs,
      'people query': query.peopleQuery,
      people,
      'people/jobs ratio': (people / jobs).toFixed(2)
    }

    await saveResult(result, filename)
  }

  async function login() {
    const user = process.env.LINKEDIN_USER
    const pass = process.env.LINKEDIN_PASS

    if (!user || !pass) {
      throw new Error("Missing login credentials");
    }

    await page.goto('https://www.linkedin.com/uas/login');
    await page.type('input#username', user);
    await page.type('input#password', pass);

    await page.click('button[data-litms-control-urn="login-submit"]');
    await page.waitForNavigation();
  }

  async function scrapeJobs(query) {
    await page.goto(`https://www.linkedin.com/jobs/search/?keywords=${query}&location=United%20States`);
    await page.waitForNavigation();
    const resultTextContent = await page.$eval("small.jobs-search-results-list__text", element => element.innerText.trim());
    return getNumberOfResults(resultTextContent)
  }


  async function scrapePeople(query) {
    await page.goto(`https://www.linkedin.com/search/results/people/?keywords=${query}`);
    await page.waitForNavigation();
    const resultTextContent = await page.$eval(".search-results-container > div > h2", element => element.innerText.trim());
    return getNumberOfResults(resultTextContent)
  }

  await browser.close();
})();
