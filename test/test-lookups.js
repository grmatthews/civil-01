import assert from 'assert'
import { 
    getFirestore, 
    myAuth, 
    createLookupAsAdmin,
    theirAuth,
    noAccountAuth,
    adminAuth,
    getLookupRec,
    ts,
} from './test-utils.js'

import firebase, { assertSucceeds } from '@firebase/testing'


const COLLECTION = 'lookups'

describe('lookups', () => {

    describe('create', () => {

        it('can create in own account', async () => {

            const db = getFirestore(myAuth)
            const testDoc = db.collection(COLLECTION).doc('L.01')
            const lookupRec = getLookupRec(myAuth.account_id, 'general')
            await firebase.assertSucceeds(testDoc.set(lookupRec))
        })

        it('cannot create in other account', async () => {

            const db = getFirestore(myAuth)
            const testDoc = db.collection(COLLECTION).doc('L.01')
            const rec = getLookupRec(theirAuth.account_id, 'general')
            await firebase.assertFails(testDoc.set(rec))
        })

        it('cannot read if no account claim', async () => {

            await createLookupAsAdmin('L.01', myAuth, 'general')
            
            const db = getFirestore(noAccountAuth)
            const testDoc = db.collection(COLLECTION).doc('L.01')
            await firebase.assertFails(testDoc.get())
        })

        it('must specify account id', async () => {

            const rec = getLookupRec('X-ACCT ID', 'general')
            delete rec.account_id

            const db = getFirestore(myAuth)
            const testDoc = db.collection(COLLECTION).doc('L.01')
            await firebase.assertFails(testDoc.set(rec))
        })

    })

    describe('read', () => {

        it('can read own account', async () => {
            
            await createLookupAsAdmin('L.01', myAuth.account_id, 'general')
            
            const db = getFirestore(myAuth)
            const testDoc = db.collection(COLLECTION).doc('L.01')
            await firebase.assertSucceeds(testDoc.get())
            
        })
        
        it('cannot read other accounts', async () => {
            
            await createLookupAsAdmin('L.01', theirAuth.account_id, 'general')
            
            const db = getFirestore(myAuth)
            const testDoc = db.collection(COLLECTION).doc('L.01')
            await firebase.assertFails(testDoc.get())
        })

    })

    describe('delete', () => {

        it('can delete in own account if admin', async () => {

            await createLookupAsAdmin('L.01', myAuth.account_id, 'general')
            const db = getFirestore(adminAuth)
            const testDoc = db.collection(COLLECTION).doc('L.01')
        
            await firebase.assertSucceeds(testDoc.delete())

        })

        it('cannot delete in own account if not admin', async () => {

            await createLookupAsAdmin('L.01', myAuth.account_id, 'general')
            const db = getFirestore(myAuth)
            const testDoc = db.collection(COLLECTION).doc('L.01')
        
            await firebase.assertFails(testDoc.delete())

        })

        it('cannot delete in other account', async () => {

            await createLookupAsAdmin('L.01', theirAuth.account_id, 'general')

            const db = getFirestore(myAuth)
            const testDoc = db.collection(COLLECTION).doc('L.01')
          
            await firebase.assertFails(testDoc.delete())

        })
    })

})

export default describe
