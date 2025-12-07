// swagger.js
// Run: node swagger.js

const swaggerAutogen = require('swagger-autogen')({ openapi: '2.0' });

const doc = {
  info: {
    title: 'CampusOne SMS API',
    description: 'Swagger documentation for CampusOne School Management System backend APIs',
    version: '1.0.0',
  },
  basePath: '/',               // keep
  consumes: ['application/json'],
  produces: ['application/json'],
  // ✅ DO NOT set host/schemes here (works for localhost + vercel automatically)
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ swagger-output.json generated successfully!');
});
