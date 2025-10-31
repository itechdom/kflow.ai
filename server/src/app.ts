import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';

const app: Application = express();

// Global middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

export default app;

