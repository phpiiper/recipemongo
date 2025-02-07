import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';

export default function Alert({children, btnText="Click Me!", alertText="This is an example alert!", time=2000, clickEvent, className=""}) {
    const [open, setOpen] = React.useState(false);
    const handleClick = () => { setOpen(true);};
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setOpen(false);
    };

    return (
        <div className={"alert-div " + className}>
            <button className={"alert-btn"} onClick={() => {
                let res = false;
                if (clickEvent){res = clickEvent()}
                if (res === true){  handleClick();   }}}
            >{
                children ? children : btnText
            }</button>
            <Snackbar
                anchorOrigin={{vertical: "top", horizontal: "center"}}
                open={open}
                autoHideDuration={time}
                onClose={handleClose}
                message={alertText}
            />
        </div>
    );
}