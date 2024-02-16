import { initializeApp, cert } from 'firebase-admin/app'
import { initializeFirestore } from 'firebase-admin/firestore'

const serviceAccount = require('../firebase-credential.json')

const getDatabase = () => {
  const firestoreDb = initializeFirestore(app, { preferRest: true })
  return firestoreDb.collection(firestoreCollection)
}

const checkDocumentExistence = async (document: string) => {
  const database = getDatabase()
  const docRef = await database.doc(document).get()
  return docRef.exists
}

const app = initializeApp({
  credential: cert(serviceAccount)
})

export interface IStoredTokens {
  accessToken: string
  refreshToken: string
  authorizationCode?: string
  expiresIn: number
}

const firestoreCollection = 'ca-tokens-database'
const firestoreDocument = 'ca-tokens'

const tokensDocRef = initializeFirestore(app, { preferRest: true })
  .collection(firestoreCollection)
  .doc(firestoreDocument)

const getAuthData = async () => {
  const documentFields = await tokensDocRef.get()
  const accessToken = documentFields.get('accessToken')
  const refreshToken = documentFields.get('refreshToken')
  const authorizationCode = documentFields.get('authorizationCode')
  const expiresIn = documentFields.get('expiresIn')
  return {
    accessToken,
    refreshToken,
    authorizationCode,
    expiresIn
  }
}
