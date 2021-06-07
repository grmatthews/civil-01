import React, { Fragment, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Controls from "../components/controls/Controls"
import {
    Paper,
    Grid,
    Divider,
    LinearProgress,
    AppBar,
    Toolbar,
    Typography,
    Link,
    Box,
    Button,
} from "@material-ui/core"
import { Form } from "../components/useForm"
import { SnackbarProvider } from "notistack"
import { useHistory } from "react-router-dom"
import firebase from "firebase"
import { FcGoogle } from "react-icons/fc"
import { AiOutlineMail } from "react-icons/ai"
import { FiLogIn } from "react-icons/fi"
import { useSnackbar } from "notistack"
import * as dataServices from "../pages/services/dataServices"
import { useEffect } from "react"
import { obtainCustomClaims } from "./services/customClaims"
import { processInvite } from "./services/userServices"
import { Alert, AlertTitle } from "@material-ui/lab"
import { useAuth } from "../components/AuthContext"
import { version } from "../../package.json"
//import { generateUID } from "./services/idServices"
import EmailOTPLoginDialog from "../components/EmailOTPLoginDialog"

const useStyles = makeStyles((theme) => ({
    pageContent: {
        margin: theme.spacing(2),
        padding: theme.spacing(2),
    },
    leftPadded: {
        marginLeft: theme.spacing(2),
    },
    versionBox: {
        display: "flex",
        justifyContent: "flex-end",
        alignContent: "flex-start",
        width: "100%",
        maxWidth: 400,
    },
    versionNo: {
        marginRight: theme.spacing(2),
    },
    loginBox: {
        maxWidth: 400,
        alignContent: "center",
    },
    gridContainer: {
        display: "flex",
        alignContent: "flex-start",
    },
    link: {
        cursor: "pointer",
    },
}))

const emptyUserDetails = {
    account_id: "",
}


var actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.

    url: "https://aim-01.web.app/#/SignIn",
    //url: "http://localhost:3000/#/SignIn",

    //url: 'http://192.168.0.47:3000/SignIn',

    // This must be true.
    handleCodeInApp: true,
}

