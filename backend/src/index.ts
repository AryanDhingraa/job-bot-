import express from 'express';
import 'reflect-metadata';
import cors from 'cors';
import { AppDataSource } from './data-source';
import authRoutes from './routes/auth';
import lecturerRoutes from './routes/lecturer';
import candidateRoutes from './routes/candidate';
import userRoutes from './routes/user';
import courseRoutes from './routes/course';
import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './graphql/resolvers/UserResolver';
import { CourseResolver } from './graphql/resolvers/CourseResolver';
import { ApplicationResolver } from './graphql/resolvers/ApplicationResolver';
import { customAuthChecker } from './graphql/authChecker';
import jwt from 'jsonwebtoken';
import { User } from './entity/User';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import { execute, subscribe } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

dotenv.config();

const app = express();
const pubSub = new PubSub();

const startServer = async () => {
  // Initialize database connection (only for non-test environment)
  if (process.env.NODE_ENV !== 'test') {
    try {
      await AppDataSource.initialize();
      console.log('Data Source has been initialized!');
    } catch (err) {
      console.error('Error during Data Source initialization:', err);
    }
  }

  // GraphQL setup
  const schema = await buildSchema({
    resolvers: [UserResolver, CourseResolver, ApplicationResolver],
    authChecker: customAuthChecker,
    pubSub: pubSub as any,
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.split(' ')[1];
        let user: { id: number; email: string; role: string } | undefined;

        if (token) {
          try {
            const payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
            user = { id: payload.userId, email: payload.email, role: payload.role };
          } catch (error) {
            console.error('Invalid token', error);
          }
        }
        return { req, user, pubSub };
      },
    }),
  );

  // Existing REST API routes
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
  }));
  app.use(express.json()); // Apply JSON body parser to all routes

  // Handle preflight OPTIONS requests for all routes
  app.options('*', cors());

  app.use('/api/auth', authRoutes);
  app.use('/api/candidate', candidateRoutes);
  app.use('/api/lecturer', lecturerRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/courses', courseRoutes);

  const PORT = process.env.PORT || 5001;

  const httpServer = createServer(app);
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  useServer({
    schema,
  }, wsServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
    console.log(`Subscriptions endpoint at ws://localhost:${PORT}/graphql`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    wsServer.close();
    httpServer.close(() => {
      console.log('Server shut down.');
      process.exit(0);
    });
  });
};

startServer();

export { app, AppDataSource, pubSub }; 