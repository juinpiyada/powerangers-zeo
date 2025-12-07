// swagger.js
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'CampusOne SMS API',
    description: 'Swagger documentation for CampusOne School Management System backend APIs',
    version: '1.0.0',
  },
  host: 'powerangers-zeo.vercel.app',
  schemes: ['https'],
  basePath: '/api', // change to '/' if you are NOT using /api prefix
  consumes: ['application/json'],
  produces: ['application/json'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ swagger-output.json generated successfully!');
});
