import * as React from 'react';
import Icon from "@/components/Icon";
import KeyIcon from "@mui/icons-material/Key";
import Drawer from '@mui/material/Drawer';
import MenuBookIcon from "@mui/icons-material/MenuBook";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import { signIn } from "next-auth/react";
import Snackbar from "@mui/material/Snackbar";
export default function SignIn({status}){
    const [open, setOpen] = React.useState(false);
    const [alertText, setAlertText] = React.useState("");
    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };
    const [openSnack, setOpenSnack] = React.useState(false);
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setOpenSnack(false);
    };
    const signUp = async function(){
        let user = document.getElementById("signup-username").value
        let pw = document.getElementById("signup-password").value
        const body = {username: user, password: pw};
        const response = await fetch('api/user-apis/register', {
            method: 'POST',
            body: JSON.stringify(body)
        })
        if (response.ok){
            setAlertText("Account created, sign in!")
            setOpenSnack(true)
            setOpen(false)
         } else {
            let message = await response.json()
            setAlertText(`ERROR: ${message.message}`)
            setOpenSnack(true)
         }
    }
    const signInFunction = async function(){
        let user = document.getElementById("signup-username").value
        let pw = document.getElementById("signup-password").value
        let res = await signIn("credentials", {
            user: user, password: pw, redirect: false
        } );
        if (res.error){
            let message = res.error
            setAlertText(`ERROR: ${message}`)
            setOpenSnack(true)
        }
    }

return (
<>
    <Snackbar
        anchorOrigin={{vertical: "top", horizontal: "center"}}
        open={openSnack}
        autoHideDuration={3000}
        onClose={handleClose}
        message={alertText}
    />
    <Icon children={<KeyIcon />} clickEvent={toggleDrawer(true)} btnText={"Sign In"} />
    <Drawer anchor={'top'} open={open} onClose={toggleDrawer(false)} id={"signup-drawer"}>
        <div id={"signup-div"}>
            <h2>Account</h2>
            <div className={'container'}>
                <label htmlFor={"signup-username"}><MenuBookIcon /></label>
                <FormControl variant="outlined" style={{ marginRight: "10px" }}>
                    <TextField
                        id="signup-username"
                        className={"signup-forms"}
                        label="Username"
                        type={"username"}
                    />
                </FormControl>
            </div>
            <div className={'container'}>
                <label htmlFor={"signup-password"}><MenuBookIcon /></label>
                <FormControl variant="outlined" style={{ marginRight: "10px" }}>
                    <TextField
                        id="signup-password"
                        className={"signup-forms"}
                        label="Password"
                        type={"password"}
                    />
                </FormControl>
            </div>
            <div
                style={{
                    display: "flex", gap: "1rem"
                }}
            >
                <button
                    onClick={signUp}
                >
                    Sign Up
                </button>
                <button
                    onClick={signInFunction}
                >
                    Sign In
                </button>
            </div>
        </div>
    </Drawer>
</>
        )
}