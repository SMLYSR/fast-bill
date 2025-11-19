import request from 'supertest';
import express from 'express';
import authRouter from '../routes/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

const hasEnv = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_ANON_KEY);

const maybe = hasEnv ? test : test.skip;

maybe('email auto-register then login', async () => {
  const unique = `user${Date.now()}@example.com`;
  const res = await request(app).post('/api/auth/login').send({ username: unique, password: 'Abcd1234' });
  expect(res.status).toBe(200);
  expect(res.body?.data?.token).toBeTruthy();
});