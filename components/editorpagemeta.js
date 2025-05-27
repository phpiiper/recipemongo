import * as React from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Icon from "@/components/Icon";
import AssistantOutlinedIcon from "@mui/icons-material/AssistantOutlined";
import Button from "@mui/material/Button";
import {useState} from "react";
import axios from "axios";
import Snackbar from "@mui/material/Snackbar";


export default function EditorPageMeta({recipe, categories, setRecipe, status, session, setError}) {
    // >>>> SNACK BAR <<< //
    const [openSnackBar, setOpenSnackBar] = React.useState(false);
    const [snackbarText, setSnackbarText] = React.useState("Alert!");
    const handleClickSnackBar = () => { setOpenSnackBar(true);};
    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setOpenSnackBar(false);
    };
    const [amountError, setAmountError] = React.useState(false);
    // >>> HANDLERS <<< //
    const handleInputChange = (e, newValue) => {
        const { id } = e.target;
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            [id.split("-")[0]]: newValue || e.target.value,
        }));
    };
    // >>> GEMMA AI FEATURE <<< ///
    const [isWaiting, setIsWaiting] = useState(false);
    const ai_function = async (url) => {
        if (!url || url.length === 0) {
            setSnackbarText("Please enter a valid URL.")
            setOpenSnackBar(true)
            return
        }
        try {
            setIsWaiting(true)
            const response = await axios.get(`api/parseRecipe?url=${url}`)
            const newRecipe = JSON.parse(response.data)
            if (Object.keys(newRecipe).length === 0) {
                setIsWaiting(false)
                setSnackbarText("Invalid recipe URL. Please try again.")
                setOpenSnackBar(true)
                return
            }

            const allowedKeys = ["name", "cat", "time", "ingredients", "steps", "access", "notes"];
            const updatedRecipe = allowedKeys.reduce((acc, key) => {
                if (key in newRecipe) {
                    acc[key] = newRecipe[key];
                }
                return acc;
            }, {});
            setRecipe(prev => ({
                ...prev,
                ...updatedRecipe
            }));
            setSnackbarText("Successfully parsed recipe!")
            setOpenSnackBar(true)
            setIsWaiting(false)
            return
        } catch (error) {
            console.log(error)
            setIsWaiting(false)
            setSnackbarText("Error parsing recipe. Please try again.")
            setOpenSnackBar(true)
            return
        }
    }


    return (<>
            <Snackbar
                anchorOrigin={{vertical: "top", horizontal: "center"}}
                open={openSnackBar}
                autoHideDuration={1000}
                onClose={handleSnackBarClose}
                message={snackbarText}
            />
            <div id={"editor-page-meta"}>
                {status==="authenticated" && ((session.user && session.user.name === recipe.author) || !recipe.author) ? (<FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel>Access</InputLabel>
                        <Select
                            id="access"
                            value={recipe.access}
                            label="Access"
                            onChange={(e) => handleInputChange({ target: { id: "access", value: e.target.value } })}
                        >
                            <MenuItem value={"private"}>Private</MenuItem>
                            <MenuItem value={"public"}>Public</MenuItem>
                        </Select>

                    </FormControl>)
                : <></>}
            <TextField
                id="name"
                placeholder={"Recipe Name"}
                onChange={(e, newValue) => handleInputChange(e, newValue)}
                value={recipe.name}
                label="Recipe Name*"
            />

                <OutlinedInput
                    id="time"
                    endAdornment={<InputAdornment
                        position="end">minutes</InputAdornment>}
                    inputProps={{
                        'aria-label': 'time', 'type':'number'
                    }}
                    onChange={(e, newValue) => handleInputChange(e, newValue)}
                    value={recipe.time}
                />

                <Autocomplete
                    disablePortal
                    freeSolo
                    options={categories}
                    sx={{ width: 200 }}
                    renderInput={(params) => <TextField {...params} label="Category*" />}
                    id={"cat"}
                    onKeyUp={(e, newValue) => handleInputChange(e, newValue)}
                    onChange={(e, newValue) => handleInputChange(e, newValue)}
                    value={recipe.cat}
                />


                <TextField
                    id="servings"
                    value={recipe.servings}
                    style={{
                       'width': '4rem'
                    }}
                    onChange={(event) => {
                        handleInputChange(event);
                        let valid = /^([0-9-]*)$/.test(event.target.value);
                        if (valid) {
                            setAmountError(false);
                        } else {
                            setAmountError(true);
                        }
                    }}
                    label="Servings"
                    error={amountError}
                    helperText={amountError ? "Invalid Number" : undefined}
                />
                <TextField
                    label="Recipe Notes"
                    id="notes"
                    multiline
                    rows={2}
                    value={recipe.notes}
                    onChange={handleInputChange}
                    style={{width: "100%"}}
                />
                <div id={"recipe-url-div"}>
                    <TextField
                        id="url"
                        placeholder={"https://example.com/recipe.html"}
                        onChange={(e, newValue) => handleInputChange(e, newValue)}
                        value={recipe.url}
                        label="Recipe Url"
                        fullWidth
                    />
                    <Button
                        onClick={() => ai_function(document.getElementById("url").value)}
                        variant={"contained"}
                        color={"primary"}
                        disabled={isWaiting}
                    >{isWaiting ? "Converting..." : "Convert"}</Button>
                </div>
                <p>Click "Convert" to have AI parse the recipe to make it easier. Always make sure to double check to make sure everything is exactly how you want it!</p>
            </div>
</>
    );
}
