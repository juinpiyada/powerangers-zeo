const swaggerAutogen = require('swagger-autogen')();

const isVercel = !!process.env.VERCEL;

const doc = {
  info: {
    title: 'CampusOne SMS API',
    description: 'Swagger documentation for CampusOne School Management System backend APIs',
    version: '1.0.0',
  },
  host: isVercel ? 'powerangers-zeo.vercel.app' : 'localhost:9090',
  schemes: [isVercel ? 'https' : 'http'],
  basePath: '/',
  consumes: ['application/json'],
  produces: ['application/json'],
};

swaggerAutogen('./swagger-output.json', ['./index.js'], doc).then(() => {
  console.log('✅ swagger-output.json generated!');
});
