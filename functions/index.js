const functions = require("firebase-functions")
const admin = require("firebase-admin")
const cors = require("cors")
const express = require("express")
// const stream = require("stream")
// const moment = require("moment")
// const { Storage } = require("@google-cloud/storage")

// const { result } = require("lodash")

const sgMail = require("@sendgrid/mail")

const stripe = require("stripe")(
    "pk_test_51IzWoLGbJkpl0Y1VFvgnq8Ut2ZJc2TbhRMDrVHQTuZ4w00S6UPeX5IFHn7XAQs1xaORYIIZn6iLY868wGPxMtxA100MScnwjoF"
)


//TODO: create AIM versions for these === reuse existing sendgrid credentials??
const sendGridApiKey = "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"
const verifiedSendGridSender = "civiladm01@gmail.com"

//const appBaseUrl = "https://aim.web.app/#"


const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp()

// Specifying the service account id is required so that we can create custom tokens
// required for one time password (OTP) based authentication
admin.initializeApp({
    serviceAccountId: "civil-01@appspot.gserviceaccount.com",
})

// where 'type' is 'info', 'error', 'warning', or 'success'
const createStatus = (message, type) => {
    return { status: { type: type, message: message } }
}

const isSystemRole = (context) => context.auth.token.system_role === true

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


// change to your domain/s
//const whitelist = ["https://gmail.com", "gmail.com"]

exports.claims = functions.https.onCall(async (data, context) => {
    const db = admin.firestore()

    const uid = context.auth.uid

    functions.logger.info("setting custom claims", "uid", uid)

    // We need the nested 'return' statements, so the inner 'return' where it has
    // 'claims updated' is actually returned from this cloud function

    const userDoc = await db.collection("users").doc(uid).get()

    if (userDoc.exists) {
        if (context.auth.token.email_verified) {
            const accountDoc = await db.collection("accounts").doc(userDoc.data().account_id).get()

            if (accountDoc.exists) {
                const isSystemRole = [
                    "greg55@ozemail.com.au",
                ].includes(context.auth.token.email)

                functions.logger.info("is system role?", isSystemRole, context.auth.token.email)

                const customClaims = {
                    account_id: userDoc.data().account_id,
                    account_type: accountDoc.data().type,
                    roles: userDoc.data().roles,
                    system_role: isSystemRole,
                    centre_ids: userDoc.data().centres,
                }

                functions.logger.info("new claims will be", customClaims)

                // Add custom claims for additional privileges.

                await admin.auth().setCustomUserClaims(uid, customClaims)

                functions.logger.info("updated claims", customClaims)

                return { response: "Claims updated" }
            } else {
                return { error: "Account not found" }
            }
        } else {
            return { response: "Email not verified" }
        }
    } else {
        functions.logger.info("userdoc does not exist")

        const noClaims = {}
        admin.auth().setCustomUserClaims(uid, noClaims)

        return { error: "User not found" }
    }
})

exports.signUp2 = functions.https.onCall(async (data, context) => {
    const db = admin.firestore()

    const uid = context.auth.uid

    const signUpDetails = data.signUpDetails

    functions.logger.info("updated signUpDetails", signUpDetails)

    // See if account name already used

    const accountSnapshot = await db
        .collection("accounts")
        .where("name", "==", signUpDetails.account_name)
        .get()

    if (accountSnapshot.docs.length > 0) {
        return { response: `Account name already exists ${signUpDetails.account_name}` }
    }

    // Create new account

    const newAccount = {
        name: signUpDetails.account_name,
        phone: signUpDetails.account_phone,
        email: signUpDetails.account_email,
        created: serverTimestamp(),
        modified: serverTimestamp(),
        type: signUpDetails.account_type,
    }

    const accountRef = await db.collection("accounts").add(newAccount)

    functions.logger.info("Created account", accountRef.id)

    // Create admin user for that account

    functions.logger.info("Creating user with uid", uid)

    const newUser = {
        account_id: accountRef.id,
        centres: [],
        created: serverTimestamp(),
        modified: serverTimestamp(),
        email: signUpDetails.email,
        first_name: signUpDetails.first_name,
        last_name: signUpDetails.last_name,
        phone: signUpDetails.phone,
        roles: ["admin"],   // initial admin role
    }

    await db.collection("users").doc(uid).set(newUser)

    return { response: "Account and user created" }
})

