import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, initializeFirestore } from 'firebase-admin/firestore'

const serviceAccount = require('../firestore-local-credentials.json')

const app = initializeApp({
  credential: cert(serviceAccount)
})

const firestoreCollection = 'new-collection'

// const getDatabase = () => {
//   const firestoreDb = getFirestore()
//   const firestoreCollection = 'new-collection'
//   return firestoreDb.collection(firestoreCollection)
// }

const getDatabase = () => {
  const firestoreDb = initializeFirestore(app, { preferRest: true })
  return firestoreDb.collection(firestoreCollection)
}

const checkDocumentExistence = async (document: string) => {
  const database = getDatabase()
  const docRef = await database.doc(document).get()
  return docRef.exists
}

const firestoreDocument = 'doc132';

(async () => {
  const snapshot = await checkDocumentExistence('any')
  console.log(snapshot)
})()
