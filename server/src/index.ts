import express, { json, type Express } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import bodyParser from 'body-parser';
import { userMiddleware } from './user/core/user.middleware';
import { router as userController } from './user/core/user.controller';
import { router as subscriptionController } from './user/subscription/subscription.controller';
import { router as productController } from './product/core/product.controller';
import { type User } from './models/schema';
import { errorMiddleware } from './middleware/error.middleware';
import { createBuckets } from './aws-client';

config();
void createBuckets();

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

app.use('/users', userController);
app.use('/subscriptions', subscriptionController);
app.use('/products', productController);

app.use(errorMiddleware);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 3000');
});
