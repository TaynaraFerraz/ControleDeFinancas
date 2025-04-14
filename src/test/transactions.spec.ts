import { expect, test, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('Transactions routes', () => {
  // categorizando os testes
  beforeAll(async () => {
    await app.ready()
  }) // executa antes de todos os testes

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  }) // o ideal é ter o banco de dados zerados para aplicar os testes. Entao desfiz as migrations e depois crio as tabelas de novo

  test('User can create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  // nao pode escrever um teste que depende de outro

  test('User can list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    if (cookies) {
      const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      expect(listTransactionsResponse.body.transactions).toEqual([
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
        }),
      ])
    } else {
      console.log('Cookie não identificado')
    }
  })

  test('User can list a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    if (cookies) {
      const listTransactionsResponse = await request(app.server)
        .get('/transactions')
        .set('Cookie', cookies)
        .expect(200)

      const transactionId = listTransactionsResponse.body.transactions[0].id

      const getTransactionResponse = await request(app.server)
        .get(`/transactions/${transactionId}`)
        .set('Cookie', cookies)
        .expect(200)

      expect(getTransactionResponse.body.transactions).toEqual(
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
        }),
      )
    } else {
      console.log('Cookie não identificado')
    }
  })

  test('User can get summary', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    if (cookies) {
      await request(app.server)
        .post('/transactions')
        .set('Cookie', cookies)
        .send({
          title: 'Debit transaction',
          amount: 2000,
          type: 'debit',
        })

      const summaryResponse = await request(app.server)
        .get('/transactions/summary')
        .set('Cookie', cookies)
        .expect(200)

      expect(summaryResponse.body.summary).toEqual({
        amount: 3000,
      })
    } else {
      console.log('Cookie não identificado')
    }
  })
})
