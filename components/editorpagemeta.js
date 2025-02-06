import * as React from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';


export default function EditorPageMeta({recipe, categories, setRecipe}) {


    // >>> HANDLERS <<< //
    const handleInputChange = (e, newValue) => {
        const { id } = e.target;
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            [id.split("-")[0]]: newValue || e.target.value,  // Ensure you update the value properly
        }));
    };


    const handleTimeChange = (e) => {
        const value = parseInt(e.target.value, 10); // Ensure it's a number
        // noinspection JSCheckFunctionSignatures
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            time: value,
        }));
    };


    return (
            <div id={"editor-page-meta"}>
            <OutlinedInput
                id="name"
                placeholder={"Recipe Name"}
                inputProps={{
                    'aria-label': 'name'
                }}
                onChange={(e, newValue) => handleInputChange(e, newValue)}
                value={recipe.name}
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
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} label="Category" />}
                    id={"cat"}
                    onChange={(e, newValue) => handleInputChange(e, newValue)}
                    value={recipe.cat}
                />
            </div>
    );
}