exports.validateOTPAndGetToken = functions.https.onCall(async (data, context) => {
    const db = admin.firestore()

    functions.logger.info("Find OTP", data)

    const query = db.collection("one_time_passwords").where("email", "==", data.email).limit(1)

    const querySnapshot = await query.get()

    let result = {}

    functions.logger.info(`Found ${querySnapshot.docs.length} OTPs`)

    if (querySnapshot.docs.length === 1) {
        const docRef = querySnapshot.docs[0]

        functions.logger.info(`Compare DB OTP ${docRef.data().otp} vs user OTP ${data.otp}`)

        if (docRef.data().otp === Number(data.otp)) {
            // These get added later
            const additionalClaims = {}

            // Remove OTP so it can't be used again

            await db.collection("one_time_passwords").doc(docRef.id).delete()

            // See if user record already exists

            await admin
                .auth()
                .getUsers([{ email: data.email }])
                .then(async (userRecs) => {
                    functions.logger.info("Found userRecs", userRecs.users.length, userRecs)

                    // Create token

                    let userRec

                    if (userRecs.users.length === 0) {
                        functions.logger.info(`User ${data.email} not found. Creating new user`)

                        userRec = await admin.auth().createUser({
                            email: data.email,
                            emailVerified: true,
                            disabled: false,
                        })
                        functions.logger.info("Created user", userRec)
                    } else {
                        userRec = userRecs.users[0]

                        functions.logger.info(`User ${data.email} found. ${userRec}`)
                    }

                    functions.logger.info("Creating custom token for user")

                    const token = await admin
                        .auth()
                        .createCustomToken(userRec.uid, additionalClaims)

                    functions.logger.info("Created custom token", token)

                    // const userData = {
                    //     email: data.email,
                    //     emailVerified: true,
                    // }

                    // functions.logger.info("Updating user", userData)

                    // // Update user's email into token
                    // admin.auth().updateUser(data.uid, userData)
                    // .then(userRec => functions.logger.info("Updated user", userRec))
                    // .catch(err => functions.logger.info("Failed to update user", err))

                    result.token = token
                })
        } else {
            functions.logger.info("OTPs do not match")
        }
    }

    return result
})

const createAndSendOTP = express()
createAndSendOTP.use(cors({ origin: true }))
createAndSendOTP.use(express.json())
createAndSendOTP.use(express.urlencoded({ extended: false }))

createAndSendOTP.post("/", async (req, resp) => {
    const otp = Math.floor(Math.random() * 899999 + 100000)

    const db = admin.firestore()

    const { email } = req.body.data

    functions.logger.info("send OTP for", email)

    const query = db.collection("one_time_passwords").where("email", "==", email)

    const snapshot = await query.get()

    if (snapshot.docs.length > 0) {
        const docRef = snapshot.docs[0]

        // Refresh OTP
        const otpRec = {
            ...docRef.data(),
            otp: otp,
        }

        functions.logger.info("update OTP", otpRec)

        await db.collection("one_time_passwords").doc(docRef.id).update(otpRec)
    } else {
        const otpRec = {
            email: email,
            otp: otp,
        }

        await db.collection("one_time_passwords").add(otpRec)
    }

    //sgMail.setApiKey(functions.config().sendgrid.key)
    sgMail.setApiKey(sendGridApiKey)

    const from = verifiedSendGridSender

    const to = email
    const subject = "One time password"
    const text = `Your OTP is ${otp}`

    const msg = {
        to,
        from,
        subject,
        text,
        html: `<strong>${text}</strong>`,
    }

    let status
    let responseData

    await sgMail
        .send(msg)
        .then(() => {
            functions.logger.info("email sent", msg)
            status = 200
            responseData = { response: "Email sent", msg }
        })
        .catch((error) => {
            functions.logger.info("email error", error)
            status = 500
            responseData = { error: error }
        })

    resp.status(status).send({ data: responseData })
})

exports.createAndSendOTP = functions.https.onRequest(createAndSendOTP)

exports.checkUserExists = functions.https.onCall(async (data, context) => {
    const db = admin.firestore()

    console.log("token", context.auth.token)

    if (context.auth.token) {
        if (context.auth.token.hasOwnProperty("email")) {
            const query = db
                .collection("users")
                .where("email", "==", context.auth.token.email)
                .limit(1)
            const snapshot = await query.get()

            console.log("users found", snapshot.docs.length)

            return { user_exists: snapshot.docs.length > 0 }
        } else {
            console.error("User record has no email. Token creation error")
            return { user_exists: false }
        }
    }

    return { user_exists: false }
})

