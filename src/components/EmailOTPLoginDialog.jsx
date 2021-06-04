import React, { useState } from "react"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogContentText from "@material-ui/core/DialogContentText"
import DialogTitle from "@material-ui/core/DialogTitle"
import Controls from "./controls/Controls"
import { useForm, Form } from "./useForm"
import firebase from "firebase"
import { useSnackbar } from "notistack"
import { LinearProgress } from "@material-ui/core"

const EmailOTPLoginDialog = (props) => {
    const { open, setOpen } = props

    const [isShowProgress, setShowProgress] = useState(false)

    const { values, setValues, handleInputChange } = useForm({
        email: "",
        otp: "",
    })

    const { enqueueSnackbar } = useSnackbar()

    const handleClose = () => {
        setShowProgress(false)
        setOpen(false)
    }

    const handleOK = async () => {
        console.log("new values", values)

        if (values.otp === null || values.otp.length !== 6) {
            enqueueSnackbar("Enter 6-digit code", { variant: "warning" })
            return
        }

        setShowProgress(true)

        const validateOTPAndGetToken = firebase.functions().httpsCallable("validateOTPAndGetToken")

        const result = await validateOTPAndGetToken({
            email: values.email,
            otp: values.otp,
        })

        console.log("result", result)

        if (result.data.hasOwnProperty("token")) {
            firebase
                .auth()
                .signInWithCustomToken(result.data.token)
                .then((userCredential) => {
                    // Signed in
                    var user = userCredential.user
                    console.log("user", user)
                })
                .catch((error) => {
                    console.log("Error signing in", error)
                })

            setShowProgress(false)
            setOpen(false)
        } else {
            enqueueSnackbar('One time password login failed', { variant: 'info'})
            setShowProgress(false)
            setOpen(false)
        }
    }

    const submitOnEnter = (event) => {
        if (event.key === "Enter") {
            event.preventDefault()
            handleOK()
        }
    }

    const handleRequestOTP = () => {
        console.log("Request OTP")

        // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
        const match = values.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

        console.log("email match", match)

        if (match !== null) {
            const createAndSendOTP = firebase.functions().httpsCallable("createAndSendOTP")
            createAndSendOTP({ email: values.email })
            enqueueSnackbar("A 6-digit code is being emailed to you. Check your inbox", {
                variant: "success",
            })
        } else {
            enqueueSnackbar("Enter a valid email address", { variant: "warning" })
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} aria-labelledby='email-signin'>
            {isShowProgress && <LinearProgress />}
            <DialogTitle id='email-signin-dialog'>Email Signin</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Enter your email address, get and enter a 6-digit code, and then click OK to
                    login.
                </DialogContentText>
                <Form>
                    {values && (
                        <>
                            <Controls.TextInput
                                autoFocus
                                name='email'
                                label='Email'
                                value={values.email}
                                onChange={(event) => handleInputChange(event)}
                                onKeyPress={(event) => submitOnEnter(event)}
                                disabled={isShowProgress}
                            />

                            <Controls.Button
                                onClick={handleRequestOTP}
                                text='Get 6-digit code'
                                size='small'
                                disabled={isShowProgress}
                            />

                            <Controls.TextInput
                                name='otp'
                                label='6-digit code'
                                value={values.otp}
                                onChange={(event) => handleInputChange(event)}
                                onKeyPress={(event) => submitOnEnter(event)}
                                disabled={isShowProgress}
                            />
                        </>
                    )}
                </Form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color='primary'>
                    Cancel
                </Button>
                <Button
                    onClick={handleOK}
                    color='primary'
                    variant='contained'
                    disabled={isShowProgress}
                >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EmailOTPLoginDialog
