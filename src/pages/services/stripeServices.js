import firebase from "firebase"
import db from "../../Firestore"
import { loadStripe } from "@stripe/stripe-js"

const getEmptyStripeAccountInfo = () => {}


const stripePromise = loadStripe(
    "pk_test_51IzWoLGbJkpl0Y1VFvgnq8Ut2ZJc2TbhRMDrVHQTuZ4w00S6UPeX5IFHn7XAQs1xaORYIIZn6iLY868wGPxMtxA100MScnwjoF"
)

const getStripePromise = () => {
    return stripePromise
}

const getStripeProducts = async (productIds) => {
    const getStripeProducts = firebase.functions().httpsCallable("getStripeProducts")

    return await getStripeProducts(productIds)
}

const getStripePlan = async (priceId) => {
    const getStripePlan = firebase.functions().httpsCallable("getStripePlan")

    return await getStripePlan({ plan_id: priceId })
}

const getStripeCustomer = async (accountId) => {
    console.log("showCustomers", firebase.auth().currentUser)

    const result = {}

    if (firebase.auth().currentUser !== null) {
        const docRef = await db.collection("accounts").doc(accountId).get()

        const account = docRef.data()
        console.log("account", account)

        const getStripeCustomer = firebase.functions().httpsCallable("getStripeCustomer")

        const stripeCust = await getStripeCustomer({ account_id: accountId })

        console.log("stripeCust", stripeCust)

        const isStripeCustomerDeleted =
            stripeCust.data.customer &&
            stripeCust.data.customer.hasOwnProperty("deleted") &&
            stripeCust.data.customer.deleted === true

        if (!stripeCust.data.customer || isStripeCustomerDeleted) {
            return stripeCust.data
        }

        const cust = stripeCust.data.customer
        //const firstSub = cust.subscriptions.data[0]

        // const taxRate =
        //     firstSub.default_tax_rates.length > 0 ? firstSub.default_tax_rates[0].percentage : 0

        const customer = {
            name: cust.name,
            phone: cust.phone,
            email: cust.email,
            address: {
                city: cust.address.city,
                country: cust.address.country,
                line1: cust.address.line1,
                line2: cust.address.line2,
                postal_code: cust.address.postal_code,
                state: cust.address.state,
            },
            created: new Date(cust.created),
            default_source: cust.default_source,
            subscriptions: cust.subscriptions.data,
        }

        result.customer = customer

        const invoice = stripeCust.data.invoice

        if (stripeCust.data.invoice) {
            const inv = {
                amount_due: invoice.amount_due,
                currency: invoice.currency,
                period_start: invoice.period_start,
                period_end: invoice.period_end,
                status: invoice.status,
                subtotal: invoice.subtotal,
                tax: invoice.tax,
                next_payment_attempt: invoice.next_payment_attempt,
            }

            result.invoice = inv
        }

        const cards = stripeCust.data.payment_methods.data.map((pm) => {
            const paymentMethod = {
                id: pm.id,
                billing_details: {
                    ...pm.billing_details,
                },
                brand: pm.card.brand,
                last4: pm.card.last4,
                exp_month: pm.card.exp_month,
                exp_year: pm.card.exp_year,
                is_default: pm.id === customer.default_source,
            }

            if (paymentMethod.billing_details.address.line2 === null) {
                paymentMethod.billing_details.address.line2 = ""
            }

            return paymentMethod
        })

        result.cards = cards
    }

    console.log("loaded stripe customer", result)
    return result
}

export {
    getStripeCustomer,
    getEmptyStripeAccountInfo,
    getStripeProducts,
    getStripePlan,
    getStripePromise,
}
