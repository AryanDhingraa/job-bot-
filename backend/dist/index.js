"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pubSub = exports.AppDataSource = exports.app = void 0;
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const cors_1 = __importDefault(require("cors"));
const data_source_1 = require("./data-source");
Object.defineProperty(exports, "AppDataSource", { enumerable: true, get: function () { return data_source_1.AppDataSource; } });
const auth_1 = __importDefault(require("./routes/auth"));
const lecturer_1 = __importDefault(require("./routes/lecturer"));
const candidate_1 = __importDefault(require("./routes/candidate"));
const user_1 = __importDefault(require("./routes/user"));
const course_1 = __importDefault(require("./routes/course"));
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const type_graphql_1 = require("type-graphql");
const UserResolver_1 = require("./graphql/resolvers/UserResolver");
const CourseResolver_1 = require("./graphql/resolvers/CourseResolver");
const ApplicationResolver_1 = require("./graphql/resolvers/ApplicationResolver");
const authChecker_1 = require("./graphql/authChecker");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_1 = require("http");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const graphql_subscriptions_1 = require("graphql-subscriptions");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const pubSub = new graphql_subscriptions_1.PubSub();
exports.pubSub = pubSub;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    // Initialize database connection (only for non-test environment)
    if (process.env.NODE_ENV !== 'test') {
        try {
            yield data_source_1.AppDataSource.initialize();
            console.log('Data Source has been initialized!');
        }
        catch (err) {
            console.error('Error during Data Source initialization:', err);
        }
    }
    // GraphQL setup
    const schema = yield (0, type_graphql_1.buildSchema)({
        resolvers: [UserResolver_1.UserResolver, CourseResolver_1.CourseResolver, ApplicationResolver_1.ApplicationResolver],
        authChecker: authChecker_1.customAuthChecker,
        pubSub: pubSub,
        validate: false,
    });
    const apolloServer = new server_1.ApolloServer({
        schema,
    });
    yield apolloServer.start();
    app.use('/graphql', (0, cors_1.default)(), express_1.default.json(), (0, express4_1.expressMiddleware)(apolloServer, {
        context: (_a) => __awaiter(void 0, [_a], void 0, function* ({ req }) {
            var _b;
            const token = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1];
            let user;
            if (token) {
                try {
                    const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                    user = { id: payload.userId, email: payload.email, role: payload.role };
                }
                catch (error) {
                    console.error('Invalid token', error);
                }
            }
            return { req, user, pubSub };
        }),
    }));
    // Existing REST API routes
    app.use((0, cors_1.default)({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
        credentials: true,
    }));
    app.use(express_1.default.json()); // Apply JSON body parser to all routes
    // Handle preflight OPTIONS requests for all routes
    app.options('*', (0, cors_1.default)());
    app.use('/api/auth', auth_1.default);
    app.use('/api/candidate', candidate_1.default);
    app.use('/api/lecturer', lecturer_1.default);
    app.use('/api/user', user_1.default);
    app.use('/api/courses', course_1.default);
    const PORT = process.env.PORT || 5001;
    const httpServer = (0, http_1.createServer)(app);
    const wsServer = new ws_1.WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });
    (0, ws_2.useServer)({
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
});
startServer();
