/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'

export default function ComboBox(props) {

    const { name, label, value, onChange, items, variant='contained', disabled=false } = props

    const findInitialValue = () => {
        const matched = items.find(option => option.id === value)
        if(matched) {
            return matched
        }
        return { id: '', label: '(None)' }
    }

    const updateVal = (val) => {

        const selectedValue = val ? val.id : null
        const payload = {target : { name: name, value: selectedValue }}
        onChange(payload)
    }

    return (

        <Autocomplete
            getOptionLabel={(option) => option.label || ''}
            getOptionSelected={(option, value) => option.id === value.id }
            id={name}
            value={findInitialValue()}
            onChange={(_, newValue) => updateVal(newValue)}
            options={items}
            variant={variant}
            size='small'
            disabled={disabled}
            renderInput={(params) => 
            
                <TextField {...params} 
                    label={label}
                    size='small'
                />
            }
        />
  );
}