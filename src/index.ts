import {
  sendFileToSlack,
  sendOkToSlack,
} from "./slackHandler"
import { http, Request } from '@google-cloud/functions-framework'
import { Response } from 'express'
import crypto from 'crypto';
import qs from "qs"

http('start', async (req: Request, res: Response) => {
  res.sendStatus(200)
});
