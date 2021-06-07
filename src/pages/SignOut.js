import React, { useEffect, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Header from "../components/Header"
import { Link, Typography } from "@material-ui/core"
import { useHistory } from "react-router-dom"
import firebase from "firebase"
import { Alert, AlertTitle } from "@material-ui/lab"

const useStyles = makeStyles((theme) => ({
    pageContent: {
        margin: theme.spacing(2),
        padding: theme.spacing(2),
    },
    leftPadded: {
        marginLeft: theme.spacing(2),
    },
    link: {
        cursor: "pointer",
    },
}))

function SignOut() {
    const classes = useStyles()

    const history = useHistory()

    const handleSignIn = () => {
        history.push("/SignIn")
    }

    const [signedIn, setSignedIn] = useState(false)

    useEffect(() => {
        const unsub = firebase.auth().onAuthStateChanged((user) => {
            console.log("user", user)

            setSignedIn(user !== undefined && user !== null)
        })

        return unsub
    }, [])

    firebase.auth().signOut()

    return (
        <>
            <Header title='Sign Out' />

            {signedIn && (
                <Alert severity='info' className={classes.pageContent}>
                    <AlertTitle>Sign Out Status</AlertTitle>
                    You are still signed in
                </Alert>
            )}

            {!signedIn && (
                <Alert severity='success' className={classes.pageContent}>
                    <AlertTitle>Sign Out Status</AlertTitle>
                    You are signed out
                </Alert>
            )}

            <Typography variant='caption' className={classes.leftPadded}>
                <Link color='primary' className={classes.link} onClick={handleSignIn}>
                    Sign In again...
                </Link>
            </Typography>
        </>
    )
}

export default SignOut