exports.processInvite = functions.https.onCall(async (data, context) => {
    const db = admin.firestore()

    functions.logger.info("token", context.auth.token)

    if (context.auth.token) {
        const email = context.auth.token.email

        const query = db.collection("invites").where("email", "==", email).limit(1)

        const querySnapshot = await query.get()

        const invites = querySnapshot.docs.map(function (doc) {
            return {
                id: doc.id,
                ...doc.data(),
            }
        })

        functions.logger.info("invites count for " + email + ". count=", invites.length)

        if (invites.length === 1) {
            const invite = invites[0]

            functions.logger.info("invite for", invite.email, "type", invite.type)

            if (invite.type === "staff") {
                // Create staff user from invite
                const userRec = {
                    account_id: invite.account_id,
                    email: invite.email,
                    created: serverTimestamp(),
                    modified: serverTimestamp(),
                    centres: [],
                    first_name: "",
                    last_name: "",
                    phone: "",
                    roles: [],
                }

                functions.logger.info("create user ", userRec)

                db.collection("users").doc(context.auth.uid).set(userRec)

                functions.logger.info("deleting invite", invite.id)

                db.collection("invites").doc(invite.id).delete()

                return { response: "User created from invite " + email, invite_processed: true }
            } else {
                functions.logger.info("Invite of type " + invite.type + ". Taking no action")

                return { response: "Supplier invite. Taking no action", invite_processed: false }
            }
        } else {
            functions.logger.info("not creating user " + email + ". no invites found")

            return { response: "No invite found for user" + email, invite_processed: false }
        }
    } else {
        return { response: "No security token", invite_processed: false }
    }
})

/// STRIPE FUNCTIONS


exports.createStripeCustomer = functions.https.onCall(async (data, context) => {
    const accountId = context.auth.token.account_id

    const db = admin.firestore()

    // account for which stripe customer will be created
    const accountIdForStripeCustomer = data.customer_account_id

    // Check if account can be created. Requirements are:
    // a) System role can create stripe customer for any Simplify account,
    // b) Otherwise, context account must match target account

    if (!isSystemRole(context)) {
        if (accountId !== accountIdForStripeCustomer) {
            return createStatus("Cannot create Stripe customer for different account", "error")
        }
    }

    const accountRef = await db.collection("accounts").doc(accountIdForStripeCustomer).get()
    const account = accountRef.data()

    // See if Stripe customer already exists with this email

    const customers = await stripe.customers.list({ email: account.email })
    console.log("existing customers?", customers)

    if (customers.data.length > 0) {
        return createStatus(`Stripe customer already exists for email ${account.email}`, "info")
    }

    const stripeCustId = account.stripeCustId

    if (stripeCustId === undefined || stripeCustId === "") {
        console.log("Will create stripe cust id for account")

        const custData = {
            address: data.address,
            email: data.email,
            name: data.name,
            phone: data.phone,
        }
        const cust = await stripe.customers.create(custData)

        console.log("created cust", cust)

        // Link Stripe customer to Simplify account

        db.collection("accounts")
            .doc(accountIdForStripeCustomer)
            .update({ stripe_cust_id: cust.id }, { merge: true })

        return createStatus("Created Stripe customer", "success")
    } else {
        console.log("Account already has stripe cust id", stripeCustId)
        return createStatus("Account already has stripe customer id", "info")
    }
})

exports.getStripePrice = functions.https.onCall(async (data, context) => {
    const accountId = context.auth.token.account_id

    console.log("account_id", accountId)

    if (accountId === undefined) {
        functions.logger.info("user not signed in", context.auth)
        return {}
    }

    console.log("retrieving stripe price", data.price_id)

    const price = await stripe.prices.retrieve(data.price_id)

    console.log("retrieved price", price)

    return price
})

// https://medium.com/@GaryHarrower/working-with-stripe-webhooks-firebase-cloud-functions-5366c206c6c
exports.receiveStripeWebhook = functions.https.onRequest(async (req, resp) => {
    //functions.logger.info('webhook received')

    const sig = req.headers["stripe-signature"]

    const event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        "whsec_EKMVCNuf9gwcodgSXRFeILIRGdVqPp3g"
    )

    functions.logger.info(JSON.stringify(event))

    //functions.logger.info('stripe sig', sig)

    resp.status(200).send("endpoint for stripe webhooks")
})

exports.getStripeProducts = functions.https.onCall(async (data, context) => {
    const products = await stripe.products.list({ ids: data.product_ids })

    console.log("listed products", data.product_ids, products)

    return products.data
})

