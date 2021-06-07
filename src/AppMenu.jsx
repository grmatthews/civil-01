import React from "react"
import { Switch, Route, HashRouter } from "react-router-dom"
import "./index.css"
import App from "./App"
import SignIn from "./pages/SignIn"
import SignOut from "./pages/SignOut"
import SignUp from "./pages/SignUp"
import Page2 from "./pages/Page2"
import Dashboard from "./pages/Dashboard"
import ProfilePage from "./pages/ProfilePage"
import ProtectedRoute from "./ProtectedRoute"

const AppMenu = (props) => {
    console.log("AppMenu", props)
    return (
        <HashRouter>
            <Switch>
                <Route path='/' exact={true} component={App} />

                <Route path='/SignIn' component={SignIn} allowAccess={true} />

                <Route path='/SignOut' component={SignOut} allowAccess={true} />

                <Route path='/SignUp' component={SignUp} allowAccess={true} />

                <Route path='/page2' component={Page2} />

                <ProtectedRoute path='/dashboard' component={Dashboard} allowAccess={true} />

                <ProtectedRoute path='/profile' component={ProfilePage} allowAccess={true} />
            </Switch>
        </HashRouter>
    )
}

export default AppMenu
