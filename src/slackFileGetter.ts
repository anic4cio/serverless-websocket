import axios from 'axios'
import PDF from 'pdf-parse'

const slackBotToken = process.env.SLACK_BOT_TOKEN!
const channelId = process.env.CHANNEL_ID!
const slackUser = process.env.USER_ID!

interface ISlackFileInfo {
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
  channels: string[],
  groups: [],
  ims: [],
  comments_count: 0
}

interface IListFilesRequestParams {
  channel: string // slack channel id
  count: number // quantity of items to return
  show_files_hidden_by_limit: boolean // show old files
  ts_from?: string // only files created this time and after
  ts_to?: string
  types: 'pdf' // file type
  user: string // slack user id
}

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
  filedata: Buffer
  filename: string
}) => {
  const { filedata, filename } = params
  const res = await axios({
    method: 'POST',
    baseURL: 'https://slack.com/api/files.upload',
    params: {
      channels: channelId,
      content: filedata,
      filetype: 'json',
      title: filename
    },
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  })
  return res.data
}

export const sendMessageToSlack = async (params: {
  msg: string
  ts: string
}) => {
  const { msg, ts } = params
  const res = await axios({
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
  return res.data
}

export const sendJSONToSlack = async (json: Object) => {
  const res = await axios({
    method: 'POST',
    baseURL: 'https://slack.com/api/chat.postMessage',
    params: {
      blocks: json,
    },
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  })
  return res.data
}
