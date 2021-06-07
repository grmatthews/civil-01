import assert from 'assert'
import { 
    getFirestore, 
    myAuth, 
    createInviteAsAdmin,
    theirAuth,
    adminAuth,
    ts,
    createAccount,
} from './test-utils.js'

import firebase, { assertSucceeds } from '@firebase/testing'
import  { doesNotMatch, match } from 'assert'


describe('invites', () => {

    describe('create', () => {

        it('can create in own account', async () => {

            const db = getFirestore(myAuth)
            const testDoc = db.collection('invites').doc('INV.001')
            const inviteRec = {
                account_id: myAuth.account_id, 
                email: 'abc@xyz.com', 
                type: 'staff',
                created: ts()
            }
            await firebase.assertSucceeds(testDoc.set(inviteRec))
        })

        it('cannot create in other account', async () => {

            const INVITE_ID = 'INV.001'
            const db = getFirestore(myAuth)
            const testDoc = db.collection('invites').doc(INVITE_ID)
            const inviteRec = {
                account_id: theirAuth.account_id, 
                email: 'abc@xyz.com', 
                type: 'supplier',
                created: ts()
            }
            await firebase.assertFails(testDoc.set(inviteRec))
        })

    })

    describe('read', () => {

        it('can read own account', async () => {
            
            const INVITE_ID = 'INV.001'
            await createInviteAsAdmin(INVITE_ID, myAuth.account_id, 'abc@xyz.com')
            
            const db = getFirestore(myAuth)
            const testDoc = db.collection('invites').doc(INVITE_ID)
            await firebase.assertSucceeds(testDoc.get())
            
        })
        
        it('cannot read other accounts', async () => {

            const INVITE_ID = 'INV.001'
            await createInviteAsAdmin(INVITE_ID, theirAuth.account_id, 'abc@xyz.com')

            const db = getFirestore(myAuth)
            const testDoc = db.collection('invites').doc(INVITE_ID)
            await firebase.assertFails(testDoc.get())
        })
    })

    describe('delete', () => {

        it('can delete in own account if admin', async () => {

            const INVITE_ID = 'INV.001'

            await createInviteAsAdmin(INVITE_ID, myAuth.account_id, 'abc@xyz.com')

            const db = getFirestore(adminAuth)
            const testDoc = db.collection('invites').doc(INVITE_ID)

            await firebase.assertSucceeds(testDoc.delete())
        })

        it('cannot delete in own account if not admin', async () => {

            const INVITE_ID = 'INV.001'

            await createInviteAsAdmin(INVITE_ID, myAuth.account_id, 'abc@xyz.com')

            const db = getFirestore(myAuth)
            const testDoc = db.collection('invites').doc(INVITE_ID)

            await firebase.assertFails(testDoc.delete())
        })

        it('cannot delete in other account', async () => {

            const INVITE_ID = 'INV.001'

            await createInviteAsAdmin(INVITE_ID, theirAuth.account_id, 'abc@xyz.com')

            const db = getFirestore(myAuth)
            const testDoc = db.collection('invites').doc(INVITE_ID)

            await firebase.assertFails(testDoc.delete())
        })
    })

})

export default describe
