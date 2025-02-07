import * as React from "react";
import TextField from '@mui/material/TextField';
import RemoveIcon from '@mui/icons-material/Remove';
import ContentPasteGoOutlinedIcon from '@mui/icons-material/ContentPasteGoOutlined';
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import Snackbar from "@mui/material/Snackbar";

export default function EditStep({v, recipe, stepIndex, setRecipe}) {
    // >>>> SNACK BAR <<< //
    const [openSnackBar, setOpenSnackBar] = React.useState(false);
    const [snackbarText, setSnackbarText] = React.useState("Alert!");
    const handleClickSnackBar = () => { setOpenSnackBar(true);};
    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setOpenSnackBar(false);
    };
    // >>> END SNACKBAR <<< //
    // >>> HANDLERS <<< //
    const handleInputChange = (e, newValue) => {
        let newV = newValue || e.target.value
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            "steps": prevRecipe.steps.map((value, index) => stepIndex === index ? newV : value),
        }));
    };
    const del = (func) => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        newRecipe.steps = newRecipe.steps.filter((value, index) => stepIndex !== index)
        if (func) {  func();  }
        setRecipe(newRecipe)
    }
    const move = (dir,func) => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        let newInd = dir === "up" ? stepIndex - 1 : stepIndex + 1;
        if (newInd > -1 && newInd < newRecipe.steps.length){
            let temp = newRecipe.steps[stepIndex];
            newRecipe.steps[stepIndex] = newRecipe.steps[newInd]
            newRecipe.steps[newInd] = temp;
            setRecipe(newRecipe)
            if (func) {  func();  }
        }

    }
    const paste = async (e,func) => {
        const text = await navigator.clipboard.readText();
        if (text){
            let newRecipe = JSON.parse(JSON.stringify(recipe));
            newRecipe.steps[stepIndex] = text;
            if (func) {  func();  }
            setRecipe(newRecipe)
        }
    }

    return (
        <div className={"edit-step-div"}>
            <Snackbar
                anchorOrigin={{vertical: "top", horizontal: "center"}}
                open={openSnackBar}
                autoHideDuration={1000}
                onClose={handleSnackBarClose}
                message={snackbarText}
            />
            <TextField
                id="step"
                multiline
                rows={4}
                value={v}
                onChange={handleInputChange}
                style={{width: "100%"}}
            />
            <div className={"edit-step-options"}>
                <button onClick={(e) => {paste(e, () =>{handleClickSnackBar(); setSnackbarText("Pasted step from clipboard!")}); }}><ContentPasteGoOutlinedIcon /></button>
                <button onClick={() => {del(() =>{handleClickSnackBar(); setSnackbarText("Deleted step!"); })}}><RemoveIcon /></button>
                <button onClick={() => {move("up",() =>{handleClickSnackBar(); setSnackbarText("Deleted step up!"); })}}><KeyboardDoubleArrowUpOutlinedIcon /></button>
                <button onClick={() => {move("down",() =>{handleClickSnackBar(); setSnackbarText("Moved step down!"); })}}><KeyboardDoubleArrowDownOutlinedIcon /></button>
            </div>
        </div>
    );
}
