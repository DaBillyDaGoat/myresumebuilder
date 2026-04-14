/**
 * Comprehensive E2E Audit for MyResumeBuilder
 * Target: https://myresumebuilder-plum.vercel.app
 * Date: 2026-04-13
 */

const { chromium, webkit, devices } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://myresumebuilder-plum.vercel.app';
const OUTPUT_DIR = path.resolve(__dirname);
const RESULTS = [];

function log(msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  return line;
}

async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function captureScreenshot(page, name) {
  const filepath = path.join(OUTPUT_DIR, `${name}.png`);
  try {
    await page.screenshot({ path: filepath, fullPage: true });
    log(`Screenshot saved: ${name}.png`);
    return filepath;
  } catch (e) {
    log(`Screenshot FAILED for ${name}: ${e.message}`);
    return null;
  }
}

async function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });
  return errors;
}

async function waitForResumeGeneration(page, timeoutMs = 60000) {
  log('Waiting for resume generation...');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const text = await page.evaluate(() => document.body.innerText);
      const hasPdfTarget = await page.evaluate(() => !!document.getElementById('resume-pdf-target'));
      if (
        text.includes('Professional Summary') ||
        text.includes('Work Experience') ||
        hasPdfTarget
      ) {
        log('Resume generation detected!');
        return true;
      }
    } catch (e) {
      // ignore transient errors
    }
    await wait(2000);
  }
  log('Timeout waiting for resume generation');
  return false;
}

