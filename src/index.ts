import {
  sendMessageToSlack,
  sendJSONToSlack,
  getTextFromSlackFile
} from "./slackFileGetter"
import { http } from '@google-cloud/functions-framework'
import { Request, Response } from 'express'

interface ISlackRequest {
  message_ts: string
  message: IMessage
  user: IUser
}

interface IMessage {
  text: string
  file: {
    filetype: string
    url_private_download: string
  }[]
}

interface IUser {
  id: string
  username: string
  name: string
}

http('start', async (req: Request, res: Response) => {
  const payload = req.body.payload
  
  try {
    console.log(payload)
  } catch (error) {
    console.error(error)
  }

  try {
    console.log(payload.action_ts)
  } catch (error) {
    console.error(error)
  }

  try {
    console.log(payload.message)
  } catch (error) {
    console.error(error)
  }

  try {
    console.log(payload.message_ts)
  } catch (error) {
    console.error(error)
  }

  res.send('OK!')
})
