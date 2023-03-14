import express, { Express } from 'express';
import dbConnection from './db';
import { ApiServer } from './server';

class Application {
  public startApplication(): void {
    dbConnection();
    const app: Express = express();
    const server: ApiServer = new ApiServer(app);
    server.start();
  }
}

const application: Application = new Application();
application.startApplication();