async function runTest(testName, browserType, contextOptions = {}) {
  const testResult = {
    test: testName,
    browser: browserType.name(),
    steps: [],
    errors: [],
    screenshots: [],
    passed: false,
  };

  log(`\n${'='.repeat(60)}`);
  log(`STARTING: ${testName}`);
  log('='.repeat(60));

  let browser, context, page;
  try {
    browser = await browserType.launch({ headless: true });
    context = await browser.newContext(contextOptions);
    page = await context.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const err = `CONSOLE ERROR: ${msg.text()}`;
        consoleErrors.push(err);
        testResult.errors.push(err);
      }
    });
    page.on('pageerror', err => {
      const errMsg = `PAGE ERROR: ${err.message}`;
      consoleErrors.push(errMsg);
      testResult.errors.push(errMsg);
    });

    // -----------------------------------------------------------------------
    // STEP 0: Intro page
    // -----------------------------------------------------------------------
    log('Navigating to intro page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await wait(2000);

    const introScreenshot = `${testName.replace(/\s+/g, '_')}_step0_intro`;
    await captureScreenshot(page, introScreenshot);
    testResult.screenshots.push(introScreenshot + '.png');

    const introText = await page.evaluate(() => document.body.innerText);
    testResult.steps.push({ step: 0, name: 'Intro', status: 'navigated', bodySnippet: introText.substring(0, 200) });

    // Click "Let's Start →"
    log('Looking for "Let\'s Start" button...');
    let startBtn = null;
    try {
      startBtn = await page.locator('button, a').filter({ hasText: /let.?s start/i }).first();
      await startBtn.waitFor({ timeout: 10000 });
    } catch (e) {
      log(`Could not find "Let's Start" by text. Trying other selectors...`);
      // Try other possible button texts
      const allBtns = await page.locator('button, a[href]').all();
      for (const btn of allBtns) {
        const txt = await btn.innerText().catch(() => '');
        log(`  Button text: "${txt}"`);
      }
      startBtn = await page.locator('button').first();
    }
    await startBtn.click();
    await wait(2000);
    testResult.steps.push({ step: 0, name: 'Intro Click Start', status: 'clicked' });

    // -----------------------------------------------------------------------
    // STEP 1: Contact info
    // -----------------------------------------------------------------------
    log('Step 1: Contact info...');
    await captureScreenshot(page, `${testName.replace(/\s+/g, '_')}_step1_contact`);
    testResult.screenshots.push(`${testName.replace(/\s+/g, '_')}_step1_contact.png`);

    const currentUrl1 = page.url();
    const pageText1 = await page.evaluate(() => document.body.innerText);
    log(`URL: ${currentUrl1}`);
    log(`Page text snippet: ${pageText1.substring(0, 300)}`);

    // Fill contact fields
    try {
      // Try named inputs first
      const nameInput = await page.locator('input[name*="name" i], input[placeholder*="name" i], input[id*="name" i]').first();
      await nameInput.fill('Marcus Williams');
      log('Filled name field');
    } catch (e) {
      log(`Name field error: ${e.message}`);
      // Try by position
      try {
        const inputs = await page.locator('input[type="text"], input:not([type])').all();
        if (inputs.length > 0) await inputs[0].fill('Marcus Williams');
      } catch (e2) {
        log(`Fallback name fill error: ${e2.message}`);
      }
    }

    try {
      const phoneInput = await page.locator('input[name*="phone" i], input[placeholder*="phone" i], input[id*="phone" i], input[type="tel"]').first();
      await phoneInput.fill('901-555-0100');
      log('Filled phone field');
    } catch (e) {
      log(`Phone field error: ${e.message}`);
    }

    try {
      const emailInput = await page.locator('input[name*="email" i], input[placeholder*="email" i], input[id*="email" i], input[type="email"]').first();
      await emailInput.fill('marcus@test.com');
      log('Filled email field');
    } catch (e) {
      log(`Email field error: ${e.message}`);
    }

    testResult.steps.push({ step: 1, name: 'Contact Fill', status: 'filled' });

    // Click Next
    await clickNextOrSkip(page, testResult, 1);
    await wait(2000);

    // -----------------------------------------------------------------------
    // STEP 2: Work experience
    // -----------------------------------------------------------------------
    log('Step 2: Work experience...');
    const currentUrl2 = page.url();
    log(`URL: ${currentUrl2}`);

    try {
      const allInputs = await page.locator('input[type="text"], input:not([type])').all();
      log(`Found ${allInputs.length} text inputs on step 2`);
      if (allInputs.length >= 1) {
        await allInputs[0].fill('Warehouse Associate');
        log('Filled job title (index 0)');
      }
      if (allInputs.length >= 2) {
        await allInputs[1].fill('Amazon');
        log('Filled employer (index 1)');
      }
    } catch (e) {
      log(`Work step error: ${e.message}`);
      testResult.errors.push(`Step 2 fill error: ${e.message}`);
    }

    testResult.steps.push({ step: 2, name: 'Work Fill', status: 'filled' });

    // Click Next
    await clickNextOrSkip(page, testResult, 2);
    await wait(2000);

    // -----------------------------------------------------------------------
    // STEPS 3-14: Click Skip/Next
    // -----------------------------------------------------------------------
    for (let s = 3; s <= 14; s++) {
      log(`Step ${s}: Clicking Skip/Next...`);
      const url = page.url();
      log(`  URL: ${url}`);
      await clickNextOrSkip(page, testResult, s);
      await wait(1500);
    }

    // -----------------------------------------------------------------------
    // STEP 15: Create My Resume
    // -----------------------------------------------------------------------
    log('Step 15: Looking for "Create My Resume" button...');
    const step15Url = page.url();
    log(`URL before Create: ${step15Url}`);
    await captureScreenshot(page, `${testName.replace(/\s+/g, '_')}_step15_pre_create`);

    let createBtn = null;
    try {
      createBtn = await page.locator('button, a').filter({ hasText: /create my resume/i }).first();
      await createBtn.waitFor({ timeout: 10000 });
      log('Found "Create My Resume" button');
    } catch (e) {
      log(`Could not find "Create My Resume" by text. Trying other final-step buttons...`);
      // Try any submit-like button
      const btns = await page.locator('button').all();
      for (const btn of btns) {
        const txt = await btn.innerText().catch(() => '');
        log(`  Button: "${txt}"`);
      }
      // Try the last button on page
      createBtn = await page.locator('button').last();
    }

    await createBtn.click();
    log('Clicked Create My Resume');
    testResult.steps.push({ step: 15, name: 'Create My Resume', status: 'clicked' });
    await wait(3000);

    // -----------------------------------------------------------------------
    // WAIT FOR GENERATION (up to 60s)
    // -----------------------------------------------------------------------
    const generated = await waitForResumeGeneration(page, 60000);
    testResult.steps.push({ step: 16, name: 'Generation Wait', status: generated ? 'success' : 'timeout' });

    // -----------------------------------------------------------------------
    // STEP 17: Preview
    // -----------------------------------------------------------------------
    log('Step 17: Preview page...');
    const previewUrl = page.url();
    log(`Preview URL: ${previewUrl}`);

    await captureScreenshot(page, `${testName.replace(/\s+/g, '_')}_step17_preview`);
    testResult.screenshots.push(`${testName.replace(/\s+/g, '_')}_step17_preview.png`);

    const previewText = await page.evaluate(() => document.body.innerText);
    log(`Preview text snippet: ${previewText.substring(0, 500)}`);
    testResult.steps.push({ step: 17, name: 'Preview', status: 'reached', url: previewUrl, textSnippet: previewText.substring(0, 300) });

    // Look for Download & Email button
    log('Looking for "Download & Email Resume" button...');
    let downloadEmailBtn = null;
    try {
      downloadEmailBtn = await page.locator('button, a').filter({ hasText: /download.*email|email.*download/i }).first();
      await downloadEmailBtn.waitFor({ timeout: 5000 });
      log('Found Download & Email button');
      await downloadEmailBtn.click();
      log('Clicked Download & Email button');
      await wait(2000);
    } catch (e) {
      log(`Download & Email button not found: ${e.message}`);
      // Try other navigation buttons on preview
      const allBtns = await page.locator('button, a').all();
      for (const btn of allBtns) {
        const txt = await btn.innerText().catch(() => '');
        if (txt.trim()) log(`  Button: "${txt}"`);
      }
      testResult.errors.push(`Download & Email button not found: ${e.message}`);

      // Try to navigate to export page directly by clicking any "next" button
      try {
        const nextBtn = await page.locator('button').filter({ hasText: /next|continue|download|export/i }).first();
        await nextBtn.waitFor({ timeout: 5000 });
        await nextBtn.click();
        await wait(2000);
        log('Clicked alternative navigation button');
      } catch (e2) {
        log(`No alternative button found: ${e2.message}`);
      }
    }

    // -----------------------------------------------------------------------
    // STEP 18: Export screen
    // -----------------------------------------------------------------------
    log('Step 18: Export/Download screen...');
    const exportUrl = page.url();
    log(`Export URL: ${exportUrl}`);

    await captureScreenshot(page, `${testName.replace(/\s+/g, '_')}_step18_export`);
    testResult.screenshots.push(`${testName.replace(/\s+/g, '_')}_step18_export.png`);

    // Check for resume-pdf-target
    const hasPdfTarget = await page.evaluate(() => !!document.getElementById('resume-pdf-target'));
    log(`#resume-pdf-target exists: ${hasPdfTarget}`);

    // Check for Download PDF button
    let hasDownloadPdf = false;
    try {
      const dlBtn = await page.locator('button, a').filter({ hasText: /download pdf/i }).first();
      await dlBtn.waitFor({ timeout: 5000 });
      hasDownloadPdf = true;
      log('Found "Download PDF" button');
    } catch (e) {
      log(`"Download PDF" button not found: ${e.message}`);
    }

    // Check for "Resume not found" text
    const exportPageText = await page.evaluate(() => document.body.innerText);
    const hasResumeNotFound = exportPageText.includes('Resume not found');
    log(`"Resume not found" text present: ${hasResumeNotFound}`);

    testResult.steps.push({
      step: 18,
      name: 'Export Screen',
      status: 'reached',
      url: exportUrl,
      hasPdfTarget,
      hasDownloadPdf,
      hasResumeNotFound,
      textSnippet: exportPageText.substring(0, 500),
    });

    // Try clicking Download PDF
    if (hasDownloadPdf) {
      try {
        log('Attempting to click Download PDF...');
        const dlBtn = await page.locator('button, a').filter({ hasText: /download pdf/i }).first();
        await dlBtn.click();
        await wait(3000);
        log('Clicked Download PDF - checking for errors...');
        const afterClickText = await page.evaluate(() => document.body.innerText);
        const downloadErrors = [];
        if (afterClickText.includes('error') || afterClickText.includes('Error')) {
          downloadErrors.push('Error text found after clicking Download PDF');
        }
        testResult.steps.push({ step: 18.5, name: 'Download PDF Click', status: 'clicked', errors: downloadErrors });
      } catch (e) {
        log(`Download PDF click error: ${e.message}`);
        testResult.errors.push(`Download PDF click: ${e.message}`);
      }
    }

    // Final screenshot
    await captureScreenshot(page, `${testName.replace(/\s+/g, '_')}_final`);

    testResult.passed = !hasResumeNotFound && (hasPdfTarget || hasDownloadPdf);
    log(`\nTest ${testName} completed. PASSED: ${testResult.passed}`);

  } catch (e) {
    log(`FATAL ERROR in ${testName}: ${e.message}`);
    log(e.stack);
    testResult.errors.push(`FATAL: ${e.message}`);
    testResult.passed = false;

    // Try to capture error screenshot
    if (page) {
      try {
        await captureScreenshot(page, `${testName.replace(/\s+/g, '_')}_ERROR`);
      } catch (e2) {
        // ignore
      }
    }
  } finally {
    if (browser) await browser.close();
  }

  RESULTS.push(testResult);
  return testResult;
}

