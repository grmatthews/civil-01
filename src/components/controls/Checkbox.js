import React from "react"
import { FormControl, FormControlLabel, Checkbox as MuiCheckbox } from '@material-ui/core'

function Checkbox(props) {

    const { name, label, value, onChange } = props

    const convertToDefaultEventParams = (name, value) => ({
        target: {
            name, value
        }
    })

    //console.log("checkbox", label, value)

    return (
        <FormControl>
            <FormControlLabel
                control={
                    <MuiCheckbox
                        name={name}
                        color='primary'
                        checked={value}
                        onChange={ e => onChange(convertToDefaultEventParams(name, e.target.checked))}/>
                }
                label={label}
            />
        </FormControl>
    )
}

export default Checkbox