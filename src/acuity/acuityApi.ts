import axios from 'axios'

const acuityAuth = process.env.ACUITY_TOKEN

export interface IAcuityAppointment {
  id: number
  firstName: string
  lastName: string
  email: string
  date: string
  type: string
  calendar: string
  notes: string
}

export const getApptsFromAcuity = async (params: {
  minDate: string
  maxDate: string
}): Promise<IAcuityAppointment[]> => {
  const { minDate, maxDate } = params
  const res = await axios({
    method: 'GET',
    baseURL: `https://acuityscheduling.com/api/v1/appointments?max=999&minDate=${minDate}&maxDate=${maxDate}&canceled=false&excludeForms=true&direction=DESC`,
    headers: {
      accept: 'application/json',
      authorization: `Basic ${acuityAuth}`,
    }
  })
  return res.data 
}
