import { AxiosInstance } from 'axios'
import { Request } from 'express'

const channelId = process.env.CHANNEL_ID!
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET!

export interface ISlackHandler {
  validateSlashCommand: (
    req: Request,
    words: string[]
  ) => Promise<ISlackValidationReturn>
  sendMsg: (message: string) => Promise<void>
  sendMsgsInThread: (
    channelId: string,
    firstMsg: string,
    msgs: string[]
  ) => Promise<void>
}

interface ISlackValidationReturn {
  code: number
  next: boolean
  json?: {
    response_type: string
    blocks: {
      type: string
      text: {
        type: string
        text: string
      }
    }[]
  }
}

export default class SlackHandler implements ISlackHandler {
  private readonly slackBotToken = process.env.SLACK_BOT_TOKEN!

  constructor(private readonly axios: AxiosInstance) { }

  validateSlashCommand = async (
    req: Request
  ): Promise<ISlackValidationReturn> => {
    const authentic = await this.verifyAuthOfSlackRequest(req)
    if (authentic.next) {
      return {
        code: 200,
        next: true,
        json: {
          response_type: 'in_channel',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Processando...*.',
              },
            },
          ],
        },
      }
    } else return authentic
  }

  private readonly verifyAuthOfSlackRequest = async (
    req: Request
  ): Promise<ISlackValidationReturn> => {
    const slackSignature = req.headers['x-slack-signature']
    const timestamp = req.headers['x-slack-request-timestamp']
    if (typeof slackSignature !== 'string' || typeof timestamp !== 'string') {
      return {
        code: 400,
        next: false,
      }
    }
    const qs = await import('qs')
    const requestBody = qs.stringify(req.body, { format: 'RFC1738' })
    const time = Math.floor(new Date().getTime() / 1000)
    if (Math.abs(time - Number(timestamp)) > 300) {
      return {
        code: 400,
        next: false,
      }
    }
    const sigBasestring = 'v0:' + timestamp + ':' + requestBody
    const crypto = await import('crypto')
    const mySignature =
      'v0=' +
      crypto
        .createHmac('sha256', slackSigningSecret)
        .update(sigBasestring, 'utf8')
        .digest('hex')
    const authentic = crypto.timingSafeEqual(
      Buffer.from(mySignature, 'utf8'),
      Buffer.from(slackSignature, 'utf8')
    )
    if (authentic) return { code: 200, next: true }
    return { code: 400, next: false }
  }

  sendMsg = async (message: string) => {
    const payload = {
      channel: channelId,
      text: message,
    }
    const response = await this.sendOneMsg(payload)
    if (response.data.ok) console.info('Message sent successfully to slack')
    else throw new Error(response.data.error)
  }

  private sendOneMsg = async (payload: {
    channel: string
    text: string
    thread_ts?: string
  }) => {
    return await this.axios.post(
      'https://slack.com/api/chat.postMessage',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.slackBotToken}`,
        },
      }
    )
  }

  private getFilesFromSlack = async () => {
    throw new Error('Function not implemented!') 
  }

  sendMsgsInThread = async (
    channelId: string,
    firstMsg: string,
    msgs: string[]
  ) => {
    const payload = { channel: channelId, text: firstMsg }
    let response = await this.sendOneMsg(payload)
    if (!response.data.ok) throw new Error(response.data.error)
    const threadTs = response.data.ts
    for (const msg of msgs) {
      const payload = {
        channel: channelId,
        text: msg,
        thread_ts: threadTs,
      }
      response = await this.sendOneMsg(payload)
      if (!response.data.ok) throw new Error(response.data.error)
    }
  }
}
