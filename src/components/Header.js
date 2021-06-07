import React, { useState, useEffect } from "react"
import AppBar from "@material-ui/core/AppBar"
import { fade, makeStyles, useTheme } from "@material-ui/core/styles"
import { NavLink, Link } from "react-router-dom"
import Typography from "@material-ui/core/Typography"
import Toolbar from "@material-ui/core/Toolbar"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import Drawer from "@material-ui/core/Drawer"
import Divider from "@material-ui/core/Divider"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import Collapse from "@material-ui/core/Collapse"
import ListItemText from "@material-ui/core/ListItemText"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ChevronRightIcon from "@material-ui/icons/ChevronRight"
import ConfigIcon from "@material-ui/icons/Settings"
import CreateIcon from "@material-ui/icons/Create"
import DashboardIcon from "@material-ui/icons/Dashboard"
import IconButton from "@material-ui/core/IconButton"
import AccountCircle from "@material-ui/icons/AccountCircle"
import ExpandLess from "@material-ui/icons/ExpandLess"
import ExpandMore from "@material-ui/icons/ExpandMore"
import MenuIcon from "@material-ui/icons/Menu"
import clsx from "clsx"
import firebase from "firebase"
import * as Icons from "../icons"
import { pink } from "@material-ui/core/colors"

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        display: "flex",
    },
    link: {
        textDecoration: "none",
        color: theme.palette.text.primary,
    },
    appBar: {
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    profileButton: {
        marginRight: theme.spacing(2),
        paddingTop: theme.spacing(2),
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    drawerHeader: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: "flex-end",
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(1),
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
    title: {
        flexGrow: 1,
        display: "none",
        [theme.breakpoints.up("sm")]: {
            display: "block",
        },
    },
    search: {
        position: "relative",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            marginLeft: theme.spacing(1),
            width: "auto",
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: "100%",
        position: "absolute",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    nested: {
        paddingLeft: theme.spacing(4),
    },
    inputRoot: {
        color: "inherit",
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            width: "12ch",
            "&:focus": {
                width: "20ch",
            },
        },
    },
    accountsIcon: {
        color: pink[600],
    },
}))

