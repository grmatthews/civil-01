import React, { useState, useEffect } from "react"
import { Redirect } from "react-router-dom"
import firebase from "firebase"

function ProtectedRoute(props) {
    const Component = props.component

    const { allowAccess } = props

    console.log('allowAccess', allowAccess, props)

    const [showComponent, setShowComponent] = useState(true)

    useEffect(() => {
        if (firebase.auth().currentUser) {
            firebase
                .auth()
                .currentUser.getIdTokenResult(true)
                .then((token) => {
                    console.log("allowAccess", allowAccess)

                    setShowComponent(allowAccess && token.claims.hasOwnProperty("account_id"))
                })
        }
    }, [])

    return showComponent ? <Component {...props} /> : <Redirect to={{ pathname: "/SignIn" }} />
}

export default ProtectedRoute
