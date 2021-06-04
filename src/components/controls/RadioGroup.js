import React from "react"
import { FormControl, FormControlLabel, FormHelperText, RadioGroup as MuiRadioGroup } from '@material-ui/core'
import Radio from '@material-ui/core/Radio'


const RadioGroup = (props) => {

    const { name, label, value, onChange, items } = props

    return (
        <FormControl>
            <FormHelperText>{label}</FormHelperText>
            <MuiRadioGroup row
                name={name}
                value={value}
                onChange={onChange}> 
                {
                    items.map(
                        (item) => (
                            <FormControlLabel key={item.id} value={item.id} control={<Radio/>} label={item.title}/>            
                        )
                    )
                }

            </MuiRadioGroup>
        </FormControl>
    )
}

export default RadioGroup