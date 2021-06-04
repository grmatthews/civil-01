import React from "react"

import { TextField } from "@material-ui/core"


function DatePicker(props) {

    const { name, label, value, onChange } = props

    return (
        <TextField style={{minWidth: 120 }}
            name={name}
            label={label}
            type="date"
            format={ 'dd/MMM/yyyy' }
            value={value}
            onChange={onChange}
            InputLabelProps={{
                shrink: true
            }}
          />
    )
}


export default DatePicker