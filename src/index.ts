import { 
  getTextOfLastFileFromSlack
} from "./slackFileGetter"


;(async () => {
  const text = await getTextOfLastFileFromSlack()
  console.log(text)
})()

