import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Backdrop, CircularProgress } from '@material-ui/core'


const useStyles = makeStyles((theme) => ({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
  }));

const ProgressBackdrop = (props) => {

    const classes = useStyles()

    const [isOpen, setOpen] = useState(props.open)

    const handleClose = () => {
        setOpen(false)
    }

    useEffect(() => {
        setOpen(props.open)
    },[props.open])

    return (

        <Backdrop className={classes.backdrop} open={isOpen} onClick={handleClose}>
                <CircularProgress color="inherit" />
        </Backdrop>
    )
}

export default ProgressBackdrop