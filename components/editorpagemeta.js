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
                label="Recipe Name"
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

                <OutlinedInput
                    id="servings"
                    endAdornment={<InputAdornment
                        position="end">servings</InputAdornment>}
                    inputProps={{
                        'aria-label': 'servings', 'type':'number', 'width': '2rem'
                    }}
                    onChange={(e, newValue) => handleInputChange(e, newValue)}
                    value={recipe.servings || 0}
                />
            </div>
    );
}
