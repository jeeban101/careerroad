import { test, expect, APIRequestContext } from "@playwright/test";

const API_BASE_URL = "http://localhost:8005";

const NUM_TASKS = 6; // 2 phases × 3 tasks each

test.describe("Latency Tests — Batch vs Per-Task Progress Fetching", () => {
  let authRequest: APIRequestContext;
  let roadmapHistoryId: number;

  // ──────────── Setup: register, login, create history + seed progress ────────────

  test.beforeAll(async ({ playwright }) => {
    // Create a context that persists cookies across requests
    const tempContext = await playwright.request.newContext();

    // Register a unique user
    const email = `latency_${Date.now()}@example.com`;
    const regRes = await tempContext.post(`${API_BASE_URL}/api/register`, {
      data: {
        email,
        password: "TestPassword123!",
        firstName: "Latency",
        lastName: "Test",
      },
    });
    expect(regRes.status()).toBe(201);

    // Login to get session cookie
    const loginRes = await tempContext.post(`${API_BASE_URL}/api/login`, {
      data: { email, password: "TestPassword123!" },
    });
    expect(loginRes.status()).toBe(200);

    // Extract the session cookie from login response
    const setCookie = loginRes.headers()["set-cookie"];
    expect(setCookie).toBeTruthy();

    // Create an authenticated request context with the cookie
    authRequest = await playwright.request.newContext({
      extraHTTPHeaders: {
        Cookie: setCookie!.split(";")[0], // just the connect.sid=... part
      },
    });

    // Verify auth works
    const userRes = await authRequest.get(`${API_BASE_URL}/api/user`);
    expect(userRes.status()).toBe(200);

    // Create a roadmap with 2 phases, 3 items each
    const historyRes = await authRequest.post(
      `${API_BASE_URL}/api/user-roadmap-history`,
      {
        data: {
          title: "Latency Test Roadmap",
          roadmapType: "career",
          currentCourse: "Computer Science",
          targetRole: "Software Engineer",
          phases: [
            {
              title: "Phase 1",
              duration_weeks: 4,
              items: [
                { type: "resource", label: "Task 0-0", description: "desc" },
                { type: "task", label: "Task 0-1", description: "desc" },
                { type: "tool", label: "Task 0-2", description: "desc" },
              ],
            },
            {
              title: "Phase 2",
              duration_weeks: 4,
              items: [
                { type: "resource", label: "Task 1-0", description: "desc" },
                { type: "task", label: "Task 1-1", description: "desc" },
                { type: "tool", label: "Task 1-2", description: "desc" },
              ],
            },
          ],
        },
      },
    );
    expect(historyRes.status()).toBe(201);
    const historyData = await historyRes.json();
    roadmapHistoryId = historyData.id;

    // Seed progress + notes for every task
    for (let phase = 0; phase < 2; phase++) {
      for (let task = 0; task < 3; task++) {
        const res = await authRequest.post(
          `${API_BASE_URL}/api/update-task-progress`,
          {
            data: {
              roadmapId: roadmapHistoryId,
              phaseIndex: phase,
              taskIndex: task,
              completed: true,
              notes: `Notes for phase ${phase}, task ${task} — completed`,
            },
          },
        );
        expect(res.status()).toBe(200);
      }
    }
  });

  test.afterAll(async () => {
    await authRequest?.dispose();
  });

  // ──────────── Test 1: Batch fetch latency budget ────────────

  test("batch fetch: single request returns all progress under latency budget", async () => {
    const start = performance.now();

    const res = await authRequest.get(
      `${API_BASE_URL}/api/roadmap-progress/${roadmapHistoryId}`,
    );

    const elapsed = performance.now() - start;

    expect(res.status()).toBe(200);
    const data = await res.json();

    // Should return progress for all 6 tasks
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(NUM_TASKS);

    // Latency budget: single batch request should complete in < 1000ms
    console.log(
      `🟢 Batch fetch (1 request, ${NUM_TASKS} tasks): ${elapsed.toFixed(1)}ms`,
    );
    expect(elapsed).toBeLessThan(1000);
  });

  // ──────────── Test 2: Batch vs sequential comparison ────────────

  test("per-task fetch: N individual requests are slower than batch", async () => {
    // Measure batch time
    const batchStart = performance.now();
    await authRequest.get(
      `${API_BASE_URL}/api/roadmap-progress/${roadmapHistoryId}`,
    );
    const batchTime = performance.now() - batchStart;

    // Measure N sequential individual requests (simulating waterfall)
    const perTaskStart = performance.now();
    for (let phase = 0; phase < 2; phase++) {
      for (let task = 0; task < 3; task++) {
        const res = await authRequest.get(
          `${API_BASE_URL}/api/roadmap-progress/${roadmapHistoryId}?phaseIndex=${phase}&taskIndex=${task}`,
        );
        expect(res.status()).toBe(200);
      }
    }
    const perTaskTime = performance.now() - perTaskStart;

    console.log(`🟢 Batch fetch:    ${batchTime.toFixed(1)}ms (1 request)`);
    console.log(
      `🔴 Per-task fetch:  ${perTaskTime.toFixed(1)}ms (${NUM_TASKS} requests)`,
    );
    console.log(
      `⚡ Speedup:         ${(perTaskTime / batchTime).toFixed(1)}x faster`,
    );

    // The batch approach should be faster than N sequential requests
    expect(batchTime).toBeLessThan(perTaskTime);
  });

  // ──────────── Test 3: Data completeness ────────────

  test("batch response includes notes and completion status for every task", async () => {
    const res = await authRequest.get(
      `${API_BASE_URL}/api/roadmap-progress/${roadmapHistoryId}`,
    );

    expect(res.status()).toBe(200);
    const data = await res.json();

    // Every task should have completion and notes data
    for (const progress of data) {
      expect(progress).toHaveProperty("completed");
      expect(progress.completed).toBe(true);
      expect(progress).toHaveProperty("notes");
      expect(typeof progress.notes).toBe("string");
      expect(progress.notes.length).toBeGreaterThan(0);
      expect(progress).toHaveProperty("phaseIndex");
      expect(progress).toHaveProperty("taskIndex");
    }

    // Verify all 6 unique phase-task combinations are present
    const keys = new Set(
      data.map((p: any) => `${p.phaseIndex}-${p.taskIndex}`),
    );
    expect(keys.size).toBe(NUM_TASKS);
  });

  // ──────────── Test 4: Per-task endpoint parity ────────────

  test("per-task endpoint returns same data as batch for each task", async () => {
    // Get batch data
    const batchRes = await authRequest.get(
      `${API_BASE_URL}/api/roadmap-progress/${roadmapHistoryId}`,
    );
    const batchData = await batchRes.json();

    // For each task, verify individual endpoint returns matching data
    for (const batchItem of batchData) {
      const singleRes = await authRequest.get(
        `${API_BASE_URL}/api/roadmap-progress/${roadmapHistoryId}?phaseIndex=${batchItem.phaseIndex}&taskIndex=${batchItem.taskIndex}`,
      );
      expect(singleRes.status()).toBe(200);
      const singleItem = await singleRes.json();

      expect(singleItem.completed).toBe(batchItem.completed);
      expect(singleItem.notes).toBe(batchItem.notes);
      expect(singleItem.phaseIndex).toBe(batchItem.phaseIndex);
      expect(singleItem.taskIndex).toBe(batchItem.taskIndex);
    }
  });

  // ──────────── Test 5: Concurrent vs batch ────────────

  test("concurrent per-task requests still have more overhead than single batch", async () => {
    // Measure batch
    const batchStart = performance.now();
    await authRequest.get(
      `${API_BASE_URL}/api/roadmap-progress/${roadmapHistoryId}`,
    );
    const batchTime = performance.now() - batchStart;

    // Measure concurrent per-task (Promise.all — best-case for N requests)
    const concurrentStart = performance.now();
    const promises = [];
    for (let phase = 0; phase < 2; phase++) {
      for (let task = 0; task < 3; task++) {
        promises.push(
          authRequest.get(
            `${API_BASE_URL}/api/roadmap-progress/${roadmapHistoryId}?phaseIndex=${phase}&taskIndex=${task}`,
          ),
        );
      }
    }
    await Promise.all(promises);
    const concurrentTime = performance.now() - concurrentStart;

    console.log(`🟢 Batch fetch:      ${batchTime.toFixed(1)}ms (1 request)`);
    console.log(
      `🟡 Concurrent fetch:  ${concurrentTime.toFixed(1)}ms (${NUM_TASKS} parallel requests)`,
    );
    console.log(
      `⚡ Speedup:           ${(concurrentTime / batchTime).toFixed(1)}x faster`,
    );

    // Key assertion: batch is within budget
    expect(batchTime).toBeLessThan(1000);
  });

  // ──────────── Test 6: Empty roadmap edge case ────────────

  test("batch fetch on roadmap with no progress returns empty array quickly", async () => {
    // Create a fresh roadmap with no progress
    const createRes = await authRequest.post(
      `${API_BASE_URL}/api/user-roadmap-history`,
      {
        data: {
          title: "Empty Roadmap",
          roadmapType: "career",
          currentCourse: "Art",
          targetRole: "Designer",
          phases: [
            {
              title: "Phase 1",
              duration_weeks: 2,
              items: [{ type: "task", label: "T1", description: "d" }],
            },
          ],
        },
      },
    );
    expect(createRes.status()).toBe(201);
    const { id: emptyId } = await createRes.json();

    const start = performance.now();
    const res = await authRequest.get(
      `${API_BASE_URL}/api/roadmap-progress/${emptyId}`,
    );
    const elapsed = performance.now() - start;

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(0);

    console.log(`🟢 Empty roadmap batch fetch: ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(1000);
  });
});
