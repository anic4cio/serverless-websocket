import {
  sendFileToSlack,
  sendOkToSlack,
} from "./slackFileGetter"
import { http, Request } from '@google-cloud/functions-framework'
import { Response } from 'express'
import crypto from 'crypto';
import qs from "qs"

const signingSecret = process.env.SLACK_SIGNING_SECRET!

http('start', async (req: Request, res: Response) => {
  const payload = JSON.parse(req.body.payload)
  const timestamp = payload.message_ts
  await sendOkToSlack(timestamp)

  try {
    const requestBody = qs.stringify(req.body, { format: 'RFC1738' })
    await sendFileToSlack({
      filedata: requestBody,
      filetype: 'txt',
      filename: 'request-qs',
      timestamp
    })
  } catch (err) {
    console.error(err)
  }

  try {
    const str = JSON.parse(JSON.stringify(req.body))
    await sendFileToSlack({
      filedata: str,
      filetype: 'json',
      filename: 'request-body',
      timestamp
    })
  } catch (err) {
    console.error(err)
  }

  try {
    const str = JSON.stringify(req.headers)
    await sendFileToSlack({
      filedata: str,
      filetype: 'json',
      filename: 'req-headers',
      timestamp
    })
  } catch (err) {
    console.error(err)
  }

  res.send('TEST OK!').status(200)
});

(async () => {
  const x_slack_request_timestamp = '123456789'
  const requestBody = 'payload=%7B%22type%22%3A%22message_action%22%2C%22token%22%3A%22nbUFnhq%7D%7D'
  const basestring = `v0:${x_slack_request_timestamp}:${requestBody}`

  const hmac = crypto.createHmac('sha256', signingSecret)
  const hashed = hmac.update(basestring).digest('hex')

  console.log("hmac: " + hashed)
})()
