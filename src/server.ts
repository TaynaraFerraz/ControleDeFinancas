import fastify from 'fastify'
import { env } from './env'
import { transactionRoutes } from './routes/transaction'
const app = fastify()

app.register(transactionRoutes, {
  prefix: 'transactions',
}) // plug-in: colocar(separar) as rotas em outros arquivos

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })
