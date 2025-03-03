import express, { json, type Express } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import { type User } from './models/user.model.js';
import { userMiddleware } from './user/core/user.middleware.js';
import { router as userRouter } from './user/core/user.controller.js';

config();
//void createBuckets();

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

const app: Express = express();

app.use(cors());

app.use(json());
app.use(bodyParser.json());

app.use(userMiddleware);

app.use('/users', userRouter);
//app.use(errorMiddleware);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 3000');
});
