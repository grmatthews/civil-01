import React from 'react'
import { Grid, Paper, Typography } from '@material-ui/core'
import { Form } from './useForm'
import Controls from './controls/Controls'
import { makeStyles } from '@material-ui/core/styles'
import { formatAmount } from '../pages/services/formatting'
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

const StripeInvoice = (props) => {

    const classes = useStyles()

    const { invoice } = props

    return (
        <Paper className={classes.pageContent}>
            <Form>
                <Grid container direction='column'>
                    <Grid item>
                        <Typography variant='h6'>Upcoming Invoice {formatAmount(invoice.amount_due)}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant='caption' gutterBottom={true} paragraph={true}>{invoice.status}</Typography>
                    </Grid>


                    <Grid item>
                        <Controls.Readonly
                            name="subtotal"
                            label="Subtotal"
                            value={`${invoice.currency} ${formatAmount(invoice.subtotal)}`}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.Readonly
                            name="tax"
                            label="Tax"
                            value={`${invoice.currency} ${formatAmount(invoice.tax)}`}
                        />
                    </Grid>  

                    <Grid item>
                        <Controls.Readonly
                            name="amount_due"
                            label="Amount Due"
                            value={`${invoice.currency} ${formatAmount(invoice.amount_due)}`}
                        />
                    </Grid>                     

                    <Grid item>
                        <Controls.Readonly
                            name="invoice_period"
                            label="Period"
                            value={`${secsToDateStr(invoice.period_start)} - ${secsToDateStr(invoice.period_end)}`}
                        />
                    </Grid>

                    <Grid item>
                        <Controls.Readonly
                            name="invoice_next_payment_attempt"
                            label="Next Payment Attempt"
                            value={secsToDateStr(invoice.next_payment_attempt)}
                        />
                    </Grid>

                </Grid>
            </Form>
        </Paper>
    )
}

export default StripeInvoice