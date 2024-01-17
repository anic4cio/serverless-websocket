import { 
  ISlackFileListParams,
  getTextFromSlackFile,
  getListOfSlackFiles,
  IRequestFile
} from "./slackFileGetter"

const channelId = process.env.CHANNEL_ID!
const slackUser = process.env.SLACK_USER!

;(async () => {
  const now = new Date().getTime().toString()
  const reqArgs: ISlackFileListParams = {
    channel: channelId,
    count: 1,
    show_files_hidden_by_limit: false,
    ts_from: now,
    types: 'pdfs',
    user: slackUser
  }

  const response = await getListOfSlackFiles(reqArgs)
  const filename = response[0].name
  const downloadFileUrl = response[0].url_private_download

  const slackFile: IRequestFile = {
    files: [{
      url_private_download: downloadFileUrl,
      name: filename,
    }]
  }

  const text = await getTextFromSlackFile(slackFile)
  console.log(text)
})()

