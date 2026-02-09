import cors from 'cors';
import express, { Application } from 'express';
import globalErrorHandler from './middlewares/globalErrorhandler';
import notFound from './middlewares/notFound';
import router from './routes';
import cookieParser from 'cookie-parser';
const app: Application = express();

//parsers
app.use(express.json());

app.use(cors({ origin: ['http://localhost:3000'] }));
app.use(cookieParser())
// application routes
app.use('/api/v1', router);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Apollo Gears API Service',
  });
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
