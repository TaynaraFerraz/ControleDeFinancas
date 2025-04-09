import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

export async function transactionRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    ) // validando os dados da minha requisição, para ver se eles batem com os dados do tipo createTransactionBodySchema. Se der erro, nada abaixo irá executar pois irá gerar um throw error

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    }) // para inserir não precisa passar o type ja que nao tem uma coluna reservada para ele

    return reply.status(201).send()
  })
}
