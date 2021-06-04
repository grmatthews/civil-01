import { FormControl, InputLabel, MenuItem, Select as MuiSelect } from "@material-ui/core"
import React from "react"

export default function Select(props) {

    const { name, label, value, onChange, options, variant='standard', disabled=false, ...other } = props

    return (

        <FormControl style={{minWidth: 120}} variant={variant}>
            <InputLabel htmlFor={name}>{label}</InputLabel>
            <MuiSelect
                name={name} 
                id={name}
                label={label}
                value={value === undefined ? '' : value}
                onChange={onChange} 
                autoWidth={true}
                disabled={disabled}
                {...other}
                >
                    <MenuItem key="-1" value="">None</MenuItem>

                    {
                        options.map(
                            item => (<MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>)
                        )
                    }

            </MuiSelect>
        </FormControl>
    )
}