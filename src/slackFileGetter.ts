import axios from 'axios'
import PDF from 'pdf-parse'

const slackBotToken = process.env.SLACK_BOT_TOKEN!

interface ISlackFile {
  ok: boolean,
  files: SlackFileParams[],
  paging: {
    count: number,
    total: number,
    page: number,
    pages: number
  }
}

interface SlackFileParams {
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
  channels: string[],
  groups: [],
  ims: [],
  comments_count: 0
}

export interface ISlackFileListParams {
  channel: string // slack channel id
  count: number // quantity of items to return
  show_files_hidden_by_limit: boolean // show old files
  ts_from: string // only files created this time and after
  types: 'pdfs' // file type
  user: string // slack user id
}

export interface IRequestFile {
  files: {
    url_private_download: string,
    name: string,
  }[]
}

export const getTextFromSlackFile = async (slackFile: IRequestFile) => {
  const slackFileBuffer = await getFileFromSlack(slackFile)
  return await getTextFromSlackPDFBuffer(slackFileBuffer)
}

const getFileFromSlack = async (slackFile: IRequestFile) => {
  const response = await axios({
    method: 'GET',
    responseType: 'arraybuffer',
    baseURL: slackFile.files[0].url_private_download,
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  })
  return Buffer.from(response.data, 'utf-8')
}

const getTextFromSlackPDFBuffer = async (requestFileData: Buffer) => {
  return PDF(requestFileData) .then(data => data.text)
}

export const getListOfSlackFiles = async (
  fileListParams: ISlackFileListParams
): Promise<SlackFileParams[]> => {
  const response = await axios({
    method: 'GET',
    baseURL: 'https://slack.com/api/files.list',
    params: fileListParams,
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  })
  return response.data.files
}