function SignIn() {
    const classes = useStyles()

    const history = useHistory()

    const { enqueueSnackbar } = useSnackbar()

    const [lastSignInTime, setLastSignInTime] = useState()

    const [userDetails, setUserDetails] = useState(emptyUserDetails)

    const authSetUserDetails = useAuth().setUserDetails

    const [isSigningInWithEmail, setSigningInWithEmail] = useState(false)

    const [userInviteProcessed, setUserInviteProcessed] = useState(0)

    const [isShowProgress, setShowProgress] = useState(true)

    const [isShowOTP, setShowOTP] = useState(false)

    const [logs, setLogs] = useState([])

    //const [lastProcessedSeconds, setLastProcessedSeconds] = useState(0)

    const indeterminateSignInStatus = {
        title: "Signing in...",
        severity: "info",
        message: "",
        canSignUp: false,
        canSignIn: true,
        canContinue: false,
        checkForInvite: false,
        canSignOut: false,
    }

    const [signInStatus, setSignInStatus] = useState(indeterminateSignInStatus)

    useEffect(() => {
        if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
            // Additional state parameters can also be passed via URL.
            // This can be used to continue the user's intended action before triggering
            // the sign-in operation.
            // Get the email if available. This should be available if the user completes
            // the flow on the same device where they started it.
            var email = window.localStorage.getItem("emailForSignIn")

            if (!email) {
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask the user to provide the associated email again. For example:
                email = window.prompt("Please provide your email for confirmation")
            }
            // The client SDK will parse the code from the link for you.
            firebase
                .auth()
                .signInWithEmailLink(email, window.location.href)
                .then((result) => {
                    console.log(">>> sign in result", result)
                })
        }
    }, [])

    // Check for new version

    useEffect(() => {
        const storedVersion = window.localStorage.getItem("app.version")
        console.log("app.version", storedVersion)
        if (storedVersion === null) {
            window.localStorage.setItem("app.version", version)
            console.log("set version", version)
        }

        addLog(`stored ${storedVersion} current ${version}`)

        if (storedVersion !== version) {
            addLog("requires reload")
            console.log("version changed", storedVersion, "to", version)
            window.localStorage.setItem("app.version", version)
            enqueueSnackbar("New version. Reloading...")

            window.location.reload()
        }
    }, [])

   
    const forceReload = () => {
        window.location.reload(true)
    }

    // If signin status changes, check if we need to auto-create a user based on an invite that may exist

    const [authTime, setAuthTime] = useState()

    const [authFlag, setAuthFlag] = useState(true)

    useEffect(() => {
        const unsub = firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                user.getIdTokenResult().then(async (token) => {
                    const hasAccountId = token.claims.hasOwnProperty("account_id")

                    console.log("[authStateChanged] user token", { token, hasAccountId })

                    if (authTime !== undefined && authTime === token.authTime) {
                        console.log("[authStateChanged] token.authTime is the same. returning")
                        return
                    } else {
                        console.log("[authStateChanged] setting authTime", token.authTime)
                        setAuthTime(token.authTime)
                    }

                    if (authFlag) {
                        setAuthFlag(false)

                        if (hasAccountId) {
                            await updateSignInStatus(
                                `from authStateChanged. account id found. authTime [${token.authTime}]`
                            )
                        } else {
                            console.log("[authStateChanged] process invite (1)")

                            if (user.email !== null) {
                                const inviteResult = await processInvite()

                                console.log("[authStateChanged] process invite (2)", {
                                    inviteResult,
                                })
                            }
                            await updateSignInStatus("from authStateChanged. no account id found")
                        }
                    }
                })
            } else {
                console.log("[authStateChanged] no user")
                updateSignInStatus("from authStateChanged. no user")
            }
        })

        return unsub
    }, [])

    const addLog = async (log) => {
        setLogs([...logs, log])
    }

    const isSignInWithEmailLink = firebase.auth().isSignInWithEmailLink(window.location.href)

    //console.log('isSignInWithEmailLink?', isSignInWithEmailLink)

    if (isSignInWithEmailLink) {
        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.

        if (!isSigningInWithEmail) {
            setSigningInWithEmail(true)

            const queryString = window.location.search
            const urlParams = new URLSearchParams(queryString)
            console.log("urlParams", urlParams)

            let email = window.localStorage.getItem("emailForSignIn")
            console.log("retrieved email for sign in", email)
            if (!email) {
                // User opened the link on a different device. To prevent session fixation
                // attacks, ask the user to provide the associated email again. For example:
                email = window.prompt("Please provide your email for confirmation")
            }
            // The client SDK will parse the code from the link for you.

            firebase
                .auth()
                .signInWithEmailLink(email, window.location.href)
                .then(async (result) => {
                    // Clear email from storage.
                    window.localStorage.removeItem("emailForSignIn")

                    // Additional user info profile not available via:
                    // result.additionalUserInfo.profile == null
                    // You can check if the user is new or existing:
                    // result.additionalUserInfo.isNewUser
                    console.log("isNewUser?", result.additionalUserInfo.isNewUser)

                    await updateSignInStatus("from signInWithEmailLink")

                    //history.replace("/SignIn")
                    console.log("redirecting to", actionCodeSettings.url)
                    window.location.href = actionCodeSettings.url
                })
                .catch((error) => {
                    // Some error occurred, you can inspect the code: error.code
                    // Common errors could be invalid email and invalid or expired OTPs.
                    console.log("errorCode", error.code)
                    console.log("errorMessage", error.message)
                })
        }
    }

    // const [authFlag2, setAuthFlag2] = useState(true)

    // useEffect(() => {
    //     let unsub = firebase.auth().onAuthStateChanged(async (user) => {

    //         if(authFlag2) {

    //             setAuthFlag2(false)
    //             await updateSignInStatus("from page load trigger", user)
    //         }
    //     })

    //     return unsub
    //}, [])

    useEffect(() => {
        if (signInStatus.canContinue) {
            firebase
                .auth()
                .currentUser.getIdTokenResult()
                .then((token) => {
                    console.log("token", token)

                    dataServices
                        .getUserByUid(firebase.auth().currentUser.uid)
                        .then((dbUser) => {
                            // TODO: replace JobCards and JobGrid to lookup a user's centres, rather than access it from UserDetails (since this is out of date as soon as a user's centres is updated)
                            const newUserDetails = {
                                account_id: token.claims.account_id,
                                account_type: token.claims.account_type,
                                centre_ids: dbUser.centres ? dbUser.centres : [],
                                loaded_centres: false,
                                loaded_suppliers: false,
                            }
                            console.log("set userDetails", newUserDetails)
                            authSetUserDetails(newUserDetails)
                        })
                        .catch((err) => {
                            console.log("user record not found", token)
                            authSetUserDetails(null)
                        })

                    setShowProgress(false)
                })
        }
    }, [signInStatus.canContinue])

    const handleSignUp = () => {
        history.push("/SignUp")
    }

    const handleSignIn = () => {
        const googleAuthProvider = new firebase.auth.GoogleAuthProvider()

        setSignInStatus(indeterminateSignInStatus)
        setShowProgress(true)

        firebase
            .auth()
            .signInWithPopup(googleAuthProvider)
            .then((result) => {
                console.log("[handleSignIn]", result)
                console.log("[handleSignIn]", "uid", result.user.uid)
                result.user.getIdTokenResult(true).then(async (token) => {
                    console.log("[handleSignIn]", { token })

                    console.log(
                        "[handleSignIn]",
                        "has account id?",
                        { token },
                        token.claims.hasOwnProperty("account_id")
                    )

                    if (token.claims.hasOwnProperty("account_id")) {
                        await updateSignInStatus("from handleSignIn")
                    } else {
                        // Only look for invites if the user doesn't already belong to an account
                        console.log("[handleSignIn] process invite")

                        const inviteResult = await processInvite()

                        if (inviteResult.invite_processed) {
                            setUserInviteProcessed(userInviteProcessed + 1)
                            obtainCustomClaims()
                        }
                    }
                })
            })
    }

    const handleGetStarted = () => {
        if (firebase.auth().currentUser) {
            firebase
                .auth()
                .currentUser.getIdTokenResult(true)
                .then((token) => {
                    console.log(token.claims.roles)
                    if (
                        token.claims.roles &&
                        (token.claims.roles.includes("job_admin") ||
                            token.claims.roles.includes("job_user"))
                    ) {
                        history.push("/jobgrid")
                    } else {
                        history.push("/dashboard")
                    }
                })
        }
    }

    const handleSignOut = () => {
        console.log("handleSignOut")
        firebase
            .auth()
            .signOut()
            .then(async (result) => {
                setUserDetails(emptyUserDetails)
                await updateSignInStatus("from handleSignOut")
            })
    }

    const handleEmailOTPSignIn = () => {
        setShowOTP(true)
    }

    const getClaims = async (user) => {
        const token = await user.getIdTokenResult(true)

        if (token.claims.hasOwnProperty("account_id")) {
            return token.claims
        } else {
            // This updates the claims, even though the results aren't used by this function
            const claimsUpdateStatus = await obtainCustomClaims()
            console.log("got claims", claimsUpdateStatus)

            const updatedToken = await user.getIdTokenResult(true)
            return updatedToken.claims
        }
    }

    const isUserRecordFound = async () => {
        const checkUserExists = firebase.functions().httpsCallable("checkUserExists")

        const result = await checkUserExists()

        console.log("checkUserExists", result)

        return result.data.user_exists
    }

    const updateSignInStatus = async (source) => {
        console.log("[updateSignInStatus] BEGIN. source", source)
        if (firebase.auth().currentUser !== null) {
            const user = firebase.auth().currentUser

            if (lastSignInTime === user.metadata.lastSignInTime) {
                console.log("[updateSignInStatus] last sign in time not changed. returning")
                return
            }
            setLastSignInTime(user.metadata.lastSignInTime)

            console.log("[updateSignInStatus] check if user record exists", user.uid)

            const userRecFound = await isUserRecordFound()
            console.log("user rec found?", userRecFound)

            const claims = await getClaims(user)

            const email = user.email

            console.log("[updateSignInStatus]", {
                hasAccountId: claims.hasOwnProperty("account_id"),
                userRecFound: userRecFound,
            })

            if (claims.hasOwnProperty("account_id") && userRecFound) {
                const accountId = claims.account_id

                const account = await dataServices.getAccountById(accountId)

                setSignInStatus({
                    title: "Signed in",
                    severity: "success",
                    message: (
                        <>
                            <strong>
                                {account.name} {email}
                            </strong>
                        </>
                    ),
                    canSignUp: false,
                    canSignIn: false,
                    canContinue: true,
                    checkForInvite: false,
                    canSignOut: true,
                })
                setShowProgress(false)
            } else {
                setSignInStatus({
                    title: "Email Verified",
                    severity: "info",
                    message: (
                        <>
                            <strong>{email}</strong> is verified. You can now either{" "}
                            <strong>Sign Up</strong> for a new Account, or await an{" "}
                            <strong>Invite</strong> from an existing Account
                        </>
                    ),
                    canSignUp: true,
                    canSignIn: false,
                    canContinue: false,
                    checkForInvite: true,
                    canSignOut: true,
                })

                setShowProgress(false)
            }
        } else {
            //console.log(`[updateSignInStatus] ${source}`, 'Not signed In')

            setSignInStatus({
                title: "Not Signed In",
                severity: "info",
                message: "",
                canSignUp: true,
                canSignIn: true,
                canContinue: false,
                checkForInvite: false,
                canSignOut: false,
            })

            setShowProgress(false)
        }
    }

    const refreshClaims = () => {
        obtainCustomClaims().then((result) => {
            console.log("updated claims", result)
            firebase
                .auth()
                .currentUser.getIdTokenResult()
                .then((token) => {
                    console.log("token", token)
                })
        })
    }

    // const createUID = () => {
    //     console.log(generateUID())
    // }

    return (
        <>
            <SnackbarProvider maxSnack={3}>
                <AppBar position='static'>
                    <Toolbar>
                        <Typography variant='h6' className={classes.title}>
                            Sign In
                        </Typography>
                    </Toolbar>
                </AppBar>

                <EmailOTPLoginDialog open={isShowOTP} setOpen={setShowOTP} />

                <Box className={classes.loginBox}>
                    <Paper className={classes.pageContent}>
                        {/*
                         */}
                        <Grid container direction='column' className={classes.gridContainer}>
                            {isShowProgress && <LinearProgress />}

                            <Form>
                                <Grid container spacing={2} direction='column'>
                                    <Grid item>
                                        <Alert severity={signInStatus.severity}>
                                            <AlertTitle>{signInStatus.title}</AlertTitle>
                                            {signInStatus.message}
                                        </Alert>
                                    </Grid>

                                    {signInStatus.canSignIn && (
                                        <>
                                            <Grid item>
                                                <Typography variant='caption'>
                                                    You can sign in with a Google email address, or
                                                    any other email address
                                                </Typography>
                                            </Grid>

                                            <Grid item>
                                                <Controls.Button
                                                    text='Google Signin'
                                                    variant='outlined'
                                                    fullWidth={true}
                                                    size='small'
                                                    onClick={() => handleSignIn()}
                                                    disabled={!signInStatus.canSignIn}
                                                    startIcon={<FcGoogle />}
                                                >
                                                    Sign In with Google
                                                </Controls.Button>
                                            </Grid>

                                            <Divider />

                                            <Grid item>
                                                <Controls.Button
                                                    text='Email Signin'
                                                    variant='outlined'
                                                    size='small'
                                                    fullWidth={true}
                                                    onClick={() => handleEmailOTPSignIn()}
                                                    disabled={!signInStatus.canSignIn}
                                                    startIcon={<AiOutlineMail />}
                                                >
                                                    Sign In with Email
                                                </Controls.Button>
                                            </Grid>

                                            <Divider />
                                        </>
                                    )}

                                    <Grid item>
                                        <Controls.Button
                                            text='Get Started'
                                            onClick={() => handleGetStarted()}
                                            fullWidth={true}
                                            startIcon={<FiLogIn />}
                                            variant='contained'
                                            size='small'
                                            disabled={!signInStatus.canContinue}
                                        >
                                            Get Started
                                        </Controls.Button>
                                    </Grid>
                                </Grid>
                            </Form>

                        </Grid>

                    </Paper>
                </Box>

                <Box className={classes.leftPadded}>
                    {signInStatus.canSignUp && (
                        <Typography variant='caption' className={classes.leftPadded}>
                            Don't have an account?{" "}
                            <Link color='primary' className={classes.link} onClick={handleSignUp}>
                                Sign Up
                            </Link>
                        </Typography>
                    )}
                </Box>

                <Box className={classes.leftPadded}>
                    {signInStatus.canSignOut && (
                        <Typography variant='caption'>
                            <Link color='primary' className={classes.link} onClick={handleSignOut}>
                                Sign Out
                            </Link>
                        </Typography>
                    )}
                </Box>

                <Box className={classes.versionBox}>
                    <Box>
                        <Typography variant='caption' className={classes.versionNo}>
                            v{version}
                        </Typography>
                    </Box>
                </Box>

                <Box>
                    <Button onClick={forceReload}>Force reload</Button>
                    <Button onClick={refreshClaims}>Refresh user permissions</Button>
                </Box>
            </SnackbarProvider>
        </>
    )
}

export default SignIn
