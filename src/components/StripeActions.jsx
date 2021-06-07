import React, { useEffect, useState } from "react"
import { Grid } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import firebase from "firebase"
import db from "../Firestore"
import { useSnackbar } from "notistack"
import { Typography } from "@material-ui/core"
import { CardContent } from "@material-ui/core"
import { Card } from "@material-ui/core"
import { CardActions } from "@material-ui/core"
import { Button } from "@material-ui/core"
import CreateIcon from "@material-ui/icons/Create"
import LinkIcon from "@material-ui/icons/Link"
import LinkOffIcon from "@material-ui/icons/LinkOff"
import CreditCardIcon from "@material-ui/icons/CreditCard"
import { CardHeader } from "@material-ui/core"
import { getStripeCustomer } from "../pages/services/stripeServices"

const useStyles = makeStyles((theme) => ({
    pageContent: {
        marginTop: theme.spacing(3),
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(3),
        padding: theme.spacing(2),
        maxWidth: "320px",
    },
    action: {
        marginTop: theme.spacing(3),
        marginLeft: theme.spacing(0),
        marginRight: theme.spacing(3),
        padding: theme.spacing(2),
        maxWidth: "320px",
    },
}))

const StripeActions = (props) => {
    const classes = useStyles()

    const { stripeAccountInfo, accountInfo, accountId, setShowProgress } = props

    const { enqueueSnackbar } = useSnackbar()

    const [actions, setActions] = useState([])

    const findStripeCustomerByEmail = async (email) => {
        const getStripeCustomerByEmail = firebase
            .functions()
            .httpsCallable("getStripeCustomerByEmail")

        const result = await getStripeCustomerByEmail({ email: email })

        return result.data.customers
    }

    const handleCreateStripeSubscription = async () => {
        const createStripeSubscription = firebase
            .functions()
            .httpsCallable("createStripeSubscription")

        const result = await createStripeSubscription({ account_id: accountId })

        if (result.data.status) {
            const status = result.data.status

            console.log(result)

            enqueueSnackbar(status.message, { variant: status.type })
        }
    }

    // Get the actions that need to be performed on this account

    const getAccountActions = async (accountInfo) => {
        if (accountInfo.name === "") {
            return
        }

        const newActions = []

        console.log("Get account actions", accountInfo)

        const hasStripeCustId =
            accountInfo.hasOwnProperty("stripe_cust_id") && accountInfo.stripe_cust_id !== ""

        // Check if there's a Stripe account with a matching email address, but it's not
        // linked to the Simplify account

        let linkToStripeAccount = false

        if (!hasStripeCustId) {
            const customers = await findStripeCustomerByEmail(accountInfo.email)
            if (customers.length === 1) {
                newActions.push({
                    title: "Link Stripe Account",
                    description: `Link to existing Stripe account with same email`,
                    name: "Link",
                    icon: <LinkIcon color='primary' />,
                    func: handleLinkToStripeCustomerByEmail,
                })

                linkToStripeAccount = true
            }
        }

        // Check if the Simplify account has a Stripe Customer defined

        if (!hasStripeCustId && !linkToStripeAccount) {
            newActions.push({
                title: "Create Stripe Account",
                description: "Create a Stripe account so that we can charge the customer",
                name: "Create",
                icon: <CreateIcon color='primary' />,
                func: handleCreateStripeCustomer,
            })
        }

        let stripeCustomerDeleted = false

        const stripeCustomerInfo = await getStripeCustomer(accountId)

        if (hasStripeCustId) {
            if (stripeCustomerInfo.customer && stripeCustomerInfo.customer.deleted) {
                stripeCustomerDeleted = true

                newActions.push({
                    title: "Remove Stripe Link",
                    description:
                        "Unlink from this deleted Stripe account. Once this is done, a new Stripe account can be created",
                    name: "Unlink",
                    icon: <LinkOffIcon color='primary' />,
                    func: handleRepair,
                })
            }
        }

        // Check if we need to create a subscription

        const hasSubscription =
            stripeCustomerInfo.customer &&
            stripeCustomerInfo.customer.subscriptions &&
            stripeCustomerInfo.customer.subscriptions.length > 0

        if (hasStripeCustId && !stripeCustomerDeleted) {
            console.log(stripeCustomerInfo.customer)

            if (!hasSubscription) {
                newActions.push({
                    title: "Create Subscription",
                    description: "Create a trial subscription in this account",
                    name: "Create",
                    icon: <CreateIcon />,
                    func: handleCreateStripeSubscription,
                })
            }
        }

        // Check if any payment methods are defined

        const hasPaymentMethods =
            stripeCustomerInfo.customer &&
            stripeCustomerInfo.cards &&
            stripeCustomerInfo.cards.length > 0

        if (hasSubscription && !hasPaymentMethods) {
            newActions.push({
                title: "No payment methods",
                description:
                    "No payment methods are defined for this account. Contact the customer",
                name: null,
                icon: <CreditCardIcon />,
                func: null,
            })
        }

        console.log(`Created actions: ${newActions.map((action) => action.name).join(", ")}`)

        setActions(newActions)
    }

    useEffect(() => {
        getAccountActions(accountInfo)
    }, [accountInfo])

    const getAccount = async (accountId) => {
        const accountDoc = await db.collection("accounts").doc(accountId).get()

        const account = accountDoc.data()

        return account
    }

    const handleCreateStripeCustomer = async () => {
        const createStripeCustomer = firebase.functions().httpsCallable("createStripeCustomer")

        const account = await getAccount(accountId)

        const result = await createStripeCustomer({
            customer_account_id: accountId,

            // TODO: work out if we need to provide a billing address
            address: {
                city: "",
                country: "",
                line1: "",
                line2: "",
                postal_code: "",
                state: "",
            },
            email: account.email,
            name: account.name,
            phone: account.phone,
        })

        console.log("createStripeCustomer result", result)

        const status = result.data.status

        enqueueSnackbar(status.message, { variant: status.type })
    }

    const handleRepair = async () => {
        const repairStripeConfig = firebase.functions().httpsCallable("repairStripeConfig")

        const result = await repairStripeConfig({ account_id: accountId })

        if (result.data.status) {
            const status = result.data.status

            console.log(result)

            enqueueSnackbar(status.message, { variant: status.type })
        }
    }

    const handleLinkToStripeCustomerByEmail = async () => {
        const linkToStripeCustomerByEmail = firebase
            .functions()
            .httpsCallable("linkToStripeCustomerByEmail")

        const account = await getAccount(accountId)

        const result = await linkToStripeCustomerByEmail({
            account_id: accountId,
            email: account.email,
        })

        const status = result.data.status

        enqueueSnackbar(status.message, { variant: status.type })
    }

    return (
        <>
            <Grid container direction='row'>
                {actions.map((action) => (
                    <Grid key={action.name} className={classes.action}>
                        <Card>
                            <CardHeader avatar={action.icon} title={action.title} />
                            <CardContent>
                                <Typography variant='body2'>{action.description}</Typography>
                            </CardContent>
                            <CardActions>
                                {action.func && (
                                    <Button
                                        size='small'
                                        onClick={async () => {
                                            setShowProgress(true)
                                            await action.func()
                                            setShowProgress(false)
                                        }}
                                        variant='outlined'
                                        color='primary'
                                    >
                                        {action.name}
                                    </Button>
                                )}
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    )
}

export default StripeActions
