const { createBullBoard } = require('bull-board')
const { BullMQAdapter } = require('bull-board/bullMQAdapter')
const { Queue: QueueMQ, Worker, QueueScheduler } = require('bullmq')
const express = require('express')

const sleep = (t) => new Promise((resolve) => setTimeout(resolve, t * 1000))

const redisOptions = {
  port: 6379,
  host: 'localhost',
  password: '',
  tls: false,
}

const createQueueMQ = (name) => new QueueMQ(name, { connection: redisOptions })

async function setupBullMQProcessor(queueName) {
  const queueScheduler = new QueueScheduler(queueName, {
    connection: redisOptions,
  })
  await queueScheduler.waitUntilReady()

  new Worker(queueName, async (job) => {
    for (let i = 0; i <= 100; i++) {
      await sleep(Math.random())
      await job.updateProgress(i)
      await job.log(`Processing job at interval ${i}`)

      if (Math.random() * 200 < 1) throw new Error(`Random error ${i}`)
    }

    return { jobId: `This is the return value of job (${job.id})` }
  })
}

const run = async () => {
  const exampleBullMq = createQueueMQ('BullMQ - instance1')
  const exampleBullMq2 = createQueueMQ('BullMQ - instance2')

  await setupBullMQProcessor(exampleBullMq.name)
  await setupBullMQProcessor(exampleBullMq2.name)

  const app = express()
  // Configure view engine to render EJS templates.
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')

  const { router: instance1Router } = createBullBoard([
    new BullMQAdapter(exampleBullMq),
  ])

  const { router: instance2Router } = createBullBoard([
    new BullMQAdapter(exampleBullMq2),
  ])

  app.use('/instance1', instance1Router)
  app.use('/instance2', instance2Router)

  app.use('/add', (req, res) => {
    const opts = req.query.opts || {}

    if (opts.delay) {
      opts.delay = +opts.delay * 1000 // delay must be a number
    }

    exampleBullMq.add('Add instance 1', { title: req.query.title }, opts)
    exampleBullMq2.add('Add instance 2', { title: req.query.title }, opts)

    res.json({
      ok: true,
    })
  })

  app.listen(3000, () => {
    console.log('Running on 3000...')
    console.log('For the UI of instance1, open http://localhost:3000/instance1')
    console.log('For the UI of instance2, open http://localhost:3000/instance2')
    console.log('Make sure Redis is running on port 6379 by default')
    console.log('To populate the queue, run:')
    console.log('  curl http://localhost:3000/add?title=Example')
    console.log('To populate the queue with custom options (opts), run:')
    console.log('  curl http://localhost:3000/add?title=Test&opts[delay]=9')
  })
}

// eslint-disable-next-line no-console
run().catch((e) => console.error(e))
