import axios from 'axios'
import { Request, Response } from 'express'
import { greetingTheUser } from './greetingBuilder'

const slackBotToken = process.env.SLACK_BOT_TOKEN
const slackChannelId = process.env.CHANNEL_ID

export const sendOkToSlack = async (req: Request, res: Response) => {
  const { user_id, command } = req.body
  const saluteToUser = greetingTheUser(user_id)
  res.sendStatus(200)
  const { data } = await axios({
    method: 'POST',
    baseURL: 'https://slack.com/api/chat.postMessage',
    params: {
      code: 200,
      channel: slackChannelId,
      text: `*${saluteToUser}* Em instantes você receberá as informações do comando *${command}*.`,
    },
    headers: {
      Authorization: `Bearer ${slackBotToken}`
    }
  })
  return data
}

export const sendInfoPerJudgeToSlack = async (params: {
  filedata: Buffer
  filename: string
  msg: string
  ts: string
}) => {
  const { filedata, filename, msg, ts } = params
  const blob = new Blob([filedata], { type: 'application/pdf' })
  const formData = new FormData()
  formData.append('channels', slackChannelId)
  formData.append('initial_comment', msg)
  formData.append('file', blob, `${filename}.json`)
  formData.append('filetype', 'json')
  formData.append('filename', filename)
  formData.append('thread_ts', ts)

  const res = await axios({
    method: 'POST',
    url: 'https://slack.com/api/files.upload',
    data: formData,
    headers: {
      Authorization: `Bearer ${slackBotToken}`,
    }
  })
  return res.data
}
