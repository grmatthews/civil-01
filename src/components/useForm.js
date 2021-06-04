import React, {useState} from "react"
import { makeStyles } from '@material-ui/core/styles'
import _ from 'lodash'

export function useForm(initialValues) {

    const [values, setValues] = useState(initialValues)

    const handleInputChange = e => { 

        const { name,value} = e.target
        const newValues = {
            ...values
        }
        // handle input field names with a dot in them, allowing updates to nested JSON object
        _.set(newValues, name, value)
        setValues(newValues)
    }

    return {
        values,
        setValues,
        handleInputChange
    }
}

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiFormControl-root': {
            width: '90%',
            margin: theme.spacing(0.8)
        }
    }
}))

export function Form(props) {

    const classes = useStyles();

    return (
        <form className={classes.root} autoComplete="off">
            {props.children}
        </form>
    )
}
