const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/cors'));

fastify.get('/', async (request, reply) => {
  return { message: 'Hello from Fastify API' }
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();