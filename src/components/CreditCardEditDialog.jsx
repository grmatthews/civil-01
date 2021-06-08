import React, { useEffect } from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Controls from "./controls/Controls"
import { makeStyles } from "@material-ui/core/styles"
import { useForm, Form } from "./useForm"
import { CardCvcElement, CardElement, CardExpiryElement, Elements } from "@stripe/react-stripe-js"
import { getStripePromise } from "../pages/services/stripeServices"
import { Paper } from "@material-ui/core"
import { Grid } from "@material-ui/core"
import { InputLabel } from "@material-ui/core"
import { Box } from "@material-ui/core"

const useStyles = makeStyles((theme) => ({
    cardElements: {
        marginLeft: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    cardElementLabel: {
        marginTop: theme.spacing(2),
        marginBottom: "4px",
    },
    cardElement: {
        borderBottom: "dotted 1px #aaa",
        color: theme.palette.text.primary,
    },
}))

const CARD_OPTIONS = {
    style: {
        base: {
            iconColor: "#c4f0ff",
            color: "#000",
            fontFamily: "Roboto, Helvetica, Arial",
            fontSize: "16px",
            fontWeight: '400',
            fontSmoothing: "antialiased",
        },
        invalid: {
            iconColor: "#ffc7ee",
            color: "#ffc7ee",
        },
    },
}

const CreditCardEditDialog = (props) => {
    const classes = useStyles()

    const { open, setOpen, updateCard } = props

    const { values, setValues, handleInputChange } = useForm({
        billing_details: {
            name: "",
            address: {
                line1: "",
                line2: "",
                city: "",
                state: "",
                postal_code: "",
                country: "",
            },
            phone: "",
            email: "",
        },
    })

    const stripePromise = getStripePromise()

    const { updatePart } = props

    const handleClose = () => {
        setOpen(false)
    }

    const handleOK = () => {
        console.log("new values", values)
        updateCard(values)
        setOpen(false)
    }

    const submitOnEnter = (event) => {
        if (event.key === "Enter") {
            event.preventDefault()
            handleOK()
        }
    }

    useEffect(() => {
        setValues(props.values)
        console.log("card values", props.values)
    }, [props])

    return (
        <div>
            <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
                <DialogTitle id='form-dialog-title'>Credit Card</DialogTitle>
                <DialogContent>
                    <DialogContentText>Update Credit Card</DialogContentText>
                    <Form>
                        {values && values.id === "" && (
                            <>
                                {/* Only use CardElement to capture details if this is a new credit card */}
                                <Elements stripe={stripePromise}>
                                    <Paper>
                                        <CardElement options={{ hidePostalCode: true }} />
                                    </Paper>
                                </Elements>
                            </>
                        )}
                        {values.id !== "" && (
                            <>
                                <Controls.Readonly
                                    name='last4Digits'
                                    label='Last 4 Digits'
                                    value={values.last4}
                                />

                                {/*
                                    Stripe ELements styling example.
                                    https://codesandbox.io/s/react-stripe-js-card-detailed-omfb3?file=/src/App.js
                                */}

                                <Box className={classes.cardElements}>
                                    <Elements stripe={stripePromise}>
                                        <Grid container direction='column'>
                                            <Grid item className={classes.cardElementLabel}>
                                                <InputLabel shrink={true}>Expiry</InputLabel>
                                            </Grid>
                                            <Grid item>
                                                <CardExpiryElement
                                                    options={CARD_OPTIONS}
                                                    name='expiry'
                                                    id='expiry'
                                                    className={classes.cardElement}
                                                />
                                            </Grid>

                                            <Grid item className={classes.cardElementLabel}>
                                                <InputLabel shrink={true}>CVC</InputLabel>
                                            </Grid>
                                            <Grid item>
                                                <CardCvcElement
                                                    options={CARD_OPTIONS}
                                                    name='cvc'
                                                    id='cvc'
                                                    className={classes.cardElement}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Elements>
                                </Box>
                            </>
                        )}
                        <Grid container direction='column'>
                            <Grid item>
                                <Controls.TextInput
                                    name='billing_details.name'
                                    label='Cardholder Name'
                                    value={values.billing_details.name}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item>
                                <Controls.TextInput
                                    name='billing_details.address.line1'
                                    label='Address Line 1'
                                    value={values.billing_details.address.line1}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item>
                                <Controls.TextInput
                                    name='billing_details.address.line2'
                                    label='Address Line 2'
                                    value={values.billing_details.address.line2}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item>
                                <Controls.TextInput
                                    name='billing_details.address.city'
                                    label='City'
                                    value={values.billing_details.address.city}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item>
                                <Controls.TextInput
                                    name='billing_details.address.state'
                                    label='State'
                                    value={values.billing_details.address.state}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item>
                                <Controls.TextInput
                                    name='billing_details.address.postal_code'
                                    label='Postcode'
                                    value={values.billing_details.address.postal_code}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item>
                                <Controls.TextInput
                                    name='billing_details.address.country'
                                    label='Country (2 letter code)'
                                    value={values.billing_details.address.country}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item>
                                <Controls.TextInput
                                    name='billing_details.email'
                                    label='Email'
                                    value={values.billing_details.email}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                            <Grid item>
                                <Controls.TextInput
                                    name='billing_details.phone'
                                    label='Phone'
                                    value={values.billing_details.phone}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                        </Grid>
                    </Form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color='primary'>
                        Cancel
                    </Button>
                    <Button onClick={handleOK} color='primary'>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default CreditCardEditDialog
