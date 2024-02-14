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

const getApptsByJudge = (params: {
  apptsFromFile: IAcuityAppts[]
  judgeRegex: RegExp
}) => {
  const { apptsFromFile, judgeRegex } = params
  return apptsFromFile.filter(appt =>
    appt['Calendar'].match(judgeRegex)
  )
}

const getMarkedValidAppts = (params: {
  judgeAppts: IAcuityAppts[]
}) => {
  const { judgeAppts } = params
  return judgeAppts.filter(appt =>
    appt['First Name'].match(/A-/g)
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

const filterByExternals = (params: {
  validApptsByJudge: IAcuityAppts[]
}) => {
  const { validApptsByJudge } = params
  return validApptsByJudge.filter(appt =>
    appt['Type'].match(/casamento\s+externo/gi)
  )
}

const regexNina = /Nina/gi
const regexGermano = /Germano/gi
const regexCristina = /Cristina/gi


const filepath = './schedule2024-02-07.csv';
(async () => {
  const apptsArray: IAcuityAppts[] = await csv().fromFile(filepath)

  const apptByJudge = getApptsByJudge({
    apptsFromFile: apptsArray,
    judgeRegex: regexNina
  })
  console.log(apptByJudge.length)

  const validApptsByJudge = getMarkedValidAppts({ judgeAppts: apptByJudge })
  console.log(validApptsByJudge.length)

  const invalid = getInvalidAppts({ judgeAppts: apptByJudge })
  console.log(invalid.length)

  const externs = filterByExternals({ validApptsByJudge: apptByJudge })
  console.log(externs.length)

})()

// judge    | total appts | valid appts | invalid | externals
// germano  |     66      |     66      |    0    |    1
// cristina |     185     |     182     |    2    |    9
// nina     |     183     |     181     |    2    |    1