async function clickNextOrSkip(page, testResult, stepNum) {
  try {
    // First try Skip button
    const skipBtn = await page.locator('button, a').filter({ hasText: /skip/i }).first();
    try {
      await skipBtn.waitFor({ timeout: 3000 });
      await skipBtn.click();
      testResult.steps.push({ step: stepNum, name: `Skip/Next`, status: 'clicked_skip' });
      return;
    } catch (e) {
      // Skip not found, try Next
    }

    // Try Next button
    const nextBtn = await page.locator('button, a').filter({ hasText: /^next$|^next\s/i }).first();
    try {
      await nextBtn.waitFor({ timeout: 3000 });
      await nextBtn.click();
      testResult.steps.push({ step: stepNum, name: `Skip/Next`, status: 'clicked_next' });
      return;
    } catch (e) {
      // Next not found
    }

    // Try any button with skip or next in text
    const anyBtn = await page.locator('button').filter({ hasText: /skip|next/i }).first();
    await anyBtn.waitFor({ timeout: 3000 });
    await anyBtn.click();
    testResult.steps.push({ step: stepNum, name: `Skip/Next`, status: 'clicked_any' });

  } catch (e) {
    log(`  Could not find Skip/Next on step ${stepNum}: ${e.message}`);
    // Log all buttons for debugging
    try {
      const allBtns = await page.locator('button').all();
      for (const btn of allBtns) {
        const txt = await btn.innerText().catch(() => '');
        if (txt.trim()) log(`  Available button: "${txt}"`);
      }
    } catch (e2) {
      // ignore
    }
    testResult.steps.push({ step: stepNum, name: `Skip/Next`, status: 'NOT_FOUND', error: e.message });
    testResult.errors.push(`Step ${stepNum} Skip/Next not found: ${e.message}`);
  }
}

