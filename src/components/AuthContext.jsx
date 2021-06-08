import React, { useEffect, useState } from "react"
import firebase from "firebase"

// See https://www.codota.com/code/javascript/functions/firebase/Auth/onAuthStateChanged
const AuthContext = React.createContext({})

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const user = firebase.auth().currentUser
        return user
    })

    const [userDetails, setUserDetails] = useState(() => {
        return {
            account_id: "",
            account_type: "",
        }
    })

    useEffect(() => {
        const unsub = firebase.auth().onAuthStateChanged((user) => {
            console.log("auth state changed - setting user", user)
            if (user !== null) {
                user.getIdTokenResult(true).then((token) => {
                    setUserDetails({
                        account_id: token.claims.account_id,
                        account_type: token.claims.account_type,
                    })

                    setUser(user)
                })
            }
        })

        return unsub
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                authenticated: user !== null,
                setUser,
                setUserDetails,
                userDetails,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => React.useContext(AuthContext)

export { AuthProvider, AuthContext, useAuth }
