import React from "react"
import { Switch, Route, HashRouter } from "react-router-dom"
import "./index.css"
import App from "./App"
import SignIn from "./pages/SignIn"
import Page2 from "./pages/Page2"

const AppMenu = (props) => {
    console.log("AppMenu", props)
    return (
        <HashRouter>
            <Switch>
                <Route path='/' exact={true} component={App} />

                <Route path='/SignIn'  component={SignIn} />

                <Route path='/page2' component={Page2} />
            </Switch>
        </HashRouter>
    )
}

export default AppMenu
