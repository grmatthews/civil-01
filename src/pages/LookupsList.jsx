import React, { useEffect, useState } from "react"
import * as dataServices from "../pages/services/dataServices"
import db from "../Firestore"
import { makeStyles } from "@material-ui/core/styles"
import {
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
} from "@material-ui/core"
import Controls from "./controls/Controls"
import DeleteIcon from "@material-ui/icons/Delete"
import AddCircleIcon from "@material-ui/icons/AddCircle"
import { useHistory, withRouter } from "react-router-dom"
import { useForm, Form } from "./useForm"
import { useSnackbar } from "notistack"
import firebase from "firebase"

// single form value
const initialValues = () => {
    return {
        lookup_value: "",
    }
}

const useStyles = makeStyles((theme) => ({
    buttons: {
        marginTop: theme.spacing(2),
    },
    addButton: {
        marginTop: theme.spacing(2),
    },
}))

const LookupsList = (props) => {
    const { lookupType } = props

    // The whole lookup value being edited, incl. name, and values attribute
    const [lookup, setLookup] = useState({
        name: lookupType,
        lookup_values: [],
    })

    const COLLECTION_NAME = "lookups"

    // Form values, e.g. the lookup 'name' attribute
    const { values, setValues, handleInputChange } = useForm(initialValues())

    const [maxCreated, setMaxCreated] = useState()

    const classes = useStyles()

    const history = useHistory()

    const { enqueueSnackbar } = useSnackbar()

    const [user, setUser] = useState()

    const [accountId, setAccountId] = useState()

    useEffect(() => {
        const unsub = firebase.auth().onAuthStateChanged((user) => {
            console.log("### user changed", user)
            setUser(user)
            user.getIdTokenResult(false).then((token) => {
                console.log("### setting account id", token.claims.account_id)
                setAccountId(token.claims.account_id)

                setLookup({
                    name: lookupType,
                    account_id: token.claims.account_id,
                    lookup_values: [],
                })
            })
        })

        return unsub
    }, [])

    const handleCancel = (event) => {
        event.preventDefault()
        history.goBack()
    }

    const handleAddNewLookupValue = (event) => {
        event.preventDefault()

        if (values.lookup_value.trim() === "") {
            enqueueSnackbar("Enter value", { variant: "info" })
            return
        }

        if (lookup.lookup_values.includes(values.lookup_value.trim())) {
            enqueueSnackbar("Value already exists", { variant: "info" })
            return
        }

        const newLookupValues = [values.lookup_value.trim(), ...lookup.lookup_values]

        const newLookup = {
            ...lookup,
            lookup_values: [...newLookupValues],
        }

        setLookup(newLookup)

        // Clear out entry form ready for next lookup to be entered
        setValues(initialValues)
    }

    // Save

    const handleSaveLookupValues = async (event) => {
        event.preventDefault()

        console.log("Updating lookup", lookupType, lookup.id)

        await db.collection("lookups").doc(lookup.id).set({
            name: lookup.name,
            account_id: lookup.account_id,
            created: lookup.created,
            modified: dataServices.serverTimestamp(),
            lookup_values: lookup.lookup_values.sort(),
        })

        enqueueSnackbar("Updated", { variant: "success" })
    }

    const handleDeleteLookupValue = (value) => {
        console.log("delete lookup value", value)
        const newLookupValues = lookup.lookup_values.filter((item) => item !== value)

        const newLookup = {
            ...lookup,
            lookup_values: newLookupValues,
        }

        console.log("after delete value", newLookup)
        setLookup(newLookup)
    }

    const getFirstRecord = (lookupResults) => {
        if (lookupResults.length > 0) {
            setLookup(lookupResults[0])
        }
    }

    // Load lookup values. Create lookup if it doesn't exist

    useEffect(() => {
        if (user === undefined || accountId === undefined) {
            return
        }

        console.log("Loading lookup values", { maxCreated, user, accountId })

        let query = db
            .collection(COLLECTION_NAME)
            .where("account_id", "==", accountId)
            .where("name", "==", lookupType)
            .limit(1)

        dataServices.loadData("(Load lookup values)", query).then((result) => {
            if (result.length === 0) {
                console.log("lookup does not exist. will create", { lookupType })

                const newLookup = {
                    name: lookup.name,
                    account_id: accountId,
                    created: dataServices.serverTimestamp(),
                    modified: dataServices.serverTimestamp(),
                    lookup_values: lookup.lookup_values.sort(),
                }

                console.log("Create blank lookup list", newLookup)

                db.collection(COLLECTION_NAME).add(newLookup)
                setLookup(newLookup)
            } else {
                console.log("loaded lookup", result)
                getFirstRecord(result)
            }
        })
    }, [maxCreated, user, accountId])

    return (
        <>
            <Form>
                <Grid container direction='row'>
                    <Grid item xs={9} sm={6}>
                        <Controls.TextInput
                            autoFocus
                            name='lookup_value'
                            label='Value'
                            value={values.lookup_value}
                            onChange={handleInputChange}
                        />
                    </Grid>

                    <Grid item xs={1}>
                        <IconButton
                            aria-label='add'
                            aria-haspopup='false'
                            onClick={handleAddNewLookupValue}
                            className={classes.addButton}
                        >
                            <AddCircleIcon />
                        </IconButton>
                    </Grid>
                </Grid>

                <Grid item xs={11} sm={7}>
                    <List>
                        {lookup.lookup_values.map((lookupValue) => (
                            <ListItem key={lookupValue}>
                                <ListItemText primary={lookupValue} />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge='start'
                                        aria-label='delete'
                                        onClick={() => handleDeleteLookupValue(lookupValue)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                <Grid item className={classes.buttons}>
                    <Controls.Button type='submit' text='Save' onClick={handleSaveLookupValues} />
                    <Controls.Button text='Cancel' color='default' onClick={handleCancel} />
                </Grid>
            </Form>
        </>
    )
}

export default withRouter(LookupsList)
