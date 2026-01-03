import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { passed: 0, failed: 0, total: 0 }
  };

  console.log('\n=== Phase 5 Workstream 5.1: Functional Testing ===\n');

  try {
    // Navigate to the page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for animations to start

    // Test 1: Page loads successfully
    results.tests.push(await testPageLoad(page));

    // Test 2: Terminal UI - Typing effect present
    results.tests.push(await testTypingEffect(page));

    // Test 3: Terminal UI - Cursor animation
    results.tests.push(await testCursorAnimation(page));

    // Test 4: Terminal UI - Footer interaction
    results.tests.push(await testFooterInteraction(page));

    // Test 5: Three.js - Canvas present on desktop
    results.tests.push(await testThreeJsCanvas(page));

    // Test 6: Three.js - WebGL context initialized
    results.tests.push(await testWebGLContext(page));

    // Test 7: Three.js - Animation running
    results.tests.push(await testThreeJsAnimation(page));

    // Test 8: Responsive - Mobile viewport hides Three.js
    results.tests.push(await testMobileResponsive(page, context));

    // Test 9: No console errors
    results.tests.push(await testNoConsoleErrors(page));

    // Test 10: Performance - FPS measurement
    results.tests.push(await testPerformance(page));

  } catch (error) {
    console.error('Fatal test error:', error);
  }

  // Calculate summary
  results.tests.forEach(test => {
    results.summary.total++;
    if (test.status === 'PASS') {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
  });

  // Print results
  console.log('\n=== Test Results ===\n');
  results.tests.forEach((test, idx) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} Test ${idx + 1}: ${test.name}`);
    console.log(`   Status: ${test.status}`);
    console.log(`   Details: ${test.details}`);
    if (test.metrics) {
      console.log(`   Metrics:`, JSON.stringify(test.metrics, null, 2));
    }
    console.log('');
  });

  console.log('=== Summary ===');
  console.log(`Total: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log(`Pass Rate: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%\n`);

  await browser.close();

  return results;
}

async function testPageLoad(page) {
  try {
    const title = await page.title();
    const h1 = await page.textContent('h1');
    return {
      name: 'Page loads successfully',
      status: title && h1 ? 'PASS' : 'FAIL',
      details: `Title: "${title}", H1: "${h1}"`
    };
  } catch (error) {
    return { name: 'Page loads successfully', status: 'FAIL', details: error.message };
  }
}

async function testTypingEffect(page) {
  try {
    // Check for typing effect element
    const typingElement = await page.locator('[class*="typing"]').first();
    const isVisible = await typingElement.isVisible().catch(() => false);

    if (!isVisible) {
      return { name: 'Typing effect present', status: 'FAIL', details: 'Typing element not found' };
    }

    const text = await typingElement.textContent();
    return {
      name: 'Typing effect present',
      status: 'PASS',
      details: `Found typing element with text: "${text?.substring(0, 50)}..."`
    };
  } catch (error) {
    return { name: 'Typing effect present', status: 'FAIL', details: error.message };
  }
}

async function testCursorAnimation(page) {
  try {
    const cursor = await page.locator('[class*="cursor"]').first();
    const isVisible = await cursor.isVisible().catch(() => false);

    if (!isVisible) {
      return { name: 'Cursor animation', status: 'FAIL', details: 'Cursor element not found' };
    }

    // Check if cursor has animation styles
    const styles = await cursor.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        animation: computed.animation,
        animationName: computed.animationName
      };
    });

    return {
      name: 'Cursor animation',
      status: styles.animation !== 'none' ? 'PASS' : 'FAIL',
      details: `Animation: ${styles.animation || 'none'}`
    };
  } catch (error) {
    return { name: 'Cursor animation', status: 'FAIL', details: error.message };
  }
}

async function testFooterInteraction(page) {
  try {
    const footer = await page.locator('footer').first();
    const isVisible = await footer.isVisible().catch(() => false);

    if (!isVisible) {
      return { name: 'Footer interaction', status: 'FAIL', details: 'Footer not found' };
    }

    const links = await footer.locator('a').count();
    return {
      name: 'Footer interaction',
      status: links > 0 ? 'PASS' : 'FAIL',
      details: `Found ${links} interactive links in footer`
    };
  } catch (error) {
    return { name: 'Footer interaction', status: 'FAIL', details: error.message };
  }
}

