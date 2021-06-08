import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
//import reportWebVitals from "./reportWebVitals"
import { ThemeProvider } from "@material-ui/styles"
import { Provider } from "react-redux"
import store from "./redux/store"
import { FirebaseAuthProvider } from "@react-firebase/auth"
import { SnackbarProvider } from "notistack"
import firebase from "firebase"
import { firebaseConfig } from "./Firestore"
import { AuthProvider } from "./components/AuthContext"
import { indigo, green, blueGrey, lightBlue } from "@material-ui/core/colors"
import { createMuiTheme, Fade } from "@material-ui/core"
import AppMenu from "./AppMenu"

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: green,
        text: {
            secondary: lightBlue[900],
            disabled: blueGrey,
        },
    },
})

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <FirebaseAuthProvider firebase={firebase} {...firebaseConfig}>
                <AuthProvider>
                    <SnackbarProvider
                        maxSnack={3}
                        preventDuplicate
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        TransitionComponent={Fade}
                    >
                        <AppMenu />
                    </SnackbarProvider>
                </AuthProvider>
            </FirebaseAuthProvider>
        </ThemeProvider>
    </Provider>,
    document.getElementById("root")
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals()
