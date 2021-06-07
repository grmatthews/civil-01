import React, { Fragment } from "react"
import { makeStyles } from "@material-ui/core/styles"
import ProfileForm from "./ProfileForm"
import Header from "../components/Header"
import { Paper } from "@material-ui/core"
import { SnackbarProvider } from "notistack"
import { FirebaseAuthProvider } from "@react-firebase/auth"
import firebase from "firebase"
import { firebaseConfig } from "../Firestore"

const useStyles = makeStyles((theme) => ({
    pageContent: {
        margin: theme.spacing(2),
        padding: theme.spacing(2),
    },
}))

function ProfilePage() {

    const classes = useStyles()

    return (
        <Fragment>
            <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
                <Fragment>
                    <SnackbarProvider maxSnack={3}>
                        <Header title='Profile' />
                        <Paper className={classes.pageContent}>
                            <ProfileForm />
                        </Paper>
                    </SnackbarProvider>
                </Fragment>
            </FirebaseAuthProvider>
        </Fragment>
    )
}

export default ProfilePage
