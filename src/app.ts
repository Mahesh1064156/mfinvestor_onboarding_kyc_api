import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { env } from './config/env';
import { errorMiddleware } from './common/middleware/error.middleware';

const app = express();
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.get('/health', (req, res) => res.json({ success: true, message: 'Server is running' }));
app.use('/api', routes);
app.use(errorMiddleware);
export default app;
