import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:8005';
const CLIENT_URL = 'http://localhost:5173';

// Test data
const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Integration',
    lastName: 'Test'
};

let authCookie: string;
let savedRoadmapId: number;
let kanbanBoardId: number;

test.describe('CareerRoad Integration Tests', () => {

    test.describe('1. Authentication Flow', () => {

        test('should register a new user', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/register`, {
                data: testUser
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('id');
            expect(data.email).toBe(testUser.email);
        });

        test('should login with valid credentials', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/login`, {
                data: {
                    email: testUser.email,
                    password: testUser.password
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.email).toBe(testUser.email);

            // Save session cookie for authenticated requests
            const cookies = response.headers()['set-cookie'];
            if (cookies) {
                authCookie = cookies;
            }
        });

        test('should get current user when authenticated', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/user`, {
                headers: {
                    'Cookie': authCookie
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.email).toBe(testUser.email);
        });

        test('should return 401 for unauthenticated requests', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/saved-roadmaps`);
            expect(response.status()).toBe(401);
        });
    });

    test.describe('2. Roadmap Generation', () => {

        test('should generate AI career roadmap', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/generate-roadmap`, {
                data: {
                    currentCourse: 'Computer Science',
                    targetRole: 'Full Stack Developer'
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('phases');
            expect(Array.isArray(data.phases)).toBe(true);
            expect(data.phases.length).toBeGreaterThan(0);
        });

        test('should generate AI skill roadmap', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/generate-skill-roadmap`, {
                data: {
                    skill: 'React',
                    proficiencyLevel: 'intermediate',
                    timeFrame: '3 months'
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('skillContent');
            expect(data.skill).toBe('React');
        });

        test('should get all roadmap templates', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/roadmap-templates`);

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(Array.isArray(data)).toBe(true);
        });
    });

    test.describe('3. Roadmap Management (Authenticated)', () => {

        test('should save a roadmap', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/saved-roadmaps`, {
                headers: {
                    'Cookie': authCookie
                },
                data: {
                    title: 'Test Roadmap',
                    roadmapType: 'career',
                    currentCourse: 'Computer Science',
                    targetRole: 'Software Engineer',
                    phases: [
                        {
                            title: 'Phase 1',
                            duration: '3 months',
                            tasks: ['Task 1', 'Task 2']
                        }
                    ]
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('id');
            savedRoadmapId = data.id;
        });

        test('should get saved roadmaps', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/saved-roadmaps`, {
                headers: {
                    'Cookie': authCookie
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBeGreaterThan(0);
        });

        test('should create roadmap history entry', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/user-roadmap-history`, {
                headers: {
                    'Cookie': authCookie
                },
                data: {
                    title: 'Test History Roadmap',
                    roadmapType: 'career',
                    currentCourse: 'Computer Science',
                    targetRole: 'DevOps Engineer',
                    phases: []
                }
            });

            expect(response.status()).toBe(201);
            const data = await response.json();
            expect(data).toHaveProperty('id');
        });

        test('should get roadmap history', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/user-roadmap-history`, {
                headers: {
                    'Cookie': authCookie
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(Array.isArray(data)).toBe(true);
        });
    });

    test.describe('4. Progress Tracking', () => {

        test('should update task progress', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/update-task-progress`, {
                headers: {
                    'Cookie': authCookie
                },
                data: {
                    roadmapId: savedRoadmapId,
                    phaseIndex: 0,
                    taskIndex: 0,
                    completed: true,
                    notes: 'Completed successfully'
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        test('should get user stats', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/user/stats`, {
                headers: {
                    'Cookie': authCookie
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('totalRoadmaps');
        });
    });

    test.describe('5. Kanban Board Operations', () => {

        test('should create kanban board', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/kanban/boards`, {
                headers: {
                    'Cookie': authCookie
                },
                data: {
                    name: 'Test Board',
                    description: 'Integration test board',
                    roadmapType: 'career'
                }
            });

            expect(response.status()).toBe(201);
            const data = await response.json();
            expect(data).toHaveProperty('id');
            kanbanBoardId = data.id;
        });

        test('should get all kanban boards', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/kanban/boards`, {
                headers: {
                    'Cookie': authCookie
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(Array.isArray(data)).toBe(true);
        });

        test('should get specific kanban board', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/kanban/boards/${kanbanBoardId}`, {
                headers: {
                    'Cookie': authCookie
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.id).toBe(kanbanBoardId);
        });

        test('should create kanban task', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/kanban/boards/${kanbanBoardId}/tasks`, {
                headers: {
                    'Cookie': authCookie
                },
                data: {
                    title: 'Test Task',
                    description: 'Integration test task',
                    status: 'todo',
                    priority: 'medium',
                    position: 0
                }
            });

            expect(response.status()).toBe(201);
            const data = await response.json();
            expect(data).toHaveProperty('id');
        });

        test('should get board tasks', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/kanban/boards/${kanbanBoardId}/tasks`, {
                headers: {
                    'Cookie': authCookie
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(Array.isArray(data)).toBe(true);
        });
    });

    test.describe('6. Error Handling', () => {

        test('should return 400 for invalid roadmap data', async ({ request }) => {
            const response = await request.post(`${API_BASE_URL}/api/generate-roadmap`, {
                data: {
                    // Missing required fields
                }
            });

            expect(response.status()).toBe(400);
        });

        test('should return 404 for non-existent roadmap', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/custom-roadmaps/999999`);
            expect(response.status()).toBe(404);
        });

        test('should return 401 for protected routes without auth', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/kanban/boards`);
            expect(response.status()).toBe(401);
        });
    });

    test.describe('7. CORS Configuration', () => {

        test('should allow requests from client origin', async ({ request }) => {
            const response = await request.get(`${API_BASE_URL}/api/roadmap-templates`, {
                headers: {
                    'Origin': CLIENT_URL
                }
            });

            expect(response.status()).toBe(200);
            const headers = response.headers();
            expect(headers['access-control-allow-origin']).toBe(CLIENT_URL);
        });
    });
});
