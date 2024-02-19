import { IAcuityAppointment, getApptsFromAcuity } from './acuityApi'
import { http } from '@google-cloud/functions-framework'
import { Request, Response } from 'express'
import { sendOkToSlack, sendInfoPerJudgeToSlack } from './reportSender'

interface IJudgeStatistics {
  allValidLicenses: number
  internalWedding: number
  externalWedding: number
  substitutedWedding: number
  absentWedding: number
}

type AcuityDateType = `${number}${number}-${number}${number}-${number}${number}${number}${number}` // DD-MM-YYYY

interface IDateInterval {
  minDate: AcuityDateType
  maxDate: AcuityDateType
}

http('start', async (req: Request, res: Response) => {
  // const auth = authenticateRequest(req)
  const { ts }: { ts: string } = await sendOkToSlack(req, res)

  const dateInterval: IDateInterval = {
    minDate: '01-12-2020',
    maxDate: '31-12-2020'
  }
  const {
    cristinaStatistics,
    germanoStatistics,
    ninaStatistics
  } = await makeStatisticsForAllJudges({ dateInterval })

  // await Promise.all()

  res.sendStatus(200)
})

const makeStatisticsForAllJudges = async (params: {
  dateInterval: IDateInterval
}) => {
  const { dateInterval } = params
  const nina = /nina/gi
  const germano = /germano/gi
  const cristina = /cristina/gi
  const apptsFromAcuity = await getApptsFromAcuity({
    minDate: dateInterval.minDate,
    maxDate: dateInterval.maxDate
  })
  const cristinaStatistics = makeStatistics({
    judgeRegex: cristina,
    apptsFromAcuity
  })
  const germanoStatistics = makeStatistics({
    judgeRegex: germano,
    apptsFromAcuity
  })
  const ninaStatistics = makeStatistics({
    judgeRegex: nina,
    apptsFromAcuity
  })
  return { cristinaStatistics, germanoStatistics, ninaStatistics }
}

const makeStatistics = (params: {
  judgeRegex: RegExp
  apptsFromAcuity: IAcuityAppointment[]
}) => {
  const { judgeRegex, apptsFromAcuity } = params
  const judgeAppts = filterApptsByJudge({
    apptsFromAcuity,
    judgeRegex
  })
  const statisticsPerJudge = makeStatisticsPerJudge({ judgeAppts })
  const judgeName = judgeAppts[0].calendar
  const filename = makeTittleBasedOnJudge({ judgeName })
  const statisticsMsg = makeStatisticsMessage({ statisticsPerJudge, judgeName })
  return {
    statisticsMsg,
    judgeAppts,
    filename
  }
}

const filterApptsByJudge = (params: {
  apptsFromAcuity: IAcuityAppointment[]
  judgeRegex: RegExp
}) => {
  const { apptsFromAcuity, judgeRegex } = params
  return apptsFromAcuity.filter(appt =>
    appt.calendar.match(judgeRegex)
  )
}

const filterMarkedValidAppts = (params: {
  judgeAppts: IAcuityAppointment[]
}) => {
  const { judgeAppts } = params
  return judgeAppts.filter(appt =>
    appt.firstName.match(/A-/g)
  )
}

const catchSubstitutedAppts = (params: {
  validJudgeAppts: IAcuityAppointment[]
}) => {
  const { validJudgeAppts } = params
  return validJudgeAppts.filter(appt =>
    appt.firstName
      .match(/\([A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]+\)\s+A-/g)
  )
}

const filterByInvalidAppts = (params: {
  judgeAppts: IAcuityAppointment[]
}) => {
  const { judgeAppts } = params
  return judgeAppts.filter(appt =>
    appt.firstName.match(/I-/g)
  )
}

const filterByExternal = (params: {
  validJudgeAppts: IAcuityAppointment[]
}) => {
  const { validJudgeAppts } = params
  return validJudgeAppts.filter(appt =>
    appt.type.match(/casamento\s+externo/gi)
  )
}

const filterByInternal = (params: {
  validJudgeAppts: IAcuityAppointment[]
}) => {
  const { validJudgeAppts } = params
  return validJudgeAppts.filter(appt =>
    appt.type
      .match(/casamento\s+interno/gi)
  )
}

const makeStatisticsPerJudge = (params: {
  judgeAppts: IAcuityAppointment[]
}): IJudgeStatistics => {
  const { judgeAppts } = params
  const validJudgeAppts = filterMarkedValidAppts({ judgeAppts })
  const internal = filterByInternal({ validJudgeAppts })
  const external = filterByExternal({ validJudgeAppts })
  const absent = filterByInvalidAppts({ judgeAppts })
  const substituted = catchSubstitutedAppts({ validJudgeAppts })
  return {
    allValidLicenses: validJudgeAppts.length,
    internalWedding: internal.length,
    externalWedding: external.length,
    substitutedWedding: substituted.length,
    absentWedding: absent.length
  }
}

const makeStatisticsMessage = (params: {
  statisticsPerJudge: IJudgeStatistics,
  judgeName: string
}) => {
  const { statisticsPerJudge, judgeName } = params
  const allValidLicenses = statisticsPerJudge.allValidLicenses
  const internalQty = statisticsPerJudge.internalWedding
  const externalQty = statisticsPerJudge.externalWedding
  const substitutedQty = statisticsPerJudge.substitutedWedding
  const absentQty = statisticsPerJudge.absentWedding
  return `*${statisticsPerJudge}*
> Total de habilitações válidas: *${allValidLicenses}*
> Casamentos internos: *${internalQty}*
> Casamentos externos: *${externalQty}*
> Casamentos substituidos: *${substitutedQty}*
> Inexistentes: *${absentQty}*`
}

const makeTittleBasedOnJudge = (params: { judgeName: string }) => {
  const { judgeName } = params
  const sanitizedName = judgeName.replaceAll(/\s+/, '-')
  const date = new Date()
  return `${date}-${today()}`
}

const today = () => {
  const date =  new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  })
  return date.split(/[,\s+]/)[0].replaceAll('/', '-')
}
