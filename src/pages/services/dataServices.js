import db from "../../Firestore"
import firebase from "firebase"

const FROM_CACHE = { source: "cache" }

// call this when you are sure the user exists
const getUserByUid = async (uid) => {
    //TODO: try getting from cache first
    const userDoc = await db.collection("users").doc(uid).get()
    console.log("user exists?", uid, userDoc.exists)
    if (userDoc.exists) {
        return userDoc.data()
    }
    return null
}

const getInviteForUser = (email) => {
    return new Promise((resolve, reject) => {
        const query = db.collection("invites").where("email", "==", email).limit(1)

        query.get().then((querySnapshot) => {
            let data = querySnapshot.docs.map(function (doc) {
                return {
                    id: doc.id,
                    ...doc.data(),
                }
            })

            if (data.length === 1) {
                resolve(data[0])
            }
        })
    })
}

const getAccountById = async (accountId) => {
    console.log("getting account " + accountId)

    return await db
        .collection("accounts")
        .doc(accountId)
        .get()
        .then((accountDoc) => {
            if (accountDoc.exists) {
                return accountDoc.data()
            }
            return { error: "Account not found" }
        })
}

const createInvite = async (invite, accountId) => {
    const inviteRec = {
        ...invite,
        created: serverTimestamp(),
        account_id: accountId,
    }
    console.log("create invite", inviteRec)

    await db
        .collection("invites")
        .add(inviteRec)
        .then((result) => console.log("added invite"))
        .catch((err) => console.error("error adding invite"))
}

const deleteInvite = async (inviteId) => {
    await db.collection("invites").doc(inviteId).delete()
}

const getUser = (emailAddr, accountId) => {
    return new Promise((resolve, reject) => {
        db.collection("users")
            .where("email", "==", emailAddr)
            .where("account_id", "==", accountId)
            .limit(1)
            .get()
            .then((userData) => {
                const users = []

                userData.docs.forEach((doc) => {
                    users.push({
                        ...doc.data(),
                        id: doc.id,
                    })
                })

                console.log("DS getUser - server")

                if (users.length === 1) {
                    resolve(users[0])
                } else {
                    reject("User not found " + emailAddr)
                }
            })
            .catch((error) => reject(error))
    })
}

const getUserFromCache = (emailAddr, accountId) => {
    console.log("getUsersFromCache", emailAddr, accountId)

    return new Promise((resolve, reject) => {
        db.collection("users")
            .where("email", "==", emailAddr)
            .where("account_id", "==", accountId)
            .get(FROM_CACHE)
            .then((userData) => {
                const users = []

                userData.docs.forEach((doc) => {
                    users.push({
                        ...doc.data(),
                        id: doc.id,
                    })
                })

                if (users.length > 0) {
                    console.log("DS getUser - cache")

                    resolve(users[0])
                } else {
                    resolve(getUser(emailAddr, accountId))
                }
            })
            .catch((error) => {
                resolve(getUser(emailAddr, accountId))
            })
    })
}

const findInviteByEmail = async (email, accountId) => {
    const query = db
        .collection("invites")
        .where("account_id", "==", accountId)
        .where("email", "==", email)
        .limit(1)

    const invites = await find(query, FROM_CACHE)

    console.log("invites for", email, accountId, "=>", invites)

    return invites
}

const getCurrentUser = async () => {
    const uid = firebase.auth().currentUser.uid

    const userDoc = await db.collection("users").doc(uid).get()
    return userDoc.data()
}

const createUserIfRequired = (uid, email, displayName, phone) => {
    let names = []
    if (displayName !== undefined) {
        names = displayName.split(" ")
    }

    return new Promise((resolve, reject) => {
        console.log("find user", uid, email, displayName)
        db.collection("users")
            .doc(uid)
            .get()
            .then((user) => {
                if (user.exists) {
                    reject({
                        reason: "user already exists",
                        uid: uid,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                    })
                } else {
                    const newUser = {
                        email: email,
                        phone: phone === undefined ? "" : phone,
                        first_name: names.length > 0 ? names[0] : "",
                        last_name: names.length > 1 ? names[1] : "",
                    }

                    db.collection("users")
                        .doc(uid)
                        .set(newUser)
                        .then((user) => {
                            console.log("Created user", newUser)
                            resolve(newUser)
                        })
                        .catch((err) => console.log("Unable to create user", err))
                }
            })
    })
}

const find = async (query, from) => {
    return await query.get().then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => {
            return {
                id: doc.id,
                ...doc.data(),
            }
        })

        return data
    })
}

const loadData = async (source, query) => {
    let querySnapshot = await query.get(FROM_CACHE)

    //console.log('QS size=', querySnapshot.size, 'from cache')

    if (querySnapshot.size === 0) {
        querySnapshot = await query.get()

        console.log("QS size=", querySnapshot.size, "from server")
    }

    return querySnapshot.docs.map((doc) => {
        return {
            id: doc.id,
            ...doc.data(),
            doc: doc,
        }
    })
}

// for initializing the UI with a value, typically overwritten when we save
const localTimestamp = () => firebase.firestore.Timestamp.fromDate(new Date())

const localTimestampTruncTime = () => {
    const truncDate = new Date(localTimestamp().toDate().setHours(0, 0, 0))
    return firebase.firestore.Timestamp.fromDate(truncDate)
}

// use to ensure server based timetamps for created and modifed attributes
const serverTimestamp = () => firebase.firestore.FieldValue.serverTimestamp()

const timestampFromDate = (date) => firebase.firestore.Timestamp.fromDate(date)

const modifyQuery = (query, searchField, searchValue) => {
    if (searchValue !== "") {
        /*
        let startSearchValue = searchValue
        const lastChar = searchValue.charAt(searchValue.length - 1)
        const nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1)
        let endSearchValue = searchValue.slice(0,-1) + nextChar         
        query = query.where(searchField, '>=', startSearchValue).where(searchField, '<=', endSearchValue)
        */

        query = query
            .orderBy(searchField)
            .startAt(searchValue)
            .endAt(searchValue + "~")
    }
    return query
}

export {
    FROM_CACHE,
    // Accounts
    getAccountById,
    // Users
    getUser,
    getUserByUid,
    getUserFromCache,
    getCurrentUser,
    // General
    loadData,
    localTimestamp,
    localTimestampTruncTime,
    serverTimestamp,
    timestampFromDate,
    modifyQuery,
    createUserIfRequired,
    // Invites
    createInvite,
    deleteInvite,
    getInviteForUser,
    findInviteByEmail,
}
