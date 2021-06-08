import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { getEmptyStripeAccountInfo, getStripeCustomer } from "../pages/services/stripeServices"
import ProgressBackdrop from "./ProgressBackdrop"
import StripeInvoice from "./StripeInvoice"
import StripeCard from "./StripeCard"
import StripeSubscription from "./StripeSubscription"
import StripeCustomer from "./StripeCustomer"
import * as dataServices from "../pages/services/dataServices"
import { useSnackbar } from "notistack"
import { Paper } from "@material-ui/core"
import StripeActions from "./StripeActions"
import Controls from "./controls/Controls"
import { Grid } from "@material-ui/core"
import { Form } from "./useForm"
import db from "../Firestore"
import firebase from "firebase"

const useStyles = makeStyles((theme) => ({
    headerFields: {
        margin: theme.spacing(1),
    },
    pageContent: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(2),
        padding: theme.spacing(1),
        maxWidth: "320px",
    },
}))

const BillingForm = (props) => {
    const classes = useStyles()

    const [isShowProgress, setShowProgress] = useState(true)

    const [stripeAccountInfo, setStripeAccountInfo] = useState(getEmptyStripeAccountInfo())

    const [retrievedBilling, setRetrievedBilling] = useState(false)

    const { enqueueSnackbar } = useSnackbar()

    const [maxModified, setMaxModified] = useState()

    const { setTitle } = props

    // This gets populated securely from the Google JWT, and also protected access server-side
    const [isSystem, setSystem] = useState(undefined)

    const [values, setValues] = useState({
        name: "",
        email: "",
        stripe_cust_id: "",
        has_subscription: false,
        stripe_status: "",
    })

    const { accountId } = props

    useEffect(() => {
        const unsub = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                user.getIdTokenResult(true).then((token) => {
                    if (isSystem === undefined) {
                        setSystem(token.claims.system_role)
                    }
                })
            }
        })

        return unsub
    }, [])

    const loadAccountData = async (accountId) => {
        let newValues = {
            ...values,
            has_subscription: undefined,

            // Do account and Stripe customer emails match?
            emails_match: undefined,
        }

        // Clear out the stripe_cust_id. If one exists, it will get re-loaded
        // in the following lines. Clearing the stripe_cust_id attribute
        // is needed when we use the 'Repair' action, to unlink a Simplify
        // account from a now-deleted Stripe customer.

        if (newValues.hasOwnProperty("stripe_cust_id")) {
            newValues.stripe_cust_id = ""
        }

        console.log("Retrieving account", accountId)
        const account = await dataServices.getAccountById(accountId)

        console.log("loaded account", { account, newValues })

        newValues = {
            ...newValues,
            ...account,
        }

        setTitle("Account: " + account.name)

        const result = await getStripeCustomer(accountId)
        console.log("Retrieved stripe customer", result)

        if (result.status) {
            enqueueSnackbar(result.status.message, { variant: result.status.type })
        }

        const isStripeCustomerDeleted =
            result.customer &&
            result.customer.hasOwnProperty("deleted") &&
            result.customer.deleted === true

        const stripeStatus = isStripeCustomerDeleted
            ? "Deleted"
            : result.customer
            ? "Customer"
            : "No Stripe Customer"

        newValues.stripe_status = stripeStatus

        if (result.customer && !isStripeCustomerDeleted) {
            setStripeAccountInfo(result)
            setRetrievedBilling(true)

            newValues = {
                ...newValues,
                has_subscription: result.customer.subscriptions.length > 0,
                emails_match: account.email === result.customer.email,
            }
        } else {
            newValues = {
                ...newValues,
                has_subscription: false,
                emails_match: false,
            }
        }

        if (result.status) {
            enqueueSnackbar(result.status.message, { variant: result.status.type })
        }
        setShowProgress(false)

        console.log("account values", newValues)
        setValues(newValues)
    }

    const handleUpdateCard = (updatedCard) => {
        const newCards = stripeAccountInfo.cards.map((card) =>
            card.id === updatedCard.id ? updatedCard : card
        )

        const newStripeAccountInfo = {
            ...stripeAccountInfo,
            cards: newCards,
        }
        setStripeAccountInfo(newStripeAccountInfo)
    }

    useEffect(() => {
        if (accountId && maxModified) {
            console.log("loading account data", { accountId, maxModified })
            loadAccountData(accountId)
        }
    }, [accountId, setTitle, maxModified])

    // Listen for changes, so we can reload

    useEffect(() => {
        const query = db
            .collection("accounts")
            .where(firebase.firestore.FieldPath.documentId(), "==", accountId)
        const unsub = query.onSnapshot((querySnapshot) => {
            let newMaxModified = null
            querySnapshot.docChanges().forEach((change) => {
                console.log("changed", change)

                if (
                    newMaxModified === null ||
                    change.doc.data().modified.seconds > newMaxModified.seconds
                ) {
                    // trigger refresh
                    newMaxModified = change.doc.data().modified
                }
            })
            if (newMaxModified !== null) {
                setMaxModified(newMaxModified)
            }
        })
        return unsub
    }, [])

    return (
        <>
            <ProgressBackdrop open={isShowProgress} />

            <Paper className={classes.pageContent}>
                <Form>
                    <Grid container direction='column'>
                        <Grid item>
                            <Controls.Readonly
                                name='name'
                                label='Account Name'
                                value={values.name}
                            />
                        </Grid>
                        <Grid item>
                            <Controls.Readonly
                                name='email'
                                label='Account Email'
                                value={values.email}
                            />
                        </Grid>
                        <Grid item>
                            <Controls.Readonly
                                name='has_stripe_customer'
                                label='Stripe Status'
                                value={values.stripe_status}
                            />
                        </Grid>

                        <Grid item>
                            <Controls.Readonly
                                name='stripe_cust_id'
                                label='Stripe Customer Id'
                                value={values.stripe_cust_id}
                            />
                        </Grid>

                        <Grid item>
                            <Controls.Readonly
                                name='has_stripe_subscription'
                                label='Stripe Subscription?'
                                value={
                                    values.has_subscription === undefined
                                        ? "..."
                                        : values.has_subscription
                                        ? "Yes"
                                        : "No"
                                }
                            />
                        </Grid>

                        <Grid item>
                            <Controls.Readonly
                                name='emails_match'
                                label='Emails match?'
                                value={
                                    values.stripe_status === "Deleted"
                                        ? "N/A"
                                        : values.emails_match === undefined
                                        ? "..."
                                        : values.emails_match
                                        ? "Yes"
                                        : "No"
                                }
                            />
                        </Grid>
                    </Grid>
                </Form>
            </Paper>

            {isSystem && (
                <StripeActions
                    accountId={accountId}
                    stripeAccountInfo={stripeAccountInfo}
                    accountInfo={values}
                    setShowProgress={setShowProgress}
                />
            )}

            {retrievedBilling && (
                <>
                    <StripeCustomer customer={stripeAccountInfo.customer} />

                    {stripeAccountInfo.invoice && (
                        <StripeInvoice invoice={stripeAccountInfo.invoice} />
                    )}

                    {stripeAccountInfo.customer.subscriptions.map((sub) => (
                        <StripeSubscription key={sub.id} subscription={sub} />
                    ))}

                    {stripeAccountInfo.cards.map((card) => (
                        <StripeCard card={card} key={card.id} updateCard={handleUpdateCard} />
                    ))}
                </>
            )}
        </>
    )
}

export default BillingForm