exports.getStripePlan = functions.https.onCall(async (data, context) => {
    const accountId = context.auth.token.account_id

    console.log("account_id", accountId)

    if (accountId === undefined) {
        functions.logger.info("user not signed in", context.auth)
        return createStatus("User not signed in", "error")
    }

    console.log("retrieving stripe plan", data.plan_id)

    const plan = await stripe.plans.retrieve(data.plan_id, { expand: ["tiers"] })

    console.log("retrieved plan", plan)

    return plan
})

// See if a Stripe customer exists with a given email
exports.getStripeCustomerByEmail = functions.https.onCall(async (data, context) => {
    if (!isSystemRole(context)) {
        return createStatus("Insuffient permissions", "error")
    }

    // See if Stripe customer with this given email already exists

    const customers = await stripe.customers.list({ email: data.email })
    console.log("existing customers?", customers)

    return { customers: customers.data }
})

// Make the Stripe customer contact details to match the Simplify account contact details
exports.updateStripeContactDetails = functions.https.onCall(async (data, context) => {
    if (!isSystemRole(context)) {
        return createStatus("Insufficient permissions", "error")
    }
})

// Take the given account id, and link it to the Stripe Customer with the given email address.
// There must be only 1 Stripe customer with that email address.
exports.linkToStripeCustomerByEmail = functions.https.onCall(async (data, context) => {
    const accountId = data.account_id

    if (!isSystemRole(context)) {
        return createStatus("Insufficient permissions", "error")
    }

    const db = admin.firestore()

    const accountRef = await db.collection("accounts").doc(accountId).get()

    const account = accountRef.data()

    if (account.hasOwnProperty("stripe_cust_id")) {
        functions.logger.info(`Stripe customer id already defined for account ${accountId}`)
        return createStatus(`Account ${account.name} already has a Stripe customer id`, "info")
    }

    // Find Stripe account with matching email to link to. Make sure there's only 1 target Stripe account with same email.

    const customers = await stripe.customers.list({ email: account.email })

    if (customers.data.length !== 1) {
        return createStatus(
            `Found ${customers.data.length} Stripe accounts with email ${account.email}. Expecting 1`,
            "error"
        )
    }

    const stripeCustId = customers.data[0].id

    // Make sure no other Simplify account is already linked to this Stripe account. Mapping should be 1:1

    const alreadyLinkedAccounts = await db
        .collection("accounts")
        .where("stripe_cust_id", "==", stripeCustId)
        .limit(1)
        .get()

    if (alreadyLinkedAccounts.docs.length > 0) {
        const linkedAccount = alreadyLinkedAccounts.docs[0].data().email

        return createStatus(
            `Account for ${linkedAccount} already linked to Stripe customer account ${stripeCustId}. Cannot link ${account.email} as well`,
            "warning"
        )
    }

    // OK now to link Simplify account to Stripe account

    db.collection("accounts")
        .doc(accountId)
        .update({ stripe_cust_id: stripeCustId }, { merge: true })

    return createStatus(`Assigned ${account.email} to Stripe customer ${stripeCustId}`, "success")
})

exports.createStripeSubscription = functions.https.onCall(async (data, context) => {
    if (!isSystemRole(context)) {
        return createStatus("Insuffient permissions", "error")
    }

    const accountId = data.account_id

    const db = admin.firestore()

    const accountRef = await db.collection("accounts").doc(accountId).get()

    const account = accountRef.data()

    if (!account.hasOwnProperty("stripe_cust_id")) {
        functions.logger.info(`No stripe_cust_id defined for account ${accountId}`)
        return createStatus(
            `Account ${account.name} does not have a corresponding Stripe customer id`,
            "info"
        )
    }

    const products = await stripe.products.list()

    const product = products.data.find((product) => product.name === "Jobs module")

    const taxRates = await stripe.taxRates.list()

    if (taxRates.data.length !== 1) {
        return createStatus(`Expecting 1 tax rate. Found ${taxRates.data.length}`, "error")
    }

    const taxRate = taxRates.data[0]

    console.log(
        `Using tax rate ${taxRate.percentage}%, country ${taxRate.country}, id ${taxRate.id}`
    )

    if (product) {
        functions.logger.info(`Creating subscription with product: ${product.id} - ${product.name}`)

        const prices = await stripe.prices.list({ product: product.id })

        console.log(`found ${prices.data.length} prices for product ${product.name}`)

        if (prices.data.length === 1) {
            const subscription = await stripe.subscriptions.create({
                customer: account.stripe_cust_id,
                trial_period_days: 30,
                items: [{ price: prices.data[0].id, tax_rates: [taxRate.id] }],
            })

            functions.logger.info(
                `Created subscription ${subscription.id} for customer ${account.stripe_cust_id}`
            )

            await db
                .collection("accounts")
                .doc(accountId)
                .update({ modified: serverTimestamp() }, { merge: true })

            return createStatus("Subscription created", "success")
        } else {
            return createStatus(
                `Expecting 1 price for product ${product.name} [${product.id}]. Found ${prices.data.length}`,
                "error"
            )
        }
    } else {
        return createStatus("Cannot find Jobs module product in Stripe", "error")
    }
})

