import * as React from "react";
import TextField from '@mui/material/TextField';
import RemoveIcon from '@mui/icons-material/Remove';
import ContentPasteGoOutlinedIcon from '@mui/icons-material/ContentPasteGoOutlined';
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Alert from '@/components/Alert';
import Snackbar from '@mui/material/Snackbar';
import Icon from "@/components/Icon";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";

export default function EditIngredient({ ingredient = {}, recipe, Index, setRecipe }) {
    // >>>> SNACK BAR <<< //
    const [openSnackBar, setOpenSnackBar] = React.useState(false);
    const [snackbarText, setSnackbarText] = React.useState("Alert!");
    const handleClickSnackBar = () => { setOpenSnackBar(true);};
    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setOpenSnackBar(false);
    };
    // >>> END SNACKBAR <<< //
    // Ensure ingredient values are never undefined or null
    const safeIngredient = {
        ingredient: ingredient.ingredient || "",
        amount: (ingredient.amount) || "",
        size: ingredient.size || "",
        comment: ingredient.comment || "",
    };

    // >>> HANDLERS <<< //
    const handleInputChange = (e, newValue) => {
        if (typeof Index === "number") {
            // NORMAL
            let newIngr = JSON.parse(JSON.stringify(recipe.ingredients[Index]));
            let ev = e.target.value;
            if (!isNaN(ev) && Number(ev) === 0 && e.target.id !== "type") {
                delete newIngr[e.target.id];
            } else {
                if (e.target.id === "amount"){
                    if (ev.split("-").filter(x => x.length > 0).length > 1) { ev = ev.split("-") }
                    newIngr[e.target.id] = ev;
                } else {
                    newIngr[e.target.id] = ev;
                }
            }
            setRecipe((prevRecipe) => ({
                ...prevRecipe,
                "ingredients": prevRecipe.ingredients.map((value, index) => Index === index ? newIngr : value),
            }));
            return true
        } else if (Array.isArray(Index)) {
            let ev = e.target.value;
            // NESTED
            let newRec = JSON.parse(JSON.stringify(recipe));
            let ingrTrain = [];
            let rec = newRec;
            for (let i = 0; i < Index.length - 1; i++) {
                rec = rec.ingredients ? rec.ingredients[Index[i]] : rec;
                ingrTrain.push(rec);
            }
            ingrTrain.at(-1).ingredients[Index.at(-1)][e.target.id] = ev;
            setRecipe(newRec);
            return true
        } else {
            console.log("err", Index);
        }
        return false
    };

    const del = (func) => {
        if (func) {  func();  }
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        if (typeof Index === "number") {
            newRecipe.ingredients = newRecipe.ingredients.filter((value, index) => Index !== index);
            setRecipe(newRecipe);
            return true
        } else {
            let ingrTrain = [];
            let rec = newRecipe;
            for (let i = 0; i < Index.length - 1; i++) {
                rec = rec.ingredients ? rec.ingredients[Index[i]] : rec;
                ingrTrain.push(rec);
            }
            ingrTrain.at(-1).ingredients = ingrTrain.at(-1).ingredients.filter((value, index) => index !== Index.at(-1));
            if (func) {  func();  }
            setRecipe(newRecipe);
            return true
        }
    };

    const move = (dir) => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        if (typeof Index === "number") {
            let newInd = dir === "up" ? Index - 1 : Index + 1;
            if (newInd > -1 && newInd < newRecipe.ingredients.length) {
                let temp = newRecipe.ingredients[Index];
                newRecipe.ingredients[Index] = newRecipe.ingredients[newInd];
                newRecipe.ingredients[newInd] = temp;
                setRecipe(newRecipe);
                return true
            }
        } else {
            let ingrTrain = [];
            let rec = newRecipe;
            for (let i = 0; i < Index.length - 1; i++) {
                rec = rec.ingredients ? rec.ingredients[Index[i]] : rec;
                ingrTrain.push(rec);
            }
            let curInd = Index.at(-1);
            let newInd = dir === "up" ? curInd - 1 : curInd + 1;
            let last = ingrTrain.at(-1);
            if (newInd > -1 && newInd < last.ingredients.length) {
                let temp = last.ingredients[curInd];
                last.ingredients[curInd] = last.ingredients[newInd];
                last.ingredients[newInd] = temp;
                setRecipe(newRecipe);
                return true
            }
        }
        return false
    };

    const paste = async (e, key, func) => {
        const text = await navigator.clipboard.readText();
        if (!text) {return false}
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        if (typeof Index === "number") {
            newRecipe.ingredients[Index][key] = text;
            if (func) {  func();  }
            setRecipe(newRecipe);
        } else {
            let ingrTrain = [];
            let rec = newRecipe;
            for (let i = 0; i < Index.length - 1; i++) {
                rec = rec.ingredients ? rec.ingredients[Index[i]] : rec;
                ingrTrain.push(rec);
            }
            ingrTrain.at(-1).ingredients[Index.at(-1)][key] = text;
            if (func) {  func();  }
            setRecipe(newRecipe);
            return true
        }
    };

    const addNew = (type) => {
        // Define the new ingredient or category
        let newType = type === "ingr" ? { ingredient: "New Ingredient" } : { type: "New Category", ingredients: [] };

        // Clone the recipe to avoid direct mutation
        let newRecipe = JSON.parse(JSON.stringify(recipe));

        // Ensure Index is always an array
        const indexArray = Array.isArray(Index) ? Index : [Index];

        // Function to recursively traverse and add new ingredient/category
        const addRecursively = (rec, indexArray) => {
            if (indexArray.length === 0) {
                // When we reach the last level, we add the new type (ingredient or category)
                if (!rec.ingredients) {
                    rec.ingredients = [];
                }
                rec.ingredients.push(newType);
                return true
            } else {
                // Traverse to the next level
                const nextIndex = indexArray[0];
                if (rec.ingredients && rec.ingredients[nextIndex]) {
                    // Recursively move to the next ingredient in the array
                    addRecursively(rec.ingredients[nextIndex], indexArray.slice(1));
                    return true
                }
            }
            return false
        };

        // Start the recursion from the root of the recipe
        addRecursively(newRecipe, indexArray);

        // Update the recipe state with the new structure
        setRecipe(newRecipe);
    };









    if (ingredient.type) {
        return (
            <div className={"edit-ingredient-group-div"}>
                <Snackbar
                    anchorOrigin={{vertical: "top", horizontal: "center"}}
                    open={openSnackBar}
                    autoHideDuration={1000}
                    onClose={handleSnackBarClose}
                    message={snackbarText}
                />
                <div className={"top"}>
                    <button onClick={() => {del(() => {handleClickSnackBar(); setSnackbarText("Deleted Group")})}}><RemoveIcon /></button>
                    <TextField
                        id="type"
                        value={ingredient.type}
                        onChange={handleInputChange}
                        placeholder={"Group Name"}
                        style={{ width: "10rem", minWidth: "8rem" }}
                        inputProps={{
                            'aria-label': 'size'
                        }}
                        label="Group Name"
                    />
                    <Icon
                        children={<NoteAddIcon />}
                        btnClass={"border-btn const"}
                        clickEvent={() => {addNew("ingr"); handleClickSnackBar(); setSnackbarText("Added Ingredient to Group!");}}
                        btnText={"Add Ingredient"}
                    ></Icon>
                    <Icon
                        children={<CreateNewFolderIcon />}
                        btnClass={"border-btn const"}
                        clickEvent={() => {addNew("group"); handleClickSnackBar(); setSnackbarText("Added Group to Group!");}}
                        btnText={"Add Group"}
                    ></Icon>
                </div>
                <div className={"bot"}>
                    {ingredient.ingredients.map((value, index) => <div key={"ingredient" + Index.toString() + "-" + index}><ChevronRightIcon /><EditIngredient recipe={recipe} Index={typeof Index === "number" ? [Index, index] : Index.concat(index)} ingredient={value} setRecipe={setRecipe} /></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className={"edit-ingredient-div"}>
            <Snackbar
                anchorOrigin={{vertical: "top", horizontal: "center"}}
                open={openSnackBar}
                autoHideDuration={1000}
                onClose={handleSnackBarClose}
                message={snackbarText}
            />
            <button
                onClick={() =>
                {
                    del(() => { handleClickSnackBar(); setSnackbarText("Deleted!")})
                }}
            >  <RemoveIcon />  </button>
            <TextField
                id="amount"
                value={Array.isArray(safeIngredient.amount) ? safeIngredient.amount.join("-") : safeIngredient.amount}
                onChange={handleInputChange}
                placeholder={"##"}
                style={{ width: "4rem", minWidth: "4rem" }}
                inputProps={{
                    'aria-label': 'amount'
                }}
                label="Amount"
            />
            <TextField
                id="size"
                value={safeIngredient.size}
                onChange={handleInputChange}
                placeholder={"Measurement"}
                style={{ width: "10rem", minWidth: "8rem" }}
                inputProps={{
                    'aria-label': 'size'
                }}
                label="Measurement"
            />
            <div style={{display: "flex", gap: "0.5rem"}}>
                <button onClick={(e) => paste(e, "ingredient", function(){
                    handleClickSnackBar(); setSnackbarText("Pasted Ingredient Name!")
                })}><ContentPasteGoOutlinedIcon /></button>
                <TextField
                    id="ingredient"
                    value={safeIngredient.ingredient}
                    onChange={handleInputChange}
                    placeholder={"Ingredient Name"}
                    style={{ width: "10rem" }}
                    inputProps={{
                        'aria-label': 'ingredient'
                    }}
                    label="Ingredient Name"
                />
            </div>
            <div style={{display: "flex", gap: "0.5rem"}}>
                <button onClick={(e) => paste(e, "comment",function(){
                    handleClickSnackBar(); setSnackbarText("Pasted Comment!")
                })}><ContentPasteGoOutlinedIcon /></button>
                <TextField
                    id="comment"
                    value={Array.isArray(safeIngredient.comment) ? safeIngredient.comment.join(", ") : safeIngredient.comment}
                    onChange={handleInputChange}
                    placeholder={"Comments"}
                    style={{ width: "10rem" }}
                    inputProps={{
                        'aria-label': 'comment'
                    }}
                    label="Comments"
                />
            </div>
            <div className={"last"} style={{display: "flex", gap: "0.5rem", justifyContent: "right"}}>
                <button
                    onClick={() =>
                    {
                        let res = move("up")
                        if (res){ handleClickSnackBar();
                        setSnackbarText("Moved up!")}
                    }}
                > <KeyboardDoubleArrowUpOutlinedIcon /> </button>
                <button
                    onClick={() =>
                    {
                        let res = move("down")
                        if (res){ handleClickSnackBar();
                            setSnackbarText("Moved down!")}
                    }}
                > <KeyboardDoubleArrowDownOutlinedIcon />  </button>
                </div>
        </div>
    );
}
