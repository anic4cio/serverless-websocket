import { Request } from 'express'
import qs from 'qs'
import crypto from 'crypto'
// import bcrypt from 'bcrypt'

const signingSecret = process.env.SIGNING_SECRET!
const slackChannelId = process.env.SLACK_CHANNEL_ID!

export interface IAuthResponse {
  statusCode: number
  success: boolean
  message: string
}

export default (params: {
  req: Request
  channelId: string
}) => {
  const { req, channelId } = params

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

  const header = JSON.parse(JSON.stringify(req.headers))
  const requestSignature = header?.['x-slack-signature']
  const requestTimestamp = header?.['x-slack-request-timestamp']

  const authenticate = () => {
    if (header && requestSignature && requestTimestamp) {
      const hashedSignature = hashTheBody()
      if (compareAuthenticationTokens(requestSignature, hashedSignature)) {
        response['statusCode'] = 200
        response['success'] = true
        response['message'] = 'Signatures verified!'
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
  ) => bcrypt.compareSync(requestSignature, hashedSignature)

  authenticate()
  return response
}
