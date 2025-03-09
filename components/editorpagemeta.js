import * as React from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';


export default function EditorPageMeta({recipe, categories, setRecipe, status, session}) {
    const [amountError, setAmountError] = React.useState(false);
    // >>> HANDLERS <<< //
    const handleInputChange = (e, newValue) => {
        const { id } = e.target;
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            [id.split("-")[0]]: newValue || e.target.value,
        }));
    };


    return (
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
                            setAmountError(false)
                        } else {
                            setAmountError(true)
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
            </div>
    );
}
