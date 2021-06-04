import firebase from 'firebase'

const processInvite = async () => {

    const processInvite = firebase.functions().httpsCallable('processInvite')

    const payload = {}

    const inviteResult = await processInvite(payload)
    
    return inviteResult
}


export { processInvite }