exports.repairStripeConfig = functions.https.onCall(async (data, context) => {
    if (!isSystemRole(context)) {
        return createStatus("Insuffient permissions", "error")
    }

    const accountId = data.account_id

    const db = admin.firestore()

    const accountRef = await db.collection("accounts").doc(accountId).get()

    const account = accountRef.data()

    if (!account.hasOwnProperty("stripe_cust_id")) {
        functions.logger.info(`No stripe_cust_id defined for account ${accountId}`)
        return createStatus(
            `Account ${account.name} does not have a corresponding Stripe customer id`,
            "info"
        )
    }

    // Check if Stripe customer is deleted, but isn't reflected in the Simplify account setup

    let customer

    try {
        customer = await stripe.customers.retrieve(account.stripe_cust_id)
        console.log("retrieved customer", customer)
    } catch (err) {
        console.log("Error retrieving Stripe customer", account.stripe_cust_id)
        return createStatus(`Cannot find Stripe customer ${account.stripe_cust_id}`, "error")
    }

    const isCustomerDeleted = customer.hasOwnProperty("deleted") && customer.deleted === true

    if (isCustomerDeleted && account.hasOwnProperty("stripe_cust_id")) {
        console.log("Deleting stripe_cust_id attribute from account")

        await db
            .collection("accounts")
            .doc(accountId)
            .update({ stripe_cust_id: admin.firestore.FieldValue.delete() }, { merge: true })
    } else {
        console.log("Not deleting stripe_cust_id from account", isCustomerDeleted, account)
    }

    return createStatus("OK", "success")
})

exports.getStripeCustomer = functions.https.onCall(async (data, context) => {
    const accountId = data.account_id

    console.log("account_id for billing query", accountId)

    // Check user has permission to retrieve details for the specified account.
    // This will be because, either:
    // a) Their user is from that account and they have the admin role, OR
    // b) They are a system user.

    const isUserAdmin =
        accountId === context.auth.token.account_id && context.auth.token.roles.includes("admin")

    if (!isUserAdmin && !isSystemRole(context)) {
        functions.logger.info("Must be admin to access billing")

        return createStatus(`Must be admin to access billing`, "error")
    }

    if (context.auth.token.account_id === undefined) {
        functions.logger.info("user not signed in", context.auth)
        return createStatus(`Must be signed in to access billing`, "error")
    }

    const db = admin.firestore()

    const accountRef = await db.collection("accounts").doc(accountId).get()

    const account = accountRef.data()

    if (!account.hasOwnProperty("stripe_cust_id")) {
        functions.logger.info(`No stripe_cust_id defined for account ${accountId}`)
        return createStatus(
            `Account ${account.name} does not have a corresponding Stripe customer id`,
            "info"
        )
    }

    let customer

    try {
        customer = await stripe.customers.retrieve(account.stripe_cust_id, {
            expand: ["subscriptions"],
        })
        console.log("retrieved customer", customer)
    } catch (err) {
        console.log("Error retrieving Stripe customer", account.stripe_cust_id)
        return createStatus(`Cannot find Stripe customer ${account.stripe_cust_id}`, "error")
    }

    const isCustomerDeleted = customer.hasOwnProperty("deleted") && customer.deleted === true

    console.log("### customer", customer.id)

    let result = { customer }

    if (!isCustomerDeleted) {
        let invoice
        try {
            invoice = await stripe.invoices.retrieveUpcoming({
                customer: customer.id,
            })
            result.invoice = invoice
        } catch (err) {
            console.log("error retrieving upcoming invoice", err)
        }

        //console.log('### upcoming invoice', invoice)

        const paymentMethods = await stripe.paymentMethods.list({
            customer: customer.id,
            type: "card",
        })

        //console.log('### paymentMethods', paymentMethods)

        result.payment_methods = paymentMethods
    }

    if (customer.hasOwnProperty("deleted") && customer.deleted === true) {
        result = { ...result, ...createStatus("Stripe customer has been deleted", "warning") }
    }

    console.log("returning stripe customer", result)

    return result
})