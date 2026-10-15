import assert from 'node:assert';
import http from 'node:http';

const BASE_URL = 'http://localhost:3000';

// Helper to make HTTP requests
function request(
  method: string,
  path: string,
  headers: Record<string, string> = {},
  body?: any
): Promise<{ status: number; headers: http.IncomingHttpHeaders; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : '';

    const reqHeaders: Record<string, string> = {
      ...headers,
    };
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          let parsed = null;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            parsed = raw;
          }
          resolve({
            status: res.statusCode || 500,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// SM-2 Spaced Repetition Unit Test
function calculateSm2(grade: number, previousRepetitions: number, previousInterval: number, previousEaseFactor: number) {
  let repetitions = previousRepetitions;
  let interval = previousInterval;
  let easeFactor = previousEaseFactor;

  if (grade >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * easeFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { repetitions, interval, easeFactor: Math.round(easeFactor * 100) / 100 };
}

async function runAllTests() {
  console.log('======================================================');
  console.log('🐬 SPEAK DOLPHIN PRODUCTION TEST SUITE: QA & AUDIT');
  console.log('======================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err?.message}`);
      failedCount++;
    }
  }

  // 1. SYSTEM HEALTH & SECURITY HEADERS
  console.log('--- 1. Security & System Health Tests ---');

  await test('Server Health Check (/api/health)', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'online');
    assert.ok(typeof res.data.timestamp === 'string');
  });

  await test('Security Headers (Helmet-equivalent protection)', async () => {
    const res = await request('GET', '/api/health');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(res.headers['x-frame-options'], 'SAMEORIGIN');
    assert.strictEqual(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
  });

  await test('Rate Limiter Headers (Sliding Window)', async () => {
    const res = await request('GET', '/api/health');
    assert.ok(res.headers['x-ratelimit-limit'], 'Rate limit header missing');
    assert.ok(res.headers['x-ratelimit-remaining'], 'Rate remaining header missing');
  });

  // 2. SUBSCRIPTION & PAYMENT ENGINE
  console.log('\n--- 2. Subscription, Billing & Webhook Engine Tests ---');

  await test('List Verified Pricing Plans (/api/billing/plans)', async () => {
    const res = await request('GET', '/api/billing/plans');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.plans.free, 'Free tier plan missing');
    assert.ok(res.data.plans.pro, 'Pro tier plan missing');
    assert.ok(res.data.plans.family, 'Family tier plan missing');
    assert.strictEqual(res.data.plans.pro.priceMonthly, 12.99);
    assert.strictEqual(res.data.plans.pro.priceAnnual, 99.0);
    assert.strictEqual(res.data.plans.family.priceMonthly, 24.99);
    assert.strictEqual(res.data.sandboxMode, true);
  });

  const testUserId = `test-user-${Date.now()}`;
  let checkoutSessionId = '';
  const testIdempotencyKey = `idemp_test_${Date.now()}`;

  await test('Get User Subscription Default (/api/billing/subscription/:userId)', async () => {
    const res = await request('GET', `/api/billing/subscription/${testUserId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.tier, 'free');
    assert.strictEqual(res.data.status, 'active');
  });

  await test('Create Checkout Session with Idempotency Key (/api/billing/create-checkout-session)', async () => {
    const res = await request('POST', '/api/billing/create-checkout-session', {}, {
      userId: testUserId,
      planTier: 'pro',
      interval: 'month',
      idempotencyKey: testIdempotencyKey,
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.session.sessionId, 'Session ID not returned');
    assert.strictEqual(res.data.session.amount, 12.99);
    assert.strictEqual(res.data.isReplay, false);
    checkoutSessionId = res.data.session.sessionId;
  });

  await test('Idempotency Replay Protection (Double-charge prevention)', async () => {
    const res = await request('POST', '/api/billing/create-checkout-session', {}, {
      userId: testUserId,
      planTier: 'pro',
      interval: 'month',
      idempotencyKey: testIdempotencyKey,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.isReplay, true);
    assert.strictEqual(res.data.session.sessionId, checkoutSessionId);
  });

  await test('Confirm Checkout and Activate Subscription (/api/billing/confirm-checkout)', async () => {
    const res = await request('POST', '/api/billing/confirm-checkout', {}, {
      sessionId: checkoutSessionId,
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2028,
      },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.subscription.tier, 'pro');
    assert.strictEqual(res.data.subscription.status, 'active');
    assert.ok(res.data.invoice.invoiceNumber, 'Verified invoice not issued');
  });

  await test('Retrieve User Invoice History (/api/billing/invoices/:userId)', async () => {
    const res = await request('GET', `/api/billing/invoices/${testUserId}`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.invoices));
    assert.strictEqual(res.data.invoices.length >= 1, true);
    assert.strictEqual(res.data.invoices[0].status, 'paid');
  });

  await test('Cancel Subscription at Period End (/api/billing/cancel-subscription)', async () => {
    const res = await request('POST', '/api/billing/cancel-subscription', {}, {
      userId: testUserId,
      immediate: false,
      reason: 'Testing cancellation flow',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.subscription.cancelAtPeriodEnd, true);
  });

  await test('Reactivate Subscription (/api/billing/reactivate-subscription)', async () => {
    const res = await request('POST', '/api/billing/reactivate-subscription', {}, {
      userId: testUserId,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.subscription.cancelAtPeriodEnd, false);
  });

  await test('Upgrade Plan to Family Tier (/api/billing/change-plan)', async () => {
    const res = await request('POST', '/api/billing/change-plan', {}, {
      userId: testUserId,
      newTier: 'family',
      interval: 'year',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.subscription.tier, 'family');
    assert.strictEqual(res.data.subscription.interval, 'year');
    assert.strictEqual(res.data.subscription.price, 199.0);
  });

  await test('Simulate Webhook Failed Payment -> past_due (/api/billing/simulate-webhook)', async () => {
    const res = await request('POST', '/api/billing/simulate-webhook', {}, {
      type: 'invoice.payment_failed',
      userId: testUserId,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.updatedSubscription.status, 'past_due');
  });

  await test('Dunning Failed Payment Recovery (/api/billing/retry-failed-payment)', async () => {
    const res = await request('POST', '/api/billing/retry-failed-payment', {}, {
      userId: testUserId,
      paymentMethod: { brand: 'Visa', last4: '4242', expiryMonth: 12, expiryYear: 2028 },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.subscription.status, 'active');
  });

  await test('Reject Webhook with Invalid Signature (/api/billing/webhook)', async () => {
    const res = await request('POST', '/api/billing/webhook', {
      'stripe-signature': 'invalid_forged_signature_token',
    }, {
      type: 'invoice.payment_succeeded',
      data: { userId: testUserId },
    });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.data.error, 'Webhook processing failed');
  });

  // 3. DATA PIPELINES & TELEMETRY
  console.log('\n--- 3. Automated Data Pipelines & Telemetry Tests ---');

  await test('Check Pipeline Health & Schedule (/api/pipelines/status)', async () => {
    const res = await request('GET', '/api/pipelines/status');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.healthy, true);
    assert.strictEqual(res.data.jobs.length >= 4, true);
    assert.ok(res.data.cacheStats.entries >= 0);
  });

  await test('Trigger Background Pipeline Job (/api/pipelines/trigger)', async () => {
    const res = await request('POST', '/api/pipelines/trigger', {}, {
      jobId: 'daily_insights_refresher',
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
    assert.ok(res.data.lastRunDurationMs >= 0);
    assert.ok(res.data.itemsProcessed >= 5);
  });

  await test('Verified Linguistic Daily Insight with Source Attribution (/api/daily-insights/es)', async () => {
    const res = await request('GET', '/api/daily-insights/es');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.languageId, 'es');
    assert.ok(res.data.wordOfTheDay.term, 'Word of the day missing');
    assert.strictEqual(res.data.sourceAttribution.isVerifiedFact, true);
    assert.ok(res.data.sourceAttribution.organization.includes('Real Academia Española'));
  });

  await test('Real-Time Server Telemetry (/api/monitoring/telemetry)', async () => {
    const res = await request('GET', '/api/monitoring/telemetry');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
    assert.ok(res.data.memoryUsageMb.rss > 0);
    assert.ok(res.data.dataPipelinesActive >= 4);
  });

  // 4. AI ENDPOINTS & PEDAGOGICAL CONTRACTS
  console.log('\n--- 4. AI Linguistic Endpoints & Session Summary Tests ---');

  await test('AI Conversation Tutor (/api/tutor)', async () => {
    const res = await request('POST', '/api/tutor', {}, {
      messages: [{ role: 'user', content: 'Hola, me gustaría pedir una mesa para dos personas.' }],
      scenario: 'restaurant',
      targetLanguage: 'Spanish',
      nativeLanguage: 'English',
      learnerLevel: 'A1',
      ageGroup: 'adult',
    });
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.data.replyText === 'string' && res.data.replyText.length > 0);
    assert.ok(typeof res.data.translation === 'string');
    assert.ok(Array.isArray(res.data.suggestedFollowUps));
  });

  await test('AI Conversation Session Summary (/api/tutor-summary)', async () => {
    const res = await request('POST', '/api/tutor-summary', {}, {
      messages: [
        { role: 'user', content: 'Hola, quiero una mesa cerca de la ventana por favor.' },
        { role: 'user', content: '¿Tienen vino tinto de la casa y agua?' },
      ],
      scenario: 'restaurant',
      targetLanguage: 'Spanish',
      nativeLanguage: 'English',
      learnerLevel: 'A1',
      ageGroup: 'adult',
    });
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.data.overallScore === 'number');
    assert.ok(res.data.grammar && typeof res.data.grammar.score === 'number');
    assert.ok(res.data.vocabulary && typeof res.data.vocabulary.score === 'number');
    assert.ok(res.data.fluency && typeof res.data.fluency.score === 'number');
    assert.ok(Array.isArray(res.data.actionItems));
  });

  await test('Speech Pronunciation Evaluation (/api/speech-feedback)', async () => {
    const res = await request('POST', '/api/speech-feedback', {}, {
      spokenText: 'hola buenas tardes',
      targetText: 'hola buenas tardes',
      targetLanguage: 'Spanish',
      nativeLanguage: 'English',
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.intelligibilityScore >= 70);
    assert.ok(res.data.accuracyScore >= 80);
    assert.ok(Array.isArray(res.data.phoneticTips));
  });

  await test('Placement Assessment Evaluation (/api/placement-eval)', async () => {
    const res = await request('POST', '/api/placement-eval', {}, {
      answers: [
        { id: '1', isCorrect: true },
        { id: '2', isCorrect: true },
        { id: '3', isCorrect: false },
      ],
      targetLanguage: 'Spanish',
      ageGroup: 'adult',
    });
    assert.strictEqual(res.status, 200);
    assert.ok(['A1', 'A2', 'B1', 'B2', 'C1'].includes(res.data.estimatedLevel));
    assert.ok(res.data.skillScores.vocabulary > 0);
  });

  // 5. ALGORITHMIC UNITS
  console.log('\n--- 5. Algorithmic Units (SM-2 Spaced Repetition) ---');

  await test('SM-2 Interval Progression: Grade 5 (Perfect Response)', async () => {
    const step1 = calculateSm2(5, 0, 0, 2.5);
    assert.strictEqual(step1.repetitions, 1);
    assert.strictEqual(step1.interval, 1);
    assert.strictEqual(step1.easeFactor, 2.6);

    const step2 = calculateSm2(5, step1.repetitions, step1.interval, step1.easeFactor);
    assert.strictEqual(step2.repetitions, 2);
    assert.strictEqual(step2.interval, 6);
    assert.strictEqual(step2.easeFactor, 2.7);

    const step3 = calculateSm2(5, step2.repetitions, step2.interval, step2.easeFactor);
    assert.strictEqual(step3.repetitions, 3);
    assert.strictEqual(step3.interval, Math.round(6 * 2.7));
  });

  await test('SM-2 Interval Reset: Grade 1 (Complete Failure)', async () => {
    const reset = calculateSm2(1, 4, 25, 2.7);
    assert.strictEqual(reset.repetitions, 0);
    assert.strictEqual(reset.interval, 1);
    assert.ok(reset.easeFactor < 2.7);
  });

  // 6. MULTILINGUAL & AFRICAN LANGUAGES INTEGRATION
  console.log('\n--- 6. Multilingual & African Languages Integration ---');

  await test('Supported Languages Count & African Languages Inclusion', async () => {
    const { SUPPORTED_LANGUAGES, MINIMAL_PAIRS } = await import('../src/data/languages.js');
    assert.strictEqual(SUPPORTED_LANGUAGES.length, 15, 'Must have exactly 15 supported languages');

    const langIds = SUPPORTED_LANGUAGES.map((l) => l.id);
    assert.ok(langIds.includes('ig'), 'Must include Igbo (ig)');
    assert.ok(langIds.includes('sw'), 'Must include Swahili (sw)');
    assert.ok(langIds.includes('ha'), 'Must include Hausa (ha)');
    assert.ok(langIds.includes('ln'), 'Must include Lingala (ln)');
    assert.ok(langIds.includes('id'), 'Must include Indonesian (id)');
    assert.ok(langIds.includes('pt-PT'), 'Must include European Portuguese (pt-PT)');
    assert.ok(langIds.includes('hi'), 'Must include Hindi (hi)');

    // Verify minimal pairs for African languages
    const igPairs = MINIMAL_PAIRS.filter((mp) => mp.languageId === 'ig');
    assert.ok(igPairs.length >= 2, 'Igbo must have at least 2 minimal pairs');

    const swPairs = MINIMAL_PAIRS.filter((mp) => mp.languageId === 'sw');
    assert.ok(swPairs.length >= 2, 'Swahili must have at least 2 minimal pairs');

    const haPairs = MINIMAL_PAIRS.filter((mp) => mp.languageId === 'ha');
    assert.ok(haPairs.length >= 2, 'Hausa must have at least 2 minimal pairs');

    const lnPairs = MINIMAL_PAIRS.filter((mp) => mp.languageId === 'ln');
    assert.ok(lnPairs.length >= 2, 'Lingala must have at least 2 minimal pairs');

    // Verify minimal pairs for Indonesian, European Portuguese, Hindi
    const idPairs = MINIMAL_PAIRS.filter((mp) => mp.languageId === 'id');
    assert.ok(idPairs.length >= 2, 'Indonesian must have at least 2 minimal pairs');

    const ptPtPairs = MINIMAL_PAIRS.filter((mp) => mp.languageId === 'pt-PT');
    assert.ok(ptPtPairs.length >= 2, 'European Portuguese must have at least 2 minimal pairs');

    const hiPairs = MINIMAL_PAIRS.filter((mp) => mp.languageId === 'hi');
    assert.ok(hiPairs.length >= 2, 'Hindi must have at least 2 minimal pairs');
  });

  await test('Global & African Language Curriculum Lessons & Stories', async () => {
    const { CURRICULUM_LESSONS } = await import('../src/data/curriculum.js');
    const { INTERACTIVE_STORIES } = await import('../src/data/stories.js');

    const igLessons = CURRICULUM_LESSONS.filter((l) => l.languageId === 'ig');
    assert.ok(igLessons.length >= 1, 'Igbo curriculum lesson present');

    const swLessons = CURRICULUM_LESSONS.filter((l) => l.languageId === 'sw');
    assert.ok(swLessons.length >= 1, 'Swahili curriculum lesson present');

    const haLessons = CURRICULUM_LESSONS.filter((l) => l.languageId === 'ha');
    assert.ok(haLessons.length >= 1, 'Hausa curriculum lesson present');

    const lnLessons = CURRICULUM_LESSONS.filter((l) => l.languageId === 'ln');
    assert.ok(lnLessons.length >= 1, 'Lingala curriculum lesson present');

    const idLessons = CURRICULUM_LESSONS.filter((l) => l.languageId === 'id');
    assert.ok(idLessons.length >= 1, 'Indonesian curriculum lesson present');

    const ptPtLessons = CURRICULUM_LESSONS.filter((l) => l.languageId === 'pt-PT');
    assert.ok(ptPtLessons.length >= 1, 'European Portuguese curriculum lesson present');

    const hiLessons = CURRICULUM_LESSONS.filter((l) => l.languageId === 'hi');
    assert.ok(hiLessons.length >= 1, 'Hindi curriculum lesson present');

    // Stories verification
    const storyLangs = INTERACTIVE_STORIES.map((s) => s.languageId);
    assert.ok(storyLangs.includes('ig'), 'Igbo story present');
    assert.ok(storyLangs.includes('sw'), 'Swahili story present');
    assert.ok(storyLangs.includes('ha'), 'Hausa story present');
    assert.ok(storyLangs.includes('ln'), 'Lingala story present');
    assert.ok(storyLangs.includes('id'), 'Indonesian story present');
    assert.ok(storyLangs.includes('pt-PT'), 'European Portuguese story present');
    assert.ok(storyLangs.includes('hi'), 'Hindi story present');
  });

  // 7. LEAD BANK CHECKING & ROUTING INTEGRITY
  console.log('\n--- 7. Lead Bank Direct Wire & Checking Rails ---');

  await test('Lead Bank Routing & Account Details Verification', async () => {
    const res = await request('GET', '/api/billing/bank-details');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.bankName, 'Lead Bank');
    assert.strictEqual(res.data.routingNumber, '101019644');
    assert.strictEqual(res.data.accountNumber, '210906176137');
    assert.strictEqual(res.data.beneficiaryName, 'CHINWEUBA CHRISTOPHER NDUBUEZE');
    assert.strictEqual(res.data.beneficiaryEmail, 'unconomics@gmail.com');
    assert.strictEqual(res.data.accountType, 'CHECKING');
  });

  await test('Lead Bank Routing Checksum Algorithm', async () => {
    // ABA routing transit number formula:
    // (3(d1 + d4 + d7) + 7(d2 + d5 + d8) + (d3 + d6 + d9)) mod 10 == 0
    const routing = '101019644';
    const digits = routing.split('').map(Number);
    assert.strictEqual(digits.length, 9);
    const checksum =
      (3 * (digits[0] + digits[3] + digits[6]) +
        7 * (digits[1] + digits[4] + digits[7]) +
        (digits[2] + digits[5] + digits[8])) % 10;
    // 3*(1 + 0 + 6) + 7*(0 + 1 + 4) + (1 + 9 + 4) = 3*7 + 7*5 + 14 = 21 + 35 + 14 = 70. 70 mod 10 == 0!
    assert.strictEqual(checksum, 0, 'Lead Bank routing number must satisfy ABA routing algorithm checksum');
  });

  await test('Payment Glitch Self-Correction & Idempotency', async () => {
    const res = await request('POST', '/api/billing/self-correct-glitch', {}, {
      transactionRef: 'TX_AUTO_CORRECT_TEST_101',
      userId: 'user-adult-1',
      attemptNumber: 1,
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.selfCorrected, true);
    assert.ok(res.data.subscription);
    assert.strictEqual(res.data.subscription.status, 'active');
  });

  // 8. PROMPTS MERGE & PDF GENERATION TESTS
  console.log('\n--- 8. Engineering Prompts Compilation & PDF Generation ---');

  await test('Prompts Compilation PDF Download Endpoint (/api/download-prompts-pdf)', async () => {
    const res = await request('GET', '/api/download-prompts-pdf');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers['content-type'], 'application/pdf');
    assert.ok(
      String(res.headers['content-disposition']).includes('speak-dolphin-prompts-compilation.pdf')
    );
  });

  // 9. DAILY GOAL TRACKER & STREAK PROGRESSION TESTS
  console.log('\n--- 9. Daily Goal Tracker & Streak Progression ---');

  await test('Daily Goal Progress Multi-Metric Calculation (Time, Lessons, XP)', async () => {
    const { getDailyGoalProgress, updateDailyGoalLessons, recordTodayPractice } = await import('../src/utils/dailyGoal.js');
    const mockUser: any = {
      id: 'test-user-tracker',
      name: 'Amaka',
      dailyGoalMinutes: 15,
      dailyGoalLessons: 2,
      dailyGoalXp: 100,
      dailyTimeSpentTodayMinutes: 10,
      dailyLessonsCompletedToday: 1,
      dailyXpEarnedToday: 60,
      dailyXpDate: new Date().toISOString().slice(0, 10),
      streakDays: 4,
      totalXp: 400,
    };

    const progress = getDailyGoalProgress(mockUser);
    assert.strictEqual(progress.targetMinutes, 15);
    assert.strictEqual(progress.spentMinutes, 10);
    assert.strictEqual(progress.targetLessons, 2);
    assert.strictEqual(progress.completedLessonsToday, 1);
    assert.strictEqual(progress.remainingLessons, 1);
    assert.strictEqual(progress.lessonsPercentage, 50);
    assert.strictEqual(progress.isLessonsGoalCompleted, false);

    // Record completing the remaining lesson
    const result = recordTodayPractice(mockUser, 5, 40, 1);
    assert.strictEqual(result.updatedUser.dailyLessonsCompletedToday, 2);
    assert.strictEqual(result.updatedUser.dailyTimeSpentTodayMinutes, 15);
    assert.strictEqual(result.updatedUser.dailyXpEarnedToday, 100);
    assert.strictEqual(result.justCompletedGoal, true);
    assert.strictEqual(result.progress.isLessonsGoalCompleted, true);
    assert.strictEqual(result.progress.isTimeGoalCompleted, true);
    assert.strictEqual(result.progress.isCompleted, true);
  });

  console.log('\n--- 10. Daily Challenge Interactive Mini-Game & Progress System ---');

  await test('Daily Challenge Generation & Multi-Language Support', async () => {
    const { getTodayChallengeInfo } = await import('../src/utils/dailyChallenge.js');
    
    // Adult Spanish challenge
    const esChallenge = getTodayChallengeInfo('es', 'adult_18_plus');
    assert.strictEqual(esChallenge.durationSeconds, 45);
    assert.strictEqual(esChallenge.bonusXp, 50);
    assert.strictEqual(esChallenge.questions.length >= 4, true);

    // African language challenge (Igbo)
    const igChallenge = getTodayChallengeInfo('ig', 'adult_18_plus');
    assert.strictEqual(igChallenge.questions.length >= 4, true);
    assert.strictEqual(igChallenge.questions.some(q => q.prompt.includes('Daalụ') || q.audioText === 'Daalụ'), true);

    // Young Explorer challenge (Ages 3-5)
    const kidChallenge = getTodayChallengeInfo('es', 'child_3_5');
    assert.strictEqual(kidChallenge.title.includes('Pip'), true);
    assert.strictEqual(kidChallenge.difficulty, 'Beginner');
  });

  await test('Daily Challenge Bonus XP & Progress Linking', async () => {
    const { calculateBonusXp, recordDailyChallengeWin, isDailyChallengeCompletedToday } = await import('../src/utils/dailyChallenge.js');

    // Calculate XP: 5 correct out of 5 with 15s remaining
    const bonus = calculateBonusXp(500, 5, 5, 15);
    assert.strictEqual(bonus.totalBonusXp >= 50, true);

    const initialUser: any = {
      id: 'test-challenge-user',
      name: 'Chidi',
      totalXp: 200,
      streakDays: 3,
      bestStreak: 5,
      streakHistory: ['2026-10-12', '2026-10-13'],
      lastActiveDate: '2026-10-13',
      dailyTimeSpentTodayMinutes: 5,
      dailyXpEarnedToday: 20,
    };

    assert.strictEqual(isDailyChallengeCompletedToday(initialUser), false);

    const winResult = recordDailyChallengeWin(initialUser, 550, bonus.totalBonusXp);
    assert.strictEqual(winResult.isNewHighScore, true);
    assert.strictEqual(winResult.updatedUser.totalXp, 200 + bonus.totalBonusXp);
    assert.strictEqual(winResult.updatedUser.streakDays, 4);
    assert.strictEqual(winResult.updatedUser.dailyChallengesWonCount, 1);
    assert.strictEqual(winResult.updatedUser.dailyChallengeHighScore, 550);
    assert.strictEqual(isDailyChallengeCompletedToday(winResult.updatedUser), true);
  });

  // 11. LEONARDO 1,000-AGENT COORDINATED AI ASSISTANT
  console.log('\n--- 11. Leonardo 1,000-Agent Coordinated AI Assistant ---');

  await test('Leonardo Team Metadata & 1,000-Agent Architecture', async () => {
    const res = await request('GET', '/api/leonardo/teams');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.teams.length, 10, 'Must have exactly 10 coordinated agent teams');
    assert.strictEqual(res.data.totalAgentsRepresented, 1000, 'Sum of agent divisions must represent exactly 1,000 specialized agents');

    const teamIds = res.data.teams.map((t: any) => t.id);
    assert.ok(teamIds.includes('instruction_curriculum'), 'Must have instruction_curriculum');
    assert.ok(teamIds.includes('grammar_vocab_translation'), 'Must have grammar_vocab_translation');
    assert.ok(teamIds.includes('speech_pronunciation'), 'Must have speech_pronunciation');
    assert.ok(teamIds.includes('conversation_roleplay'), 'Must have conversation_roleplay');
    assert.ok(teamIds.includes('personalization_strategist'), 'Must have personalization_strategist');
    assert.ok(teamIds.includes('assessment_analytics'), 'Must have assessment_analytics');
    assert.ok(teamIds.includes('cultural_context'), 'Must have cultural_context');
    assert.ok(teamIds.includes('accessibility_inclusion'), 'Must have accessibility_inclusion');
    assert.ok(teamIds.includes('troubleshooting_support'), 'Must have troubleshooting_support');
    assert.ok(teamIds.includes('qa_safety_supervisor'), 'Must have qa_safety_supervisor');
  });

  await test('Leonardo Quota & Subscription Entitlement Check', async () => {
    // Free tier check
    const freeRes = await request('GET', '/api/leonardo/quota/test-free-user?tier=free');
    assert.strictEqual(freeRes.status, 200);
    assert.strictEqual(freeRes.data.tier, 'free');
    assert.strictEqual(freeRes.data.unlimited, false);
    assert.strictEqual(freeRes.data.dailyQueriesLimit, 20);

    // Pro tier check
    const proRes = await request('GET', '/api/leonardo/quota/test-pro-user?tier=pro');
    assert.strictEqual(proRes.status, 200);
    assert.strictEqual(proRes.data.tier, 'pro');
    assert.strictEqual(proRes.data.unlimited, true);
  });

  await test('Leonardo Orchestrator: Grammar & Linguistic Inquiry', async () => {
    const res = await request('POST', '/api/leonardo/chat', {}, {
      messages: [{ role: 'user', content: 'What is the grammatical difference between formal and informal you in European Portuguese and Hindi?' }],
      context: {
        userId: 'test-learner-1',
        name: 'Elena',
        targetLanguage: 'Hindi',
        nativeLanguage: 'English',
        currentCefr: 'A1',
        ageGroup: 'adult_18_plus',
        subscriptionTier: 'pro',
      },
      requestedTeam: 'grammar_vocab_translation',
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.data.message, 'Must return message object');
    assert.ok(res.data.message.content.length > 20, 'Response content must be non-empty and substantive');
    assert.strictEqual(res.data.orchestrator.routedTeam, 'grammar_vocab_translation');
    assert.strictEqual(res.data.orchestrator.guardrailPassed, true);
  });

  await test('Leonardo Orchestrator: Lead Bank Support & Glitch Recovery', async () => {
    const res = await request('POST', '/api/leonardo/chat', {}, {
      messages: [{ role: 'user', content: 'How do Lead Bank checking transfers work and how can I self-correct glitches?' }],
      context: {
        userId: 'test-learner-2',
        name: 'Marcus',
        targetLanguage: 'Spanish',
        nativeLanguage: 'English',
        currentCefr: 'B1',
        ageGroup: 'adult_18_plus',
        subscriptionTier: 'free',
      },
      requestedTeam: 'troubleshooting_support',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.orchestrator.routedTeam, 'troubleshooting_support');
    assert.ok(res.data.message.content.includes('Lead Bank'), 'Content must mention Lead Bank');
    assert.ok(res.data.message.content.includes('101019644'), 'Content must specify Lead Bank routing number');
    assert.ok(res.data.message.content.includes('210906176137'), 'Content must specify Lead Bank account number');
    assert.ok(res.data.message.content.includes('unconomics@gmail.com'), 'Content must include beneficiary email');
    assert.ok(res.data.message.suggestedActions.length > 0, 'Must provide executable in-app actions');
  });

  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((e) => {
  console.error('Fatal test execution failure:', e);
  process.exit(1);
});
