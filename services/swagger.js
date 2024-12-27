import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();


const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ONSCREEN MARKING SYSTEM APIS',
            version: '1.0.0',
            description: 'API documentation for all backend endpoints.',
        },
        servers: [
            {
                // url: `http://192.168.1.43:8000`,
                url: process.env.SERVER_URL,
                description: 'Development server',
            },
        ],
    },
    apis: [
        './routes/authRoutes/*.js',
        './routes/classRoutes/*.js',
        './routes/subjectRoutes/*.js',
        './routes/schemeRoutes/*.js',
        './routes/subjectSchemaRelationRoutes/*.js',
        './routes/taskRoutes/*.js',
        './routes/evaluationRoutes/*.js',
    ],
};

const swaggerDocs = swaggerJsdoc(options);

console.log('Detected Paths:', swaggerDocs.paths);

export default swaggerDocs;
