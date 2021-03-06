import * as firebase from "@firebase/testing";
import * as fs from "fs";

import {User, dummyUser} from "./models/users";
import {Rock, dummyRock} from "./models/rocks";

type Auth = {
  uid?: string,
  [key: string]: any
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
      const uid = randomId
      await adminApp.collection(userCollectionId).doc(uid).set(dummyUser(uid))

      await firebase.assertSucceeds(
        authedApp().collection(userCollectionId).doc(uid).get()
      )
    })
  })

  describe('create', () => {
    it('can not create user document without auth', async () => {
      const uid = randomId
      await firebase.assertFails(
        authedApp().collection(userCollectionId).doc(uid).set(dummyUser(uid)) // no auth
      )
    })

    it('can not create user document with another uid', async () => {
      await firebase.assertFails(
        authedApp({ uid: 'mogu' }).collection(userCollectionId).doc('jiro').set(dummyUser('mogu')) // no auth
      )
    })

    it('can create user document wit auth', async () => {
      const uid = randomId
      await firebase.assertSucceeds(
        authedApp({ uid: uid }).collection(userCollectionId).doc(uid).set(dummyUser(uid)) // no auth
      )
    })
  })

  describe('update', () => {
    it('can not update user document without auth', async () => {
      await adminApp.collection(userCollectionId).doc('taro').set(dummyUser('taro'))

      const unAuthedApp = authedApp()
      const userReference = unAuthedApp.collection(userCollectionId).doc('taro')

      await firebase.assertFails(
        userReference.update({ 'name': 'aaaaaaaaaa' }) // no auth
      )
    })

    it('can not update another user document ', async () => {
      await adminApp.collection(userCollectionId).doc('taro').set(dummyUser('taro'))

      const unAuthedApp = authedApp({ uid: 'jiro'})
      const userReference = unAuthedApp.collection(userCollectionId).doc('jiro')

      await firebase.assertFails(
        userReference.update({ 'name': 'aaaaaaaaaa' }) // no auth
      )
    })

    it('can update user document wit auth', async () => {
      const userId = randomId
      const userReference = authedApp({ uid: userId }).collection(userCollectionId).doc(userId)
      await userReference.set(dummyUser(userId))
      await firebase.assertSucceeds(
        userReference.update({ 'name': 'aaaaaaaaaa' })
      )
    })
  })

  describe('delete', () => {
    it('can not delete user document ', async () => {
      const userId = 'taro'
      await adminApp.collection(userCollectionId).doc(userId).set(dummyUser(userId))

      const userReference = authedApp({ uid: userId }).collection(userCollectionId).doc(userId)
      await firebase.assertFails(
        userReference.delete()
      )
    })

    it('can not delete another user document ', async () => {
      const userId = 'taro'
      await adminApp.collection(userCollectionId).doc(userId).set(dummyUser(userId))

      const userReference = authedApp({ uid: 'jiro' }).collection(userCollectionId).doc(userId)
      await firebase.assertFails(
        userReference.delete()
      )
    })
  })
})

describe('/users/{userId}/rocks', () => {
  describe('read', () => {
    it('can read rock document without auth', async () => {
      const parentId = randomId
      const documentId = randomId
      await adminApp
      .collection(userCollectionId).doc(parentId)
      .collection(rockCollectionId).doc(documentId)
      .set(dummyRock(documentId))

      await firebase.assertSucceeds( 
        authedApp()
        .collection(userCollectionId).doc(parentId)
        .collection(rockCollectionId).doc(documentId)
        .get()
      )
    })
  })


  describe('create', () => {
    it('can not create rock document without auth', async () => {
      const uid = randomId
      await firebase.assertFails(
        authedApp()
        .collection(userCollectionId).doc(uid)
        .collection(rockCollectionId).doc(uid)
        .set(dummyRock(uid)) // no auth
      )
    })

    it('can not create rock document with another uid', async () => {
      await firebase.assertFails(
        authedApp({ uid: 'mogu' }).collection(userCollectionId).doc('jiro').set(dummyUser('mogu')) // no auth
      )
    })

    it('can create user document wit auth', async () => {
      const uid = randomId
      await firebase.assertSucceeds(
        authedApp({ uid: uid }).collection(userCollectionId).doc(uid).set(dummyUser(uid)) // no auth
      )
    })
  })

})
