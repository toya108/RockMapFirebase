import * as firebase from "@firebase/testing";
import * as fs from "fs";

type Auth = {
  uid?: string,
  [key: string]: any
}

type SocialLink = {
  linkType: string
  link:     string
}

type User = {
  id:           string
  createdAt:    Date
  updatedAt:    Date
  parentPath:   string
  name:         string
  photoURL:     string
  socialLinks:  SocialLink[]
  introduction: string
  headerUrl?:    string
  deleted:      Boolean
  isRoot:       Boolean   
}

type GeoPoint = {
  latitude:  number
  longitude: number 
}

type Rock = {
  id:             string
  createdAt:      Date
  updatedAt?:     Date
  parentPath:     string
  name:           string
  address:        string
  prefecture:     string
  location:       GeoPoint
  seasons:        string[]
  lithology:      string
  desc:           string
  registedUserId: string
  headerUrl?:     string
  imageUrls:      string[]
}

const projectId = "rockmap-70133"
const databaseName = 'RockMap-debug'
const rules = fs.readFileSync('./firestore.rules', 'utf8')

const authedApp = (auth?: Auth) => firebase.initializeTestApp({ projectId: projectId, databaseName, auth }).firestore()
const adminApp = firebase.initializeAdminApp({ projectId: projectId, databaseName }).firestore()

const userCollectionId = 'users'
const rockCollectionId = 'rocks'
const courseCollectionId = 'courses'

const today = new Date()
const randomId = Math.random().toString(32).substring(2)

// ルールファイルの読み込み
beforeAll(async () => {
  await firebase.loadFirestoreRules({
    projectId: projectId,
    rules: rules
  })
})

// Firestoreデータのクリーンアップ
afterEach(async () => {
  await firebase.clearFirestoreData({ projectId: projectId });
});

// Firestoreアプリの削除
afterAll(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

describe('/users', () => {
  describe('read', () => {
    it('can read user document without auth', async () => {
      const userId = randomId
      await configureUserTestData(adminApp, userId)

      await makeUserReference(authedApp(), userId).get()
    })
  })
})

describe('/users/{userId}/rocks', () => {
  describe('read', () => {
    it('can read rock document without auth', async () => {
      const parentId = randomId
      const documentId = randomId
      await configureRockTestData(adminApp, documentId, parentId)

      await makeRockReference(authedApp(), documentId, parentId).get()
    })
  })
})

function makeUserReference(
  db: firebase.firestore.Firestore,
  documentId: string
): firebase.firestore.DocumentReference {
  return db.collection(userCollectionId).doc(documentId)
}

function makeRockReference(
  db: firebase.firestore.Firestore,
  documentId: string,
  parentUserId: string
): firebase.firestore.DocumentReference {
  return makeUserReference(db, parentUserId).collection(rockCollectionId).doc(documentId)
}

function configureUserTestData(
  db: firebase.firestore.Firestore,
  documentId: string
) {
  return makeUserReference(db, documentId).set(dummyUser())
}

function configureRockTestData(
  db: firebase.firestore.Firestore,
  documentId: string,
  parentUserId: string
) {
  const rockReference = makeRockReference(db, documentId, parentUserId)
  return rockReference.set(dummyRock())
}

function dummyUser(): User {
  return {
    id:           randomId,
    createdAt:    today,
    updatedAt:    today,
    parentPath:   '',
    name:         'testUser',
    photoURL:     'https://javascript.info/url',
    socialLinks:  [
      {
        linkType: 'twitter',
        link: 'aaaa'
      },
      {
        linkType: 'facebook',
        link: 'bbbb'
      },
    ],
    introduction: 'これはプロフィールです。',
    headerUrl:    'https://javascript.info/url',
    deleted:      false,
    isRoot:       true 
  }
}

function dummyRock(): Rock {
  return {
    id:             randomId,
    createdAt:      today,
    updatedAt:     today,
    parentPath:     '',
    name:           '日陰岩',
    address:        '東京都千代田区丸の内一丁目',
    prefecture:     '東京都',
    location:       {
      latitude:  35.681872,
      longitude: 139.765847 
    },
    seasons:        ['summer'],
    lithology:      'granite',
    desc:           'aaaaaaaaaaaaaaaaaaaa',
    registedUserId: 'other',
    headerUrl:     'https://javascript.info/url',
    imageUrls:      ['https://javascript.info/url']
  }
}

