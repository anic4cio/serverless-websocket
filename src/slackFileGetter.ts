import axios from 'axios'
import PDF from 'pdf-parse'

const slackBotToken = process.env.SLACK_BOT_TOKEN!
const channelId = process.env.CHANNEL_ID!

export interface ISlackFileInfo {
  id: string,
  created: number,
  timestamp: number,
  name: string,
  title: string,
  mimetype: string,
  filetype: string,
  pretty_type: string,
  user: string,
  user_team: string,
  editable: boolean,
  size: number,
  mode: string,
  is_external: boolean,
  external_type: string,
  is_public: boolean,
  public_url_shared: boolean,
  display_as_bot: boolean,
  username: string,
  url_private: string,
  url_private_download: string,
  media_display_type: string,
  thumb_pdf: string,
  thumb_pdf_w: number,
  thumb_pdf_h: number,
  permalink: string,
  permalink_public: string,
  channels?: string[],
  groups?: [],
  ims?: [],
  comments_count?: 0
  is_starred?: boolean,
  has_rich_preview?: boolean,
  file_access?: string
}

type SlackFileType = string | Buffer | ArrayBufferLike | ArrayLike<object> | Array<unknown>

export const getTextFromSlackFile = async (slackFileURL: string) => {
  const slackFileBuffer = await getBufferFromDownloadURL(slackFileURL)
  return await getTextFromSlackPDFBuffer(slackFileBuffer)
}

const getBufferFromDownloadURL = async (slackFileURL: string) => {
  const response = await axios({
    method: 'GET',
    responseType: 'arraybuffer',
    baseURL: slackFileURL,
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  })
  return Buffer.from(response.data, 'utf-8')
}

const getTextFromSlackPDFBuffer = async (requestFileData: Buffer) => {
  return PDF(requestFileData).then(data => data.text)
}

export const sendFileToSlack = async (params: {
  filedata: SlackFileType
  filename: string
  filetype: string
  timestamp?: string
}) => {
  const { filedata, filename, filetype, timestamp } = params
  await axios({
    method: 'POST',
    baseURL: 'https://slack.com/api/files.upload',
    params: {
      channels: channelId,
      thread_ts: timestamp,
      content: filedata,
      filetype,
      title: filename
    },
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  })
}

export const sendMessageToSlack = async (params: {
  msg: string
  ts: string
}) => {
  const { msg, ts } = params
  await axios({
    method: 'POST',
    baseURL: 'https://slack.com/api/chat.postMessage',
    params: {
      text: msg,
      thread_ts: ts
    },
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  })
}

export const sendOkToSlack = async (ts?: string) => {
  await axios({
    method: 'POST',
    baseURL: 'https://slack.com/api/chat.postMessage',
    params: {
      code: 200,
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
    },
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  })
}