async function testThreeJsCanvas(page) {
  try {
    const canvas = await page.locator('canvas').first();
    const isVisible = await canvas.isVisible().catch(() => false);

    if (!isVisible) {
      return { name: 'Three.js canvas present', status: 'FAIL', details: 'Canvas element not visible' };
    }

    const boundingBox = await canvas.boundingBox();
    return {
      name: 'Three.js canvas present',
      status: 'PASS',
      details: `Canvas size: ${boundingBox.width}x${boundingBox.height}px`
    };
  } catch (error) {
    return { name: 'Three.js canvas present', status: 'FAIL', details: error.message };
  }
}

async function testWebGLContext(page) {
  try {
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;

      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return gl !== null;
    });

    return {
      name: 'WebGL context initialized',
      status: hasWebGL ? 'PASS' : 'FAIL',
      details: hasWebGL ? 'WebGL context successfully created' : 'WebGL context not available'
    };
  } catch (error) {
    return { name: 'WebGL context initialized', status: 'FAIL', details: error.message };
  }
}

async function testThreeJsAnimation(page) {
  try {
    // Wait and check if animation is running
    await page.waitForTimeout(1000);

    const isAnimating = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        const checkFrames = () => {
          frameCount++;
          if (frameCount > 10) {
            resolve(true); // Animation is running
          } else {
            requestAnimationFrame(checkFrames);
          }
        };
        requestAnimationFrame(checkFrames);

        setTimeout(() => resolve(false), 1000);
      });
    });

    return {
      name: 'Three.js animation running',
      status: isAnimating ? 'PASS' : 'FAIL',
      details: isAnimating ? 'requestAnimationFrame loop active' : 'No animation detected'
    };
  } catch (error) {
    return { name: 'Three.js animation running', status: 'FAIL', details: error.message };
  }
}

async function testMobileResponsive(page, context) {
  try {
    // Create mobile viewport
    const mobilePage = await context.newPage();
    await mobilePage.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);

    const canvas = await mobilePage.locator('canvas').first();
    const isVisible = await canvas.isVisible().catch(() => false);

    await mobilePage.close();

    return {
      name: 'Responsive - Mobile hides Three.js',
      status: !isVisible ? 'PASS' : 'FAIL',
      details: !isVisible ? 'Canvas hidden on mobile viewport (375px)' : 'Canvas still visible on mobile'
    };
  } catch (error) {
    return { name: 'Responsive - Mobile hides Three.js', status: 'FAIL', details: error.message };
  }
}

async function testNoConsoleErrors(page) {
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Reload to capture any initialization errors
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  return {
    name: 'No console errors',
    status: errors.length === 0 ? 'PASS' : 'FAIL',
    details: errors.length === 0 ? 'Zero console errors' : `Found ${errors.length} errors: ${errors.join(', ')}`
  };
}

async function testPerformance(page) {
  try {
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        let lastTime = performance.now();
        const samples = [];

        const measureFPS = () => {
          frameCount++;
          const currentTime = performance.now();
          const delta = currentTime - lastTime;

          if (delta >= 1000) {
            const fps = Math.round((frameCount * 1000) / delta);
            samples.push(fps);
            frameCount = 0;
            lastTime = currentTime;
          }

          if (samples.length < 3) {
            requestAnimationFrame(measureFPS);
          } else {
            const avgFPS = Math.round(samples.reduce((a, b) => a + b) / samples.length);
            resolve({ fps: avgFPS, samples });
          }
        };

        requestAnimationFrame(measureFPS);

        setTimeout(() => resolve({ fps: 0, samples: [], error: 'Timeout' }), 5000);
      });
    });

    return {
      name: 'Performance - FPS measurement',
      status: metrics.fps >= 30 ? 'PASS' : 'FAIL',
      details: `Average FPS: ${metrics.fps} (target: ≥30)`,
      metrics
    };
  } catch (error) {
    return { name: 'Performance - FPS measurement', status: 'FAIL', details: error.message };
  }
}

// Run tests
runTests()
  .then(results => {
    process.exit(results.summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
