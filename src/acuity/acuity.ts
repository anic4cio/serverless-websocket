import csv from 'csvtojson'

interface IAcuityAppts {
  "Start Time": string,
  "End Time": string,
  "First Name": string,
  "Last Name": string,
  "Phone": string,
  "Email": string,
  "Type": string,
  "Calendar": string,
  "Appointment Price": string,
  "Paid?": string,
  "Amount Paid Online": string,
  "Certificate": string,
  "Notes": string,
  "Date Scheduled": string,
  "Label": string,
  "Scheduled By": string,
  "Date Rescheduled": string,
  "Appointment ID": string
}

interface IJudgeApptsInfo {
  internal: number
  external: number
  substituted: number
  absent: number
}

const getApptsByJudge = (params: {
  apptsFromFile: IAcuityAppts[]
  judgeRegex: RegExp
}) => {
  const { apptsFromFile, judgeRegex } = params
  return apptsFromFile.filter(appt =>
    appt['Calendar'].match(judgeRegex)
  )
}

// only appts with "A-" but WITHOUT (substituition)
const getMarkedValidAppts = (params: {
  judgeAppts: IAcuityAppts[]
}) => {
  const { judgeAppts } = params
  return judgeAppts.filter(appt =>
    appt['First Name'].match(/A-/g)
  )
}

const catchSubstitutedAppts = (params: {
  validJudgeAppts: IAcuityAppts[]
}) => {
  const { validJudgeAppts } = params
  return validJudgeAppts.filter(appt =>
    appt['First Name']
      .match(/\([A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+\)\s+A-/g)
  )
}

const getInvalidAppts = (params: {
  judgeAppts: IAcuityAppts[]
}) => {
  const { judgeAppts } = params
  return judgeAppts.filter(appt =>
    appt['First Name'].match(/I-/g)
  )
}

const filterByExternal = (params: {
  validApptsByJudge: IAcuityAppts[]
}) => {
  const { validApptsByJudge } = params
  return validApptsByJudge.filter(appt =>
    appt['Type'].match(/casamento\s+externo/gi)
  )
}

const filterByInternal = (params: {
  validApptsByJudge: IAcuityAppts[]
}) => {
  const { validApptsByJudge } = params
  return validApptsByJudge.filter(appt =>
    appt['Type'].match(/casamento\s+interno/gi)
  )
}

const getApptsInfoPerJudge = (params: {
  judgeAppts: IAcuityAppts[]
}): IJudgeApptsInfo => {
  const { judgeAppts } = params
  const validJudgeAppts = getMarkedValidAppts({ judgeAppts })
  const internal = filterByInternal({ validApptsByJudge: validJudgeAppts })
  const external = filterByExternal({ validApptsByJudge: validJudgeAppts })
  const absent = getInvalidAppts({ judgeAppts: judgeAppts })
  const substituted = catchSubstitutedAppts({ validJudgeAppts: validJudgeAppts })
  return {
    internal: internal.length,
    external: external.length,
    substituted: substituted.length,
    absent: absent.length
  }
}


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


  (async () => {
    const regexNina = /Nina/gi
    const regexGermano = /Germano/gi
    const regexCristina = /Cristina/gi
    const filepath = './schedule2024-02-07.csv'

    const apptsFromFile: IAcuityAppts[] = await csv().fromFile(filepath)

    const judgeAppts = getApptsByJudge({ apptsFromFile, judgeRegex: regexGermano })

    const info = getApptsInfoPerJudge({ judgeAppts })
    console.log(info)
  })()

// germano: { internal: 65, external: 1, absent: 0 }

// cristina: { internal: 173, external: 9, absent: 2 }

// nina: { internal: 180, external: 1, absent: 2 }
