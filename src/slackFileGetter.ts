import axios from 'axios'
import PDF from 'pdf-parse'

const slackBotToken = process.env.SLACK_BOT_TOKEN!
const channelId = process.env.CHANNEL_ID!
const slackUser = process.env.SLACK_USER!

// interface ISlackResWithFile {
//   ok: boolean,
//   files: ISlackFileInfo[],
//   paging: {
//     count: number,
//     total: number,
//     page: number,
//     pages: number
//   }
// }

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
  types: 'pdfs' // file type
  user: string // slack user id
}

export const getTextOfLastFileFromSlack = async () => {
  const requestArgs = getArgsForFileRequest()
  const responseWithfiles = await getListOfSlackFiles(requestArgs)
  console.log(responseWithfiles)
  // return getTextFromSlackFile(responseWithfiles)
}

const getArgsForFileRequest = () => {
  const now = Date.now().toString()
  console.log(now)
  const reqParam: IListFilesRequestParams = {
    channel: channelId,
    count: 1,
    show_files_hidden_by_limit: true,
    ts_from: now,
    // ts_to: now,
    types: 'pdfs',
    user: slackUser
  }
  return reqParam
}

const getListOfSlackFiles = async (
  fileListParams: IListFilesRequestParams
): Promise<ISlackFileInfo[]> => {
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

const getTextFromSlackFile = async (slackFile: ISlackFileInfo[]) => {
  const slackFileBuffer = await getBufferFromDownloadURL(slackFile)
  return await getTextFromSlackPDFBuffer(slackFileBuffer)
}

const getBufferFromDownloadURL = async (slackFile: ISlackFileInfo[]) => {
  const response = await axios({
    method: 'GET',
    responseType: 'arraybuffer',
    baseURL: slackFile[0].url_private_download,
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  })
  return Buffer.from(response.data, 'utf-8')
}

const getTextFromSlackPDFBuffer = async (requestFileData: Buffer) => {
  return PDF(requestFileData) .then(data => data.text)
}
