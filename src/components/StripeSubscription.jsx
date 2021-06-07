import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, Grid, Paper, Typography } from '@material-ui/core'
import { Form } from './useForm'
import Controls from './controls/Controls'
import { makeStyles } from '@material-ui/core/styles'
import { formatAmount } from '../pages/services/formatting'
import { secsToDateStr } from '../pages/services/dateServices'
import { getStripeProducts, getStripePlan } from '../pages/services/stripeServices'
import * as Icons from '../icons'


const useStyles = makeStyles(theme => ({
    pageContent : {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(2),
        padding: theme.spacing(1),
        maxWidth: '320px',
    },
    product : {
        margin: theme.spacing(1),
    }
}))

const StripeSubscription = (props) => {

    const classes = useStyles()

    const { subscription } = props

    const [products, setProducts] = useState([])

    const [subscriptionItems, setSubscriptionItems] = useState([])

    const [plans, setPlans] = useState([])


    useEffect(() => {

        //console.log('loading plans for subscription', subscription)

        const planIds = subscription.items.data.map(item => item.plan.id)

        //console.log('retrieve plan ids', planIds)

        const plans = planIds.map(planId => getStripePlan(planId))

       //console.log('retrieve plan result', plans)

       Promise.all(plans)
       .then(planResult => {
           //console.log('plan result', planResult)

           setPlans(planResult.map(plan => plan.data))

        })
        .then(() => {

            const productIds = subscription.items.data.map(item => item.plan.product)

            //console.log('product ids', productIds)
    
            getStripeProducts({product_ids: productIds})
            .then(products => {
                //console.log('retrieved products', products)
                setProducts(products.data)
            })

        })
       

    }, [subscription])



    const getSubscriptionItemDescription = (item) => {

        //console.log('get item description', item)

        switch(item.price.billing_scheme) {
    
            case 'tiered':
                const plan = plans.find(plan => plan.id === item.price.id)

                if(plan === undefined) {
                    return 'tiered'
                }
                //console.log('plan tiers', plan)

                const tierLabels = plan.tiers.map(tier => {

                    if(tier.up_to === null) {
                        return `and then ${formatAmount(tier.unit_amount_decimal)} each from then on`
                    } else {
                        return `${formatAmount(tier.unit_amount_decimal)} each up to ${tier.up_to}`
                    }
                })
                const label = tierLabels.join(', ')
                

                const tiered =  `qty ${item.quantity} with tiered pricing - ${label}`
                return tiered

            case 'per_unit':
                return `qty ${item.quantity} @ ${formatAmount(item.price.unit_amount)} per unit`

            default:
                return `Unknown billing scheme: ${item.price.billing_scheme}`
        }
    }


    useEffect(() => {

        const subItems = 
        
        <Grid container spacing={2}>
            {subscription.items.data.map(item => {

               const product = products.find(pr => pr.id === item.price.product)
               const productName = product ? product.name : item.price.product

                return (
    
                <Grid container spacing={2} key={item.id}>
            
                    <Grid item xs={12}>
                        <Card className={classes.product} elevation={0}>
                            <CardContent>
                                <Typography variant='body2'>{productName}</Typography>
                                <Typography variant='caption'>
                                    {
                                    getSubscriptionItemDescription(item)
                                    }
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
            
                </Grid>
                )
            }
            )}
        </Grid>
        
        setSubscriptionItems(subItems)

    }, [products, plans, subscription])

   

    return (
        <Paper className={classes.pageContent}>
        <Form>
            <Grid container direction='column'>
                <Grid item>
                    <Typography variant='h6' gutterBottom={true} paragraph={true}>Subscription</Typography>
                </Grid>

                <Grid item>
                    <Controls.Readonly
                        name="subscription_period"
                        label="Period"
                        value={`${secsToDateStr(subscription.current_period_start)} - ${secsToDateStr(subscription.current_period_end)}`}
                        />
                </Grid>

                <Grid item>
                    <Controls.Readonly
                        name="status"
                        label="Status"
                        value={subscription.status}
                        />
                </Grid>

                <Grid item>
                    {subscriptionItems}
                </Grid>

                {/*               
                <Grid item>
                    <Controls.Readonly
                        name="unit_amount"
                        label="Unit Amount"
                        value={`${subscription.currency} ${formatAmount(subscription.amount)} ${subscription.billing_scheme}`}
                        />
                </Grid>

                <Grid item>
                    <Controls.Readonly
                        name="tax_rate"
                        label="Tax Rate"
                        value={`${subscription.tax_rate}%`}
                        />
                </Grid>

                <Grid item>
                    <Controls.Readonly
                        name="quantity"
                        label="Quantity"
                        value={subscription.quantity}
                        />
                </Grid>


                <Grid item>
                    <Controls.Readonly
                        name="trial_period"
                        label="Trial Period"
                        value={`${secsToDateStr(subscription.trial_start)} - ${secsToDateStr(subscription.trial_end)}`}
                        />
                </Grid>
                  */}

            </Grid>
        </Form>
        </Paper>
    )
}

export default StripeSubscription