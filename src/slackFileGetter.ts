import axios from 'axios'
import fs from 'fs'

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
  channel: string
  count: number
  show_files_hidden_by_limit: false
  ts_from: string // files created this time and after only
  types: 'pdfs'
  user: string
}

export interface MockSlackFile {
  files: {
    url_private_download: string,
    name: string,
  }[]
}

export const getFileFromSlack = async (slackFile: MockSlackFile) => {
  const writer = fs.createWriteStream(`./${slackFile.files[0].name}.pdf`)
  await axios({
    method: 'GET',
    responseType: 'stream',
    baseURL: slackFile.files[0].url_private_download,
    headers: {
      'Authorization': `Bearer ${slackBotToken}`
    }
  }).then(response => {
    return new Promise((resolve, reject) => {
      response.data.pipe(writer)
      let error: Error
      writer.on('error', err => {
        error = err
        writer.close()
        reject(err)
      })
      writer.on('close', () => {
        if (!error) {
          resolve(true)
        }
      })
    })
  })
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
