import request from 'supertest';

// Helper to mock OpenAI client per test
function mockOpenAIWithContent(content: string): void {
  jest.resetModules();
  jest.doMock('../src/config/openai', () => {
    return {
      getOpenAI: () => ({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content } }],
            }),
          },
        },
      }),
    };
  });
}

function mockOpenAINull(): void {
  jest.resetModules();
  jest.doMock('../src/config/openai', () => {
    return { getOpenAI: () => null };
  });
}

describe('KFlow API', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.dontMock('../src/config/openai');
  });

  test('GET /api/health returns OK', async () => {
    const app = require('../src/app').default;
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'OK', message: 'KFlow API is running' });
  });

  test('POST /api/generate-note 400 without prompt', async () => {
    mockOpenAIWithContent('irrelevant');
    const app = require('../src/app').default;
    const res = await request(app).post('/api/generate-note').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Prompt is required/i);
  });

  test('POST /api/generate-note returns structured note with mocked OpenAI', async () => {
    mockOpenAIWithContent('This is generated content.');
    const app = require('../src/app').default;
    const res = await request(app)
      .post('/api/generate-note')
      .send({ prompt: 'Study project meeting notes' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('content', 'This is generated content.');
    expect(Array.isArray(res.body.tags)).toBe(true);
  });

  test('POST /api/generate-children 400 without parentTitle', async () => {
    mockOpenAIWithContent('irrelevant');
    const app = require('../src/app').default;
    const res = await request(app).post('/api/generate-children').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Parent title is required/i);
  });

  test('POST /api/generate-children parses JSON array from OpenAI', async () => {
    const childrenJson = JSON.stringify([
      { title: 'Intro', content: 'Basics', tags: ['introduction'] },
      { title: 'Deep Dive', content: 'Details', tags: ['details'] },
    ]);
    mockOpenAIWithContent(childrenJson);
    const app = require('../src/app').default;
    const res = await request(app)
      .post('/api/generate-children')
      .send({ parentTitle: 'Topic' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.children)).toBe(true);
    expect(res.body.children.length).toBeGreaterThanOrEqual(2);
    expect(res.body.children[0]).toHaveProperty('title');
    expect(res.body.children[0]).toHaveProperty('content');
  });

  test('Endpoints return 500 when OpenAI is not configured', async () => {
    mockOpenAINull();
    const app = require('../src/app').default;

    const noteRes = await request(app)
      .post('/api/generate-note')
      .send({ prompt: 'anything' });
    expect(noteRes.status).toBe(500);
    expect(noteRes.body.error).toMatch(/OpenAI API key not configured/i);

    const childrenRes = await request(app)
      .post('/api/generate-children')
      .send({ parentTitle: 'X' });
    expect(childrenRes.status).toBe(500);
    expect(childrenRes.body.error).toMatch(/OpenAI API key not configured/i);
  });
});

