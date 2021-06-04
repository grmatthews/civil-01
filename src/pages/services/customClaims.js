
import firebase from 'firebase'


const obtainCustomClaims = async () => {

    const obtainClaims = firebase.functions().httpsCallable('claims')

    if(firebase.auth().currentUser) {

        const user = firebase.auth().currentUser

        console.log('obtainCustomClaims for user', user.email, 'email verified?', user.emailVerified)

        return await firebase.auth().currentUser.getIdTokenResult(true)
        .then(async token => {

            const payload = {idToken: token}

            try {
                const claims = await obtainClaims(payload)
                return claims
            } catch (err) {
                return console.error('Error calling claims', err)
            }
        })
    } else {
        console.log('obtainCustomClaims', 'no current user')
    }
    return {}

    // firebase.functions().httpsCallable('test123')()
    // .then(result => console.log('test123 result', result))
}

const refreshUserToken = () => {

    let callback = null;
    let metadataRef = null;

    console.log('refreshUserToken')

    firebase.auth().onAuthStateChanged(user => {
        if (callback) {
            metadataRef.off('value', callback);
        }
        if (user) {
            metadataRef = firebase.database().ref('metadata/' + user.uid + '/refreshTime');
            callback = (snapshot) => {
                user.getIdToken(true);
            };
            metadataRef.on('value', callback);
        }
    })
}


export { obtainCustomClaims, refreshUserToken }