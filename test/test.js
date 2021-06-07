import { MY_PROJECT_ID } from './test-utils.js'
import firebase from '@firebase/testing'
import fs from 'fs'

// Tests are in these files
import testAccounts from './test-accounts.js'
import testUsers from './test-users.js'
import testInvites from './test-invites.js'
import testLookups from './test-lookups.js'


firebase.loadFirestoreRules(
    {projectId: MY_PROJECT_ID, rules: fs.readFileSync('../firestore.rules', 'utf8')}
)

beforeEach( async () => {
    await firebase.clearFirestoreData({projectId: MY_PROJECT_ID})
});
