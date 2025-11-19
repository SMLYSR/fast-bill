import express from 'express';
import authRouter from './routes/auth';
import { logger } from './logger';

const app = express();
app.use(express.json());

app.use('/api/auth', authRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error({ err, path: req.path });
  const status = err.status || 500;
  const code = err.code || 50000;
  const message = err.message || 'server_error';
  res.status(status).json({ code, message });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  logger.info({ msg: 'server_started', port });
});