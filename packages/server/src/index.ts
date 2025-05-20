import express, { json, type Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { type User } from './models/user/user.model.js';
import { userMiddleware } from './user/core/user.middleware.js';
import { router as userRouter } from './user/core/user.controller.js';
import { createBuckets } from './aws-client.js';
import { GoogleAccount, type Session } from './models/schema.js';
import { loadConfigurations } from './config/config.js';
import { initGoogleClient } from './user/google/google.service.js';
import { extensionController } from './extensions/extension.controller.js';
import { runScheduledJobs } from './jobs/jobs.js';

loadConfigurations();
void createBuckets();

runScheduledJobs();

initGoogleClient();

declare global {
  namespace Express {
    interface Request {
      user: User & {
        googleAccount: GoogleAccount | null;
      };
      session: Session;
    }
  }
}

const app: Express = express();

app.use(cors());

app.use(json());
app.use(bodyParser.json());

app.use(userMiddleware);

app.use('/users', userRouter);
app.use('/extensions', extensionController);
//app.use(errorMiddleware);

app.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Server is running on port 3000');
});
