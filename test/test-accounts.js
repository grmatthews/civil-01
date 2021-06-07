import assert from 'assert'
import { 
    getFirestore, 
    getAdminFirestore, 
    myAuth, 
    createAccount, 
    theirAuth, 
    systemAuth,
    noAccountAuth, 
    MY_PROJECT_ID, 
    getAccountRec
} from './test-utils.js'

import firebase from '@firebase/testing'
import fs from 'fs'
import  { doesNotMatch } from 'assert'




describe('accounts', () => {

    describe('read', () => {

        it('can only read your own account', async () => {
            
            const ACCOUNT_ID = 'ACC.001'
            await createAccount(ACCOUNT_ID)
            
            const db = getFirestore(myAuth)
            const testDoc = db.collection('accounts').doc(ACCOUNT_ID)
            await firebase.assertSucceeds(testDoc.get())
            
        })
        
        it('cannot read other accounts', async () => {
            
            await createAccount(theirAuth.account_id)
            
            const db = getFirestore(myAuth)
            const testDoc = db.collection('accounts').doc(theirAuth.account_id)
            await firebase.assertFails(testDoc.get())
        })

        it('system can read other accounts', async () => {
            
            const ACCOUNT_ID = 'ACC.001'
            await createAccount(ACCOUNT_ID)
            
            const db = getFirestore(systemAuth)
            const testDoc = db.collection('accounts').doc(ACCOUNT_ID)
            await firebase.assertSucceeds(testDoc.get())
        })

        it('must have an account type', async () => {

            const rec = getAccountRec('ABC Pty Ltd', null)
            delete rec.type

            const db = getFirestore(myAuth)
            const testDoc = db.collection('accounts').doc('ACC.001')
            await firebase.assertFails(testDoc.set(rec)) // missing 'type' property
        })

        it('must have an account type of contractor or client', async () => {

            const rec = getAccountRec('ABC Pty Ltd', 'wrong account type')

            const db = getFirestore(myAuth)
            const testDoc = db.collection('accounts').doc('ACC.001')
            await firebase.assertFails(testDoc.set(rec)) // 'type' is not 'contractor' or 'client'
        })

    })

})

export default describe
