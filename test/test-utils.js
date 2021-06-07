import firebase from '@firebase/testing'


const ts = () => firebase.firestore.FieldValue.serverTimestamp()

const MY_PROJECT_ID = 'civil-01'

const myAccountId = 'ACC.001'
const theirAccountId = 'ACC.002'
const systemAccountId = 'ACC.003'
const supplierAccountId ='ACC.004'

const myAuth = {
    uid: '123123', 
    email: 'gregmatthews555@gmail.com',
    account_id: myAccountId,
    account_type: 'centre',
    system_role: false,
    roles: [],
}


const adminAuth = {
    ...myAuth,
    system_role: false,
    roles: ['admin'],
}

const systemAuth = {
    uid: '231231',
    email: 'abc@xyz.com',
    account_id: systemAccountId,
    account_type: 'centre',
    system_role: true,
    roles: []
}

const theirAuth = {
    uid: '232323',
    email: 'someone@blah.com',
    account_id: theirAccountId,
    account_type: 'centre',
    system_role: false,
    roles: [],
}

const noAccountAuth = {
    uid: '123131',
    email: 'xyz@blah.com'
}


const createAccount = async (accountId) => {

    const accountRef = getAdminFirestore().collection('accounts').doc(accountId)
    const accountRec = getAccountRec('ABC Pty Ltd', 'centre')
    accountRec.account_id = accountId
    await accountRef.set(accountRec)
}


const createClientAccount = async (accountId, name, email) => {

    const accountRef = getAdminFirestore().collection('accounts').doc(accountId)
    const accountRec = getAccountRec(name, 'client')
    accountRec.account_id = accountId
    accountRec.email = email
    await accountRef.set(accountRec)
}


const createInviteAsAdmin = async (inviteId, accountId, invitedEmail) => {

    const inviteRef = getAdminFirestore().collection('invites').doc(inviteId)
    const inviteRec = {
        account_id: accountId,
        email: invitedEmail,
        created: ts(),
        modified: ts()
    }

    await inviteRef.set(inviteRec)
}


const createUser = async (userId, accountId, roles) => {
    const userDoc = getAdminFirestore().collection('users').doc(userId)
    const userRec = getUserRec(accountId)
    userRec.roles = roles
    await userDoc.set(userRec)
}


const createAdminUser = async (userId, accountId) => {
    return await createUser(userId, accountId, ['admin'])
}


const createNonAdminUser = async (userId, accountId) => {
    return await createUser(userId, accountId, [])
}

const createLookupAsAdmin = async (lookupId, accountId, lookupName) => {

    const docRef = getAdminFirestore().collection('lookups').doc(lookupId)
    const data = getLookupRec(accountId, lookupName)
    await docRef.set(data)
}


const getAccountRec = (name, type) => {

    return {
        name: name,
        type: type,
        phone: '',
        email: '',
        modules: [],
        created: ts(),
        modified: ts(),
    }
}

const getLookupRec = (accountId, lookupName) => {

    return {
        name: lookupName,
        account_id: accountId,
        created: ts(),
        modified: ts(),
        lookup_values: []
    }
}


const getUserRec = (accountId) => {

    return {
        first_name: 'John',
        last_name: 'Smith',
        email: 'gregmatthews555@gmail.com',
        phone: '',
        created: ts(),
        modified: ts(),
        account_id: accountId,
        roles: []
    }
}



const getFirestore = (auth) => { 
    return firebase.initializeTestApp({projectId: MY_PROJECT_ID, auth: auth}).firestore()
}


const getAdminFirestore = () => {
    return firebase.initializeAdminApp({projectId: MY_PROJECT_ID}).firestore()
}

export {
    getFirestore, 
    getAdminFirestore, 

    // Accounts
    createAccount,

    // Users
    createAdminUser,
    createNonAdminUser,

    // Lookups
    createLookupAsAdmin,


    // Invites
    createInviteAsAdmin,

    // JSON
    getUserRec,
    getLookupRec,
    getAccountRec,
    ts,
    MY_PROJECT_ID, 
    myAuth, 
    adminAuth,
    theirAuth, 
    noAccountAuth,
    systemAuth
}