import React, { Fragment, useEffect, useState } from "react"
import Grid from "@material-ui/core/Grid"
import Controls from "../components/controls/Controls"
import { useForm, Form } from "../components/useForm"
import PhoneIcon from "@material-ui/icons/Phone"
import EmailIcon from "@material-ui/icons/Email"
import db from "../Firestore"
import { withSnackbar, useSnackbar } from "notistack"
import firebase from "firebase"

function ProfileForm() {
    const initialValues = {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
    }

    const [user, setUser] = useState()

    const [accountId, setAccountId] = useState()

    const { enqueueSnackbar } = useSnackbar()

    const { values, setValues, handleInputChange } = useForm(initialValues)

    useEffect(() => {
        const unsub = firebase.auth().onAuthStateChanged((user) => {
            console.log("user changed", user)
            setUser(user)
            user.getIdTokenResult(false)
                .then((token) => {
                    console.log("setting account id", token.claims.account_id)
                    setAccountId(token.claims.account_id)
                })
                .then(() => {
                    db.collection("users")
                        .doc(user.uid)
                        .get()
                        .then((docRef) => {
                            const userRec = docRef.data()

                            console.log("loaded user", userRec)
                            setValues(userRec)
                        })
                })
        })

        return unsub
    }, [])

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (values.first_name === "") {
            enqueueSnackbar("Enter first name", { variant: "error" })
        } else if (values.last_name === "") {
            enqueueSnackbar("Enter last name", { variant: "error" })
        } else {
            await db
                .collection("users")
                .doc(user.uid)
                .update(
                    {
                        first_name: values.first_name,
                        last_name: values.last_name,
                        email: values.email,
                        phone: values.phone,
                    },
                    { merge: true }
                )
                .then(enqueueSnackbar("Saved", { variant: "success" }))
                .catch(function (error) {
                    console.error("Error:" + error)
                    enqueueSnackbar("Error", { variant: "error " })
                })
        }
    }

    return (
        <Fragment>
            <Form>
                <Grid container direction='column'>
                    <Grid item>
                        <Controls.TextInput
                            name='first_name'
                            label='First Name'
                            value={values.first_name}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.TextInput
                            name='last_name'
                            label='Last Name'
                            value={values.last_name}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.Readonly
                            name='email'
                            label='Email'
                            value={values.email}
                            icon={<EmailIcon />}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.TextInput
                            name='phone'
                            label='Phone'
                            value={values.phone}
                            icon={<PhoneIcon />}
                            onChange={handleInputChange}
                        />
                    </Grid>
                </Grid>

                <Controls.Button type='submit' text='Save' onClick={handleSubmit} />
            </Form>
        </Fragment>
    )
}

export default withSnackbar(ProfileForm)
