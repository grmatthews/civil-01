import React from "react"
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Input from '@material-ui/core/Input'
import { InputAdornment } from "@material-ui/core"

export default function TextInput(props) {

    const { name, label, value, onChange, helperText, multiline=false, rows=1, disabled=false, icon, ...other } = props

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
                multiline={multiline}
                rows={rows}
                disabled={disabled}
                onChange={onChange} 
                aria-describedby={helperTextId}
                {...other}
                onFocus={event => {
                    event.target.select();
                  }}
                />
            <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
        </FormControl>
    )
}