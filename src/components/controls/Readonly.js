import React from "react"
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Input from '@material-ui/core/Input'
import { InputAdornment } from "@material-ui/core"

export default function Readonly(props) {

    const { name, label, value, helperText, icon } = props

    const helperTextId = name + '_helper_text'

    return (

        <FormControl>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <Input
                name={name} 
                id={name}
                startAdornment={
                    (icon != null) ?
                        <InputAdornment position='start'>{icon}</InputAdornment> : null
                }
                value={value}
                disabled={true}
                aria-describedby={helperTextId} />
            <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
        </FormControl>
    )
}