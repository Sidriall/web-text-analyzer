'use strict';
const Hapi = require('@hapi/hapi');
const filepaths = require('filepaths');
const logger = require('./libs/logger');
require('dotenv').config();

const { HOST, PORT } = process.env;

const init = async () => {
  const server = Hapi.server({
    port: PORT || 3000,
    host: HOST || 'localhost',
  });

  await server.register(require('@hapi/inert'));

  server.ext({
    type: 'onRequest',
    method: async function (request, h) {
      request.server.logger = logger;
      return h.continue;
    },
  });

  // get all routes
  const routes = filepaths.getSync(`${__dirname}/routes/`);
  for (const route of routes) {
    server.route(require(route));
  }

  // test route
  server.route({
    method: 'GET',
    path: '/',
    handler: () => {
      return 'Hello! This is the test message ;)';
    },
  });

  // starting server
  await server.start();
  logger.info(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  logger.error(err);
  process.exit(1);
});

module.exports = init;