function Header(props) {
    const classes = useStyles()

    const [profileMenuEl, setProfileMenuEl] = useState(null)

    const theme = useTheme()

    const [open, setOpen] = useState(false)

    const [newOpen, setNewOpen] = useState(false)

    const [configOpen, setConfigOpen] = useState(false)

    const isProfileMenuOpen = Boolean(profileMenuEl)

    const handleDrawerOpen = () => {
        setOpen(true)
    }

    const toggleNewMenuOpen = () => {
        setNewOpen(!newOpen)
    }

    const toggleConfigMenuOpen = () => {
        setConfigOpen(!configOpen)
    }

    const handleDrawerClose = () => {
        setOpen(false)
    }

    const handleProfileMenuOpen = (event) => {
        setProfileMenuEl(event.currentTarget)
    }

    const handleProfileMenuClose = () => {
        setProfileMenuEl(null)
    }

    const [myAccountId, setMyAccountId] = useState("")

    const billingURL = () => `/Billing/${myAccountId}`

    useEffect(() => {
        if (firebase.auth().currentUser) {
            firebase
                .auth()
                .currentUser.getIdTokenResult(true)
                .then((idToken) => setMyAccountId(idToken.claims.account_id))
        }
    }, [])

    const [claims, setClaims] = useState({
        account_type: "",
    })

    useEffect(() => {
        if (firebase.auth().currentUser) {
            firebase
                .auth()
                .currentUser.getIdTokenResult()
                .then((token) => {
                    const newClaims = {
                        roles: token.claims.roles,
                        account_id: token.claims.account_id,
                        account_type: token.claims.account_type,
                        system_role: token.claims.system_role,
                    }

                    setClaims(newClaims)
                })
        }
    }, [])

    const isAdmin = () => {
        if (claims === undefined || claims.roles === undefined) {
            return false
        }
        return claims && claims.roles.includes("admin")
    }

    const isSystem = () => {
        const isSystemRole = claims.hasOwnProperty("system_role") && claims.system_role === true
        return isSystemRole
    }

    const configItemData = [
        {
            label: "Job Types",
            uri: "/jobtypes",
            canAccess: () => true,
        },
        {
            label: "Supplier Document Types",
            uri: "/supplierdoctypes",
            canAccess: () => true,
        },
    ]

    const profileMenuId = "profile-menu"

    const drawItemData = [
        {
            label: "Dashboard",
            uri: "/Dashboard",
            icon: <DashboardIcon />,
            canAccess: () => true,
        },
        {
            label: "DIVIDER",
            canAccess: () => true,
        },
    ]

    const drawerItems = () => {
        return drawItemData
            .filter((item) => item.canAccess())
            .map((item, index) =>
                "DIVIDER" === item.label ? (
                    <Divider key={"menuitems-" + index} />
                ) : (
                    <Link to={item.uri} className={classes.link} key={item.uri}>
                        <ListItem button key={item.label}>
                            {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
                            <ListItemText primary={item.label} />
                        </ListItem>
                    </Link>
                )
            )
    }

    const createMenuItems = (menuData) => {
        return menuData
            .filter((item) => item.canAccess())
            .map((item, index) =>
                "DIVIDER" === item.label ? (
                    <Divider key={"menuitems-" + index} />
                ) : (
                    <Link to={item.uri} className={classes.link} key={item.uri}>
                        <ListItem button key={item.label}>
                            {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
                            <ListItemText primary={item.label} />
                        </ListItem>
                    </Link>
                )
            )
    }

    // Options under the 'Create' menu item
    const createItems = () => {
        return drawItemData
            .filter((item) => item.create_uri)
            .filter((item) => item.canCreate())
            .map((item) => (
                <Link to={item.create_uri} className={classes.link} key={item.create_uri}>
                    <ListItem button className={classes.nested} key={item.create_uri + "-item"}>
                        <ListItemIcon>
                            {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
                        </ListItemIcon>
                        <ListItemText primary={item.create_label} />
                    </ListItem>
                </Link>
            ))
    }

    const profileMenu = (
        <Menu
            anchorEl={profileMenuEl}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            id={profileMenuId}
            keepMounted
            open={isProfileMenuOpen}
            onClose={handleProfileMenuClose}
        >
            <MenuItem onClick={handleProfileMenuClose}>
                <NavLink to='/Signout' className={classes.link}>
                    Signout
                </NavLink>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
                <NavLink to='/Profile' className={classes.link}>
                    Profile
                </NavLink>
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose}>
                <NavLink to={() => billingURL()} className={classes.link}>
                    Billing
                </NavLink>
            </MenuItem>
        </Menu>
    )

    return (
        <div className={classes.root}>
            <AppBar
                position='fixed'
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        edge='start'
                        className={classes.menuButton}
                        color='inherit'
                        aria-label='open drawer'
                        onClick={handleDrawerOpen}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography className={classes.title} variant='h6' noWrap>
                        {props.title}
                    </Typography>

                    {/*
            <SearchBar/>
            */}

                    <MenuItem>
                        <IconButton
                            className={classes.profileButton}
                            aria-label='account of current user'
                            aria-controls='primary-search-account-menu'
                            aria-haspopup='true'
                            color='inherit'
                            onClick={handleProfileMenuOpen}
                        >
                            <AccountCircle />
                        </IconButton>
                    </MenuItem>

                    <MenuItem>
                        {/*
            <Badge badgeContent={4} color="secondary">
              <BuildIcon />
            </Badge>
            */}
                    </MenuItem>
                </Toolbar>
            </AppBar>
            <Drawer
                className={classes.drawer}
                variant='persistent'
                anchor='left'
                open={open}
                classes={{
                    paper: classes.drawerPaper,
                }}
            >
                <div className={classes.drawerHeader}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </div>

                <Divider key='divider' />

                <List>
                    <ListItem button onClick={toggleNewMenuOpen}>
                        <ListItemIcon>
                            <CreateIcon />
                        </ListItemIcon>
                        <ListItemText primary='Create' />
                        {newOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>

                    <Collapse in={newOpen} timeout='auto' unmountOnExit>
                        <List disablePadding>{createItems()}</List>
                    </Collapse>

                    <Divider />

                    {drawerItems()}

                    <ListItem button onClick={toggleConfigMenuOpen}>
                        <ListItemIcon>
                            <ConfigIcon />
                        </ListItemIcon>
                        <ListItemText primary='Config' />
                        {configOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>

                    <Collapse in={configOpen} timeout='auto' unmountOnExit>
                        <List disablePadding>{createMenuItems(configItemData)}</List>
                    </Collapse>
                </List>
            </Drawer>
            {profileMenu}
            <main
                className={clsx(classes.content, {
                    [classes.contentShift]: open,
                })}
            >
                <div className={classes.drawerHeader} />
            </main>
        </div>
    )
}

export default Header
