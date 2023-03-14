import express, { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import 'express-async-errors';
import hpp from 'hpp';
import helmet from 'helmet';
import cors from 'cors';
import config from 'config';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import HTTP_STATUS from 'http-status-codes';
import logger from '@global/helpers/logger';
import { CustomError, IErrorResponse } from '@global/helpers/errorHandler';

const port = config.get('server.port');

export class ApiServer {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  // start the server with
  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  // setup security middleware
  private securityMiddleware(app: Application): void {
    app.set('trust proxy', 1);

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Data sanitization against XSS
    app.use(xss());

    // Prevent parameter pollution
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.get('server.CLIENT_URL'),
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  // setup standard middleware
  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '500kb' }));
    app.use(urlencoded({ extended: true, limit: '500kb' }));
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views/email'));
    app.use(express.static(path.join(__dirname, 'public')));
  }

  //setup route middleware
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private routeMiddleware(app: Application): void {}

  // setup global error handler middleware
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private globalErrorHandler(app: Application): void {
  app.all('*', (req: Request, res: Response) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
  });

  app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
    logger.error(error);
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json(error.serializeErrors());
    }
    next();
  });
  }

  // // setup app monitoring
  // private apiMonitoring(app: Application): void {}

  // setup sever starter
  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      // const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      // this.socketIOConnections(socketIO);
    } catch (error) {
      console.error(error);
    }
  }

  private startHttpServer(httpServer: http.Server): void {
    logger.info(`Server has started with process ${process.pid}`);
    httpServer.listen(port, () => {
      logger.info(`Server is listening on ${port}`);
    });
  }

  // Socketio setup
  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        origin: config.get('server.CLIENT_URL'),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.get('redis.REDIS_HOST') });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  // private startHttpServer(httpServer: http.Server): void {}

  // private socketIOConnections(io: Server): void {}
}
