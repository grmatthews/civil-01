import React, { useState, useEffect } from "react"
import { getAvailableActions } from "../workOrderStatus"
import firebase from "firebase"
import { MenuItem } from "@material-ui/core"
import { Menu } from "@material-ui/core"
import Controls from "./Controls"

const ChangeWorkOrderStatusButton = (props) => {
    const { handleStatusChange, values, id } = props

    // true => if a supplier is logged in and viewing this page. They only see their actions
    const [isSupplierViewing, setSupplierViewing] = useState(false)

    const [statusMenuItems, setStatusMenuItems] = useState([])

    const [userRoles, setUserRoles] = useState([])

    const [statusMenuEl, setStatusMenuEl] = useState(null)

    const isStatusMenuOpen = Boolean(statusMenuEl)

    const isManagedSupplier = () => !values.hasOwnProperty("supplier_account_id")

    useEffect(() => {
        const unsub = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                user.getIdTokenResult(false).then((token) => {
                    setUserRoles(token.claims.roles)
                })
            }
        })

        return unsub
    }, [])

    useEffect(() => {
        if (firebase.auth().currentUser) {
            firebase
                .auth()
                .currentUser.getIdTokenResult()
                .then((token) => {
                    setSupplierViewing(token.claims.account_type === "supplier")
                })
        }
    }, [])

    useEffect(() => {
        if (values) {
            console.log("is managed supplier?", isManagedSupplier())
            const actions = getAvailableActions(
                userRoles,
                isSupplierViewing,
                () => isManagedSupplier(),
                values.status,
                id
            )

            const menuItems = actions.map((action) => (
                <MenuItem
                    onClick={() => {
                        handleStatusMenuClose()
                        handleStatusChange(action.to, action.action, id)
                    }}
                    key={action.label}
                >
                    {action.label}
                </MenuItem>
            ))

            if (menuItems.length === 0) {
                menuItems.push(<MenuItem>No status changes available</MenuItem>)
            }

            setStatusMenuItems(menuItems)
        }
    }, [values])

    const handleStatusMenuOpen = (event) => {
        setStatusMenuEl(event.currentTarget)
    }

    const handleStatusMenuClose = () => {
        setStatusMenuEl(null)
    }

    return (
        <>
            <Controls.Button type='button' text='Change Status' onClick={handleStatusMenuOpen} />

            <Menu
                anchorEl={statusMenuEl}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                getContentAnchorEl={null}
                id={"status-menu"}
                keepMounted
                open={isStatusMenuOpen}
                onClose={handleStatusMenuClose}
            >
                {statusMenuItems}
            </Menu>
        </>
    )
}

export default ChangeWorkOrderStatusButton
