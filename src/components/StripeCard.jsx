import React, { useState } from "react"
import { Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import CreditCardIcon from "@material-ui/icons/CreditCard"
import MoreVertIcon from "@material-ui/icons/MoreVert"
import { Card } from "@material-ui/core"
import { CardHeader } from "@material-ui/core"
import { IconButton } from "@material-ui/core"
import { CardContent } from "@material-ui/core"
import { Menu } from "@material-ui/core"
import { ListItemIcon } from "@material-ui/core"
import EditIcon from "@material-ui/icons/Edit"
import DeleteIcon from "@material-ui/icons/Delete"
import { MenuItem } from "@material-ui/core"
import CreditCardEditDialog from "./CreditCardEditDialog"

const useStyles = makeStyles((theme) => ({
    pageContent: {
        marginTop: theme.spacing(1),
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(2),
        padding: theme.spacing(1),
        maxWidth: "320px",
    },
    defaultCardMsg: {
        marginTop: theme.spacing(1),
    }
}))

const StripeCard = (props) => {
    const classes = useStyles()

    const { card, updateCard } = props

    const [cardAnchorEl, setCardAnchorEl] = useState(null)

    const handleEditCard = () => {
        handleCardMenuClose()
        setShowCardEditDialog(true)
    }

    const handleDeleteCard = () => {}

    const handleCardMenuClose = () => {
        setCardAnchorEl(null)
    }

    const [showCardEditDialog, setShowCardEditDialog] = useState(false)

    return (
        <>
            <CreditCardEditDialog
                open={showCardEditDialog}
                setOpen={setShowCardEditDialog}
                values={card}
                updateCard={updateCard}
            />

            <Card className={classes.pageContent}>
                <CardHeader
                    avatar={<CreditCardIcon color={card.is_default ? "secondary" : "default"} />}
                    disableTypography={true}
                    action={
                        <IconButton
                            aria-label='settings'
                            aria-controls='card-menu'
                            aria-haspopup='true'
                            onClick={(event) => setCardAnchorEl(event.target)}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    }
                    title={
                        <Typography variant='body2'>
                            {card.brand} {card.last4}
                        </Typography>
                    }
                    subheader={
                        <>
                            <Typography variant='caption'>
                                Expiry {card.exp_month}/{card.exp_year}
                            </Typography>
                        </>
                    }
                />

                <CardContent>
                    <Typography variant='body2'>{card.billing_details.name}</Typography>
                    <Typography variant='body2'>{card.billing_details.email}</Typography>
                    <Typography variant='body2'>{card.billing_details.phone}</Typography>
                    <Typography variant='body2'>{card.billing_details.address.line1}</Typography>
                    <Typography variant='body2'>{card.billing_details.address.line2}</Typography>
                    <Typography variant='body2'>{card.billing_details.address.city}</Typography>
                    <Typography variant='body2'>
                        {card.billing_details.address.state}{" "}
                        {card.billing_details.address.postal_code}{" "}
                        {card.billing_details.address.country}
                    </Typography>{" "}
                    {card.is_default && (
                        <Typography variant='body2' className={classes.defaultCardMsg}>
                            (Default card)
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {cardAnchorEl && (
                <Menu
                    id='card-menu'
                    anchorEl={cardAnchorEl}
                    keepMounted
                    open={cardAnchorEl !== null}
                    onClose={handleCardMenuClose}
                >
                    <MenuItem onClick={(event) => handleEditCard(event)}>
                        <ListItemIcon>
                            <EditIcon fontSize='small' />
                        </ListItemIcon>
                        Edit
                    </MenuItem>
                    <MenuItem onClick={(event) => handleDeleteCard(event)}>
                        <ListItemIcon>
                            <DeleteIcon fontSize='small' />
                        </ListItemIcon>
                        Delete
                    </MenuItem>
                </Menu>
            )}
        </>
    )
}

export default StripeCard
