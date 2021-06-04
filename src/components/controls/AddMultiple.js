import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Switch from "@material-ui/core/Switch"
import Grid from "@material-ui/core/Grid"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Box from "@material-ui/core/Box"

const useStyles = makeStyles((theme) => ({
    addMultiple: {
        margin: theme.spacing(1),
        padding: theme.spacing(1),
    },
}))

export default function AddMultiple(props) {
    const { addMultiple, setAddMultiple } = props

    const classes = useStyles()

    const toggleChecked = () => {
        setAddMultiple((prev) => !prev)
    }

    //console.log("AddMultiple props", props)

    return props.id === undefined ? (
        <Grid item className={classes.addMultiple}>
            <Box spacing={1}>
                <FormControlLabel
                    control={<Switch size='small' checked={addMultiple} onChange={toggleChecked} />}
                    label='Add Multiple'
                />
            </Box>
        </Grid>
    ) : null
}
