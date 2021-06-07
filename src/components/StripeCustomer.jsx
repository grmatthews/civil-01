import React from 'react'
import { Grid, Paper, Typography } from '@material-ui/core'
import { Form } from './useForm'
import Controls from './controls/Controls'
import { makeStyles } from '@material-ui/core/styles'
import { secsToDateStr } from '../pages/services/dateServices'


const useStyles = makeStyles(theme => ({
    pageContent : {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(2),
        padding: theme.spacing(1),
        maxWidth: '320px',
    },
}))

const StripeCustomer = (props) => {

    const classes = useStyles()

    const { customer } = props

    return (
        <Paper className={classes.pageContent}>

            <Form>

                <Grid container direction='column'>

                    <Grid item>
                        <Typography variant='h6' gutterBottom={true} paragraph={true}>Stripe customer</Typography>
                    </Grid>

                    <Grid item>
                        <Controls.Readonly
                            name="name"
                            label="Name"
                            value={customer.name}
                            />
                    </Grid>

                    <Grid item>
                        <Controls.Readonly
                            name="email"
                            label="Email"
                            value={customer.email}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.Readonly
                            name="phone"
                            label="Phone"
                            value={customer.phone}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.Readonly
                            name="created"
                            label="Created"
                            value={secsToDateStr(customer.created)}
                        />
                    </Grid>

                </Grid>

            </Form>

        </Paper>
    )
}

export default StripeCustomer