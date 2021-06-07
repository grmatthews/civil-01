import React, { Fragment, useState, useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Controls from "../components/controls/Controls"
import {
    Paper,
    Grid,
    Typography,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stepper,
    Step,
    StepContent,
    Button,
    StepButton,
    AppBar,
    Toolbar,
    IconButton,
    Box,
   
} from "@material-ui/core"
import { useForm } from "../components/useForm"
import { SnackbarProvider } from "notistack"
import { useHistory } from "react-router-dom"
import firebase from "firebase"
import { Alert, AlertTitle } from "@material-ui/lab"
import { useSnackbar } from "notistack"
import { obtainCustomClaims } from "./services/customClaims"
import { getStripePromise} from './services/stripeServices'
import { CardElement, Elements } from "@stripe/react-stripe-js"
import ArrowBackIcon from "@material-ui/icons/ArrowBack"
import * as Icons from "../icons"
import * as Accounts from './services/accountServices'


const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        margin: theme.spacing(1),
    },
    pageContent: {
        margin: theme.spacing(2),
        padding: theme.spacing(2),
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
    stepUI: {
        padding: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
    title: {
        flexGrow: 1,
    },
    paddingBottom: {
        paddingBottom: theme.spacing(2),
    },
}))

const initialValues = {
    account_type: "",
    account_name: "",
    account_email: "",
    account_phone: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    jobs_module: false,
    incidents_module: false,
    students_module: false,
}

const labels = {
    account_type: "Account Type",
    account_name: "Business Name",
    account_email: "Business Email",
    account_phone: "Business Phone",
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email",
    phone: "Phone",
}

function SignUp() {
    const classes = useStyles()

    const stripePromise = getStripePromise()

    const history = useHistory()

    const [isSignedUp, setSignedUp] = useState(false)

    const { enqueueSnackbar } = useSnackbar()

    const { values, setValues, handleInputChange } = useForm(initialValues)

    const [activeStep, setActiveStep] = useState(0)

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1)
    }

    const handleReset = () => {
        setActiveStep(0)
    }

    const handleReturnToSignUp = () => {
        history.goBack()
    }

    const signUpNewAccount = async () => {
        const signUp = firebase.functions().httpsCallable("signUp2")

        const payload = {
            signUpDetails: {
                account_type: values.account_type,
                account_name: values.account_name,
                account_phone: values.account_phone,
                account_email: values.account_email,
                email: values.email,
                first_name: values.first_name,
                last_name: values.last_name,
                phone: values.phone,
            },
        }

        return signUp(payload)
            .then((result) => {
                obtainCustomClaims()
                return result
            })
            .catch((err) => console.error("Error calling signUp", err))
    }

    // See if user is already signed up

    useEffect(() => {
        const user = firebase.auth().currentUser

        if (user) {
            user.getIdTokenResult(false).then((token) => {
                setSignedUp(token.claims.account_id !== undefined)
            })
        } else {
            setSignedUp(false)
        }
    }, [])

    // See if user has already authenticated their email, but perhaps doesn't have an account

    useEffect(() => {
        const user = firebase.auth().currentUser

        if (!user) {
            return
        }

        const newValues = {
            ...values,
            email: user.email,
            account_email: user.email,
        }

        console.log("setting new form values", newValues)
        setValues(newValues)
    }, [])

    const handleSignUp = async () => {
        console.log("sign up...")

        const emptyFieldName = Object.keys(values).find(
            (key) => values[key] === undefined || values[key] === ""
        )

        if (emptyFieldName !== undefined) {
            const label = labels[emptyFieldName]
            enqueueSnackbar("Enter " + label, { variant: "info" })
        } else {
            let result = await signUpNewAccount()
            console.log("signUp result", result)

            history.goBack()
        }
    }

    const getAccountTypeUI = () => {
        return (
            <Paper className={classes.stepUI}>
                <FormControl component='fieldset'>
                    <RadioGroup
                        aria-label='account type'
                        name='account_type'
                        value={values.account_type}
                        onChange={handleInputChange}
                    >
                        <FormControlLabel
                            value={Accounts.ACCOUNT_TYPE_CONTRACTOR}
                            disabled={isSignedUp}
                            control={<Radio />}
                            label='Contractor'
                        />
                        <Typography variant='caption' className={classes.signUpCaption}>
                            I provide design and construct services to client organisations
                        </Typography>

                        <FormControlLabel
                            value={Accounts.ACCOUNT_TYPE_CLIENT}
                            disabled={isSignedUp}
                            control={<Radio />}
                            label='Client'
                        />
                        <Typography variant='caption' className={classes.signUpCaption}>
                            I am a client organisation for projects. I engage contractor organisations for design and construction activities.
                        </Typography>
                    </RadioGroup>
                </FormControl>
            </Paper>
        )
    }

    const handleStep = (step) => () => {
        console.log("handleStep", step)
        setActiveStep(step)
    }

    const getSteps = () => {
        return ["Account type", "Modules", "Business details", "User details", "Payment details"]
    }

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return `You can sign up as either a client, or a contractor`
            case 1:
                return "Choose which modules you need for your business"
            case 2:
                return "Enter the details for your business."
            case 3:
                return `Enter your user details`
            case 4:
                return `Enter your credit card details. You can either enter details now, or otherwise before your trial period ends`
            default:
                return "Unknown step"
        }
    }

    const moduleConfig = [
        {
            name: "jobs_module",
            description:
                "Create jobs. Allocate jobs to contractors.",
            label: "Jobs",
            icon: <Icons.JobIcon />,
            value: values.jobs_module,
            usage: [Accounts.ACCOUNT_TYPE_CLIENT, Accounts.ACCOUNT_TYPE_CONTRACTOR],
        },
    ]

    const getModulesUI = () => {
        return (
            <>
                {values.account_type === "" && (
                    <Alert severity='info' className={classes.pageContent}>
                        Select an account type
                    </Alert>
                )}

                {values.account_type !== "" && (
                    <Paper className={classes.stepUI}>
                        <Grid container direction='column'>
                            {moduleConfig
                                .filter((module) => module.usage.includes(values.account_type))
                                .map((module) => (
                                    <div key={module}>
                                        <Grid item>
                                            <Typography variant='caption' gutterBottom={true}>
                                                {module.description}
                                            </Typography>
                                        </Grid>

                                        <Grid
                                            container
                                            direction='row'
                                            alignItems='center'
                                            spacing={2}
                                            className={classes.paddingBottom}
                                        >
                                            <Grid item>{module.icon}</Grid>

                                            <Grid item>
                                                <Controls.Checkbox
                                                    name={module.name}
                                                    label={module.label}
                                                    value={module.value}
                                                    onChange={handleInputChange}
                                                />
                                            </Grid>
                                        </Grid>
                                    </div>
                                ))}
                        </Grid>
                    </Paper>
                )}
            </>
        )
    }

    const getStepUI = (step) => {
        switch (step) {
            case 0:
                return getAccountTypeUI()
            case 1:
                return getModulesUI()
            case 2:
                return getAccountDetailsUI()
            case 3:
                return getPersonalDetailsUI()
            case 4:
                return getCreditCardUI()
            default:
                return "Unknown step"
        }
    }

    const getCreditCardUI = () => {
        // cards for testing: https://stripe.com/docs/testing#international-cards
        return (
            <Elements stripe={stripePromise}>
                <Paper className={classes.stepUI}>
                    <CardElement options={{ hidePostalCode: true }} />
                </Paper>
            </Elements>
        )
    }

    const getPersonalDetailsUI = () => {
        return (
            <Paper className={classes.stepUI}>
                <Grid container direction='column' spacing={1}>
                    <Grid item>
                        <Controls.TextInput
                            autoFocus
                            name='first_name'
                            label='First Name'
                            value={values.first_name}
                            disabled={isSignedUp}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.TextInput
                            name='last_name'
                            label='Last Name'
                            value={values.last_name}
                            disabled={isSignedUp}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.TextInput
                            name='email'
                            label='Email'
                            value={values.email}
                            disabled={isSignedUp}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.TextInput
                            name='phone'
                            label='Phone'
                            value={values.phone}
                            disabled={isSignedUp}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
            </Paper>
        )
    }

    const getAccountDetailsUI = () => {
        return (
            <Paper className={classes.stepUI}>
                <Grid container direction='column' spacing={1}>
                    <Grid item>
                        <Controls.TextInput
                            autoFocus
                            name='account_name'
                            label='Company Name'
                            value={values.account_name}
                            disabled={isSignedUp}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.TextInput
                            name='account_email'
                            label='Email'
                            value={values.account_email}
                            disabled={isSignedUp}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.TextInput
                            name='account_phone'
                            label='Phone'
                            value={values.account_phone}
                            disabled={isSignedUp}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>
            </Paper>
        )
    }

    return (
        <SnackbarProvider maxSnack={3}>
            <AppBar position='static'>
                <Toolbar>
                    <Typography variant='h6' className={classes.title}>
                        Sign Up
                    </Typography>
                    <IconButton
                        edge='end'
                        className={classes.menuButton}
                        color='inherit'
                        aria-label='menu'
                        onClick={handleReturnToSignUp}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {isSignedUp && (
                <Alert severity='info' className={classes.pageContent}>
                    <AlertTitle>Existing Account</AlertTitle>
                    You're already signed up
                </Alert>
            )}

            {!isSignedUp && (
                <Box maxWidth={500}>
                    <div className={classes.root}>
                        <Stepper activeStep={activeStep} nonLinear orientation='vertical'>
                            {getSteps().map((label, index) => (
                                <Step key={label}>
                                    <StepButton onClick={handleStep(index)}>{label}</StepButton>
                                    <StepContent>
                                        <Typography variant='caption'>
                                            {getStepContent(index)}
                                        </Typography>

                                        {activeStep === index && getStepUI(activeStep)}

                                        <div className={classes.actionsContainer}>
                                            <div>
                                                <Button
                                                    disabled={activeStep === 0}
                                                    onClick={handleBack}
                                                    className={classes.button}
                                                    size='small'
                                                >
                                                    Back
                                                </Button>
                                                <Button
                                                    variant='contained'
                                                    color='primary'
                                                    onClick={handleNext}
                                                    className={classes.button}
                                                    size='small'
                                                >
                                                    {activeStep === getSteps().length - 1
                                                        ? "Finish"
                                                        : "Next"}
                                                </Button>
                                            </div>
                                        </div>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                        {activeStep === getSteps().length && (
                            <Paper square elevation={0} className={classes.resetContainer}>
                                <Typography>Press Confirm to sign up</Typography>
                                <Button
                                    onClick={handleSignUp}
                                    color='primary'
                                    variant='contained'
                                    className={classes.button}
                                    size='small'
                                >
                                    Confirm
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant='contained'
                                    className={classes.button}
                                    size='small'
                                >
                                    Reset
                                </Button>
                            </Paper>
                        )}
                    </div>
                </Box>
            )}
        </SnackbarProvider>
    )
}

export default SignUp
