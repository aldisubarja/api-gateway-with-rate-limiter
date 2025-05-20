const request = require('supertest');
const express = require('express');
const rateLimiter = require('../src/middleware/rateLimiter');

const app = express();
app.use(express.json());
app.get('/data', rateLimiter, (req, res) => res.json({ message: 'ok' }));

describe('Rate Limiter Middleware', () => {
  it('returns 401 if no API key provided', async () => {
    const res = await request(app).get('/data');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('API key required');
  });

  it('allows requests within limit', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).get('/data').set('x-api-key', 'testkey');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('ok');
    }
  });

  it('blocks requests exceeding limit', async () => {
    const key = 'ratelimit-test-key';

    // Make max allowed requests
    for (let i = 0; i < 10; i++) {
      await request(app).get('/data').set('x-api-key', key);
    }

    // 11th request should be blocked
    const res = await request(app).get('/data').set('x-api-key', key);
    expect(res.statusCode).toBe(429);
    expect(res.body.message).toBe('Too many requests');
  });
});
