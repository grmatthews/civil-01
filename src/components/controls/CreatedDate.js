import React from "react"
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Input from '@material-ui/core/Input'
import * as moment  from 'moment'

export default function CreatedDate(props) {

    const { name, label, value, onChange, helperText } = props

    const helperTextId = name + '_helper_text'

    return (

        <FormControl>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <Input
                name={name} 
                id={name}
                value={moment(value.toDate()).format('D-MMM-yyyy hh:mm a')}
                disabled={true}
                onChange={onChange} 
                aria-describedby={helperTextId} />
            <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
        </FormControl>
    )
}