async function main() {
  log('Starting E2E Audit Suite');
  log(`Output directory: ${OUTPUT_DIR}`);

  // TEST 1: Desktop Chrome
  const chromeBrowser = chromium;
  await runTest('Test1_Desktop_Chrome', chromeBrowser, {
    viewport: { width: 1280, height: 800 },
  });

  // TEST 2: Mobile Safari (iPhone 14 emulation)
  const iphone14 = devices['iPhone 14'];
  log(`iPhone 14 device config: ${JSON.stringify(iphone14, null, 2)}`);
  await runTest('Test2_Mobile_iPhone14', chromium, {
    ...iphone14,
  });

  // TEST 3: WebKit (Safari desktop)
  await runTest('Test3_WebKit_Safari', webkit, {
    viewport: { width: 1280, height: 800 },
  });

  // -----------------------------------------------------------------------
  // WRITE RESULTS SUMMARY
  // -----------------------------------------------------------------------
  const summaryPath = path.join(OUTPUT_DIR, 'playwright_results.md');
  const lines = [];
  lines.push('# Playwright E2E Audit Results');
  lines.push(`**Date:** 2026-04-13`);
  lines.push(`**Target:** ${BASE_URL}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const r of RESULTS) {
    lines.push(`## ${r.test}`);
    lines.push(`- **Browser:** ${r.browser}`);
    lines.push(`- **Overall Result:** ${r.passed ? '✅ PASSED' : '❌ FAILED'}`);
    lines.push('');
    lines.push('### Steps');
    lines.push('| Step | Name | Status |');
    lines.push('|------|------|--------|');
    for (const s of r.steps) {
      const extra = s.url ? ` (${s.url})` : '';
      lines.push(`| ${s.step} | ${s.name} | ${s.status}${extra} |`);
    }
    lines.push('');

    if (r.steps.find(s => s.step === 18)) {
      const s18 = r.steps.find(s => s.step === 18);
      lines.push('### Export Screen Checks');
      lines.push(`- **#resume-pdf-target exists:** ${s18.hasPdfTarget}`);
      lines.push(`- **"Download PDF" button present:** ${s18.hasDownloadPdf}`);
      lines.push(`- **"Resume not found" text:** ${s18.hasResumeNotFound}`);
      if (s18.textSnippet) {
        lines.push('');
        lines.push('**Export page text (first 500 chars):**');
        lines.push('```');
        lines.push(s18.textSnippet);
        lines.push('```');
      }
      lines.push('');
    }

    if (r.errors.length > 0) {
      lines.push('### Errors');
      for (const e of r.errors) {
        lines.push(`- ${e}`);
      }
      lines.push('');
    }

    if (r.screenshots.length > 0) {
      lines.push('### Screenshots');
      for (const ss of r.screenshots) {
        lines.push(`- ${ss}`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  // Summary table
  lines.push('## Overall Summary');
  lines.push('| Test | Browser | Result |');
  lines.push('|------|---------|--------|');
  for (const r of RESULTS) {
    lines.push(`| ${r.test} | ${r.browser} | ${r.passed ? 'PASSED' : 'FAILED'} |`);
  }
  lines.push('');

  fs.writeFileSync(summaryPath, lines.join('\n'), 'utf8');
  log(`\nResults summary saved to: ${summaryPath}`);

  // Also save raw JSON
  const jsonPath = path.join(OUTPUT_DIR, 'playwright_results_raw.json');
  fs.writeFileSync(jsonPath, JSON.stringify(RESULTS, null, 2), 'utf8');
  log(`Raw JSON results saved to: ${jsonPath}`);

  const passed = RESULTS.filter(r => r.passed).length;
  const failed = RESULTS.filter(r => !r.passed).length;
  log(`\nFINAL: ${passed} passed, ${failed} failed out of ${RESULTS.length} tests`);

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Fatal error in main:', e);
  process.exit(2);
});
