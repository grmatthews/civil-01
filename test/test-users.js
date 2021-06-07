import { 
    getFirestore, 
    getAdminFirestore, 
    adminAuth,
    myAuth, 
    createAdminUser,
    createNonAdminUser,
    theirAuth, 
    noAccountAuth,
    systemAuth,
    getUserRec
} from './test-utils.js'

import firebase from '@firebase/testing'


describe('users', () => {

    
    describe('read', () => {

        it('can read own account', async () => {

            const db = getFirestore(myAuth)
            const USER_ID = 'U.001'
            await createAdminUser(USER_ID, myAuth.account_id)

            const testDoc = db.collection('users').doc(USER_ID)
            await firebase.assertSucceeds(testDoc.get())
        })

        it('cannot read other accounts', async () => {

            const USER_ID = 'U.001'
            await createAdminUser(USER_ID, theirAuth.account_id)
            
            const db = getFirestore(myAuth)
            const testDoc = db.collection('users').doc(USER_ID)
            await firebase.assertFails(testDoc.get())
        })

        it('cannot read if no account claim', async () => {

            const USER_ID = 'U.001'
            await createAdminUser(USER_ID, myAuth.account_id)
            
            const db = getFirestore(noAccountAuth)
            const testDoc = db.collection('users').doc(USER_ID)
            await firebase.assertFails(testDoc.get())
        })

        it('system can read other accounts', async () => {

            const USER_ID = 'U.001'
            await createAdminUser(USER_ID, myAuth.account_id)
            
            const db = getFirestore(systemAuth)
            const testDoc = db.collection('users').doc(USER_ID)
            await firebase.assertSucceeds(testDoc.get())
        })

    })

    describe('update', () => {

        it('admin can update own account', async () => {

            const USER_ID = 'U.001'
            await createAdminUser(USER_ID, myAuth.account_id)
            
            const db = getFirestore(adminAuth)
            const testDoc = db.collection('users').doc(USER_ID)

            const updateRec = (await testDoc.get()).data()
            updateRec.first_name = 'Joe'

            await firebase.assertSucceeds(testDoc.set(updateRec))
        })

        it('non-admin cannot update other user', async () => {

            await createAdminUser('U.001', myAuth.account_id)
            
            const db = getFirestore(myAuth)     // non-admin user
            const testDoc = db.collection('users').doc('U.001')

            const updateRec = (await testDoc.get()).data()
            updateRec.first_name = 'Joe'

            await firebase.assertFails(testDoc.set(updateRec))
        })

        it('user can update own details except roles', async () => {

            // Create user
            await createNonAdminUser(myAuth.uid, myAuth.account_id)
            

            // User now does an update of their own user record, but doesn't update roles attribute
            const db = getFirestore(myAuth)     // non-admin user
            const testDoc = db.collection('users').doc(myAuth.uid)

            const updateRec = (await testDoc.get()).data()
            updateRec.first_name = 'Joe'

            await firebase.assertSucceeds(testDoc.set(updateRec))
        })

        it('user cannot update their own roles if not admin', async () => {

            // Create user
            await createNonAdminUser(myAuth.uid, myAuth.account_id)
            
            // Non-admin user tries to update their roles
            const db = getFirestore(myAuth)     // non-admin user
            const testDoc = db.collection('users').doc(myAuth.uid)

            const updateRec = (await testDoc.get()).data()
            updateRec.roles = ['admin']     // try to make self into admin

            await firebase.assertFails(testDoc.set(updateRec))
        })

        it('user can update their own roles if admin', async () => {

            // Create admin user
            await createAdminUser(myAuth.uid, myAuth.account_id)
            
            // Admin user tries to update their roles
            const db = getFirestore(adminAuth)     // admin user
            const testDoc = db.collection('users').doc(myAuth.uid)

            const updateRec = (await testDoc.get()).data()
            updateRec.roles = ['admin', 'some_new_role']     // modify roles

            await firebase.assertSucceeds(testDoc.set(updateRec))
        })
    })

    describe('create', () => {

        it('cannot create in other account', async () => {

            const db = getFirestore(myAuth)
            const testDoc = db.collection('users').doc('USER.001')
            
            const userRec = getUserRec(theirAuth.account_id)
            await firebase.assertFails(testDoc.set(userRec))
        })

        it('can create in own account', async () => {

            const USER_ID = 'U.001'
            await firebase.assertSucceeds(createAdminUser(USER_ID, myAuth.account_id))
        })

        it('must provide first and last name', async () => {

            const db = getFirestore(myAuth)
            await firebase.assertSucceeds(createAdminUser('U.001', myAuth.account_id))
        })

        it('fails if first and last name not provided', async () => {

            const userRec = getUserRec(myAuth.account_id)
            delete userRec.first_name

            const db = getFirestore(myAuth)

            const testDoc = db.collection('users').doc('U.001') 
            await firebase.assertFails(testDoc.set(userRec))

            delete userRec.last_name
            userRec.first_name = 'John'
            await firebase.assertFails(testDoc.set(userRec))
        })

        it('admin can create new admin user', async () => {

            await createAdminUser(adminAuth.uid, adminAuth.account_id)

            const db = getFirestore(adminAuth)

            const newAdminUser = getUserRec(adminAuth.account_id)
            newAdminUser.roles = ['admin']
            const testDoc = db.collection('users').doc('NEW.USER.001')

            await firebase.assertSucceeds(await testDoc.set(newAdminUser))            
        })

        it('non-admin cannot create new admin user', async () => {

            await createNonAdminUser(myAuth.uid, myAuth.account_id)

            const db = getFirestore(myAuth)

            const newAdminUser = getUserRec(myAuth.account_id)
            newAdminUser.roles = ['admin']
            const testDoc = db.collection('users').doc('NEW.USER.001')

            await firebase.assertFails(testDoc.set(newAdminUser))            
        })
    })
    
    describe('delete', () => {

        it('admin can delete users', async () => {

            const USER_ID = 'U.001'
            await createAdminUser(USER_ID, myAuth.account_id)
            
            const db = getFirestore(adminAuth)
            const testDoc = db.collection('users').doc(USER_ID)
            await firebase.assertSucceeds(testDoc.delete())

        })

        it('non-admin cannot delete users', async () => {

            const USER_ID = 'U.001'
            await createAdminUser(USER_ID, myAuth.account_id)
            
            const db = getFirestore(myAuth)
            const testDoc = db.collection('users').doc(USER_ID)
            await firebase.assertFails(testDoc.delete())

        })
    })
    
})

export default describe