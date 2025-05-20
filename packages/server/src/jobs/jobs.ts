import cron from 'node-cron';
import { ExtensionJob } from './extension.job';

type Job = {
  name: string;
  schedule: string;

  task: Function;
  runOnStartup: boolean;
};

const jobs: Job[] = [
  {
    name: 'Extension Update',
    // Schedule it every day at midnight
    schedule: '0 0 * * *',
    task: ExtensionJob,
    runOnStartup: true,
  },
];

export const runScheduledJobs = () => {
  jobs.map((job) => {
    cron.schedule(job.schedule, () => job.task, {
      timezone: 'UTC',
    });

    if (job.runOnStartup) {
      job.task();
    }
  });
};
