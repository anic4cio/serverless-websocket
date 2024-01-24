import { Request } from 'express'
import qs from 'qs'
import crypto from 'crypto'

const signingSecret = process.env.SLACK_SIGNING_SECRET!
const slackChannelId = process.env.CHANNEL_ID!

export interface IAuthResponse {
  statusCode: number
  success: boolean
  message: string
}

export const authenticateRequest = (params: {
  channelId: string
  req: Request
}) => {
  const { channelId, req } = params
  if (channelId !== slackChannelId) {
    return {
      statusCode: 403,
      success: false,
      message: 'Channel not allowed',
    }
  }

  const response: IAuthResponse = {
    statusCode: 200,
    success: true,
    message: 'success',
  }

  const headersJson = JSON.parse(JSON.stringify(req.headers))
  const requestSignature = headersJson['x-slack-signature']
  const requestTimestamp = headersJson['x-slack-request-timestamp']

  const authenticate = () => {
    if (requestSignature && requestTimestamp && signingSecret) {
      const hashedSignature = hashTheBody()
      if (compareAuthenticationTokens(requestSignature, hashedSignature)) {
        response['statusCode'] = 200
        response['success'] = true
        response['message'] = 'Signature verified!'
      } else {
        response['statusCode'] = 401
        response['success'] = false
        response['message'] = 'Unauthorized'
      }
    } else {
      response['statusCode'] = 401
      response['success'] = false
      response['message'] = 'Lack of tokens'
    }
  }

  const hashTheBody = () => {
    const requestBody = qs.stringify(req.body, { format: 'RFC1738' })
    const basestring = `v0:${requestTimestamp}:${requestBody}`
    const hmac = crypto.createHmac('sha256', signingSecret)
    return hmac.update(basestring).digest('hex')
  }

  const compareAuthenticationTokens = (
    requestSignature: string,
    hashedSignature: string
  ) => {
    const auth = requestSignature.includes(hashedSignature)
    console.log(`Comparing authentication tokens... ${auth}`)
    return auth
  }

  authenticate()
  return response
}
