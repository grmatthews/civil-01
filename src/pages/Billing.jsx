import React, { Fragment, useState } from "react"
import { makeStyles } from "@material-ui/core/styles"
import BillingForm from "../components/BillingForm"
import Header from "../components/Header"
import { useId } from "./useId"

const useStyles = makeStyles((theme) => ({
    pageContent: {
        margin: theme.spacing(2),
        padding: theme.spacing(2),
    },
}))

function Billing(props) {
    const classes = useStyles()

    let { id } = useId(props)

    const [title, setTitle] = useState("Billing")

    return (
        <Fragment>
            <Header title={title} />

            <BillingForm accountId={id} setTitle={setTitle} />

        </Fragment>
    )
}

export default Billing
