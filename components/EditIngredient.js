import * as React from "react";
import TextField from '@mui/material/TextField';
import RemoveIcon from '@mui/icons-material/Remove';
import ContentPasteGoOutlinedIcon from '@mui/icons-material/ContentPasteGoOutlined';
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export default function EditIngredient({ ingredient = {}, recipe, Index, setRecipe }) {

    // Ensure ingredient values are never undefined or null
    const safeIngredient = {
        ingredient: ingredient.ingredient || "",
        amount: ingredient.amount || "",
        size: ingredient.size || "",
        comment: ingredient.comment || "",
    };

    // >>> HANDLERS <<< //
    const handleInputChange = (e, newValue) => {
        if (typeof Index === "number") {
            // NORMAL
            let newIngr = JSON.parse(JSON.stringify(recipe.ingredients[Index]));
            let ev = e.target.value;
            if (!isNaN(ev) && Number(ev) === 0) {
                delete newIngr[e.target.id];
            } else {
                newIngr[e.target.id] = ev;
            }
            setRecipe((prevRecipe) => ({
                ...prevRecipe,
                "ingredients": prevRecipe.ingredients.map((value, index) => Index === index ? newIngr : value),
            }));
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
        } else {
            console.log("err", Index);
        }
    };

    const del = () => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        if (typeof Index === "number") {
            newRecipe.ingredients = newRecipe.ingredients.filter((value, index) => Index !== index);
            setRecipe(newRecipe);
        } else {
            let ingrTrain = [];
            let rec = newRecipe;
            for (let i = 0; i < Index.length - 1; i++) {
                rec = rec.ingredients ? rec.ingredients[Index[i]] : rec;
                ingrTrain.push(rec);
            }
            ingrTrain.at(-1).ingredients = ingrTrain.at(-1).ingredients.filter((value, index) => index !== Index.at(-1));
            setRecipe(newRecipe);
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
            }
        }
    };

    const paste = async (e, key) => {
        if (typeof Index === "number") {
            const text = await navigator.clipboard.readText();
            if (text) {
                let newRecipe = JSON.parse(JSON.stringify(recipe));
                newRecipe.ingredients[Index][key] = text;
                setRecipe(newRecipe);
            }
        } else {
            console.log("AHH");
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
            } else {
                // Traverse to the next level
                const nextIndex = indexArray[0];
                if (rec.ingredients && rec.ingredients[nextIndex]) {
                    // Recursively move to the next ingredient in the array
                    addRecursively(rec.ingredients[nextIndex], indexArray.slice(1));
                }
            }
        };

        // Start the recursion from the root of the recipe
        addRecursively(newRecipe, indexArray);

        // Update the recipe state with the new structure
        setRecipe(newRecipe);
    };

    if (ingredient.type) {
        return (
            <div className={"edit-ingredient-group-div"}>
                <div className={"top"}>
                    <button onClick={del}><RemoveIcon /></button>
                    <h1>{ingredient.type.toUpperCase()}</h1>
                    <button className={"border-btn"} onClick={() => { addNew("ingr"); }}>Add Ingredient</button>
                    <button className={"border-btn"} onClick={() => { addNew("group"); }}>Add Group</button>
                </div>
                <div className={"bot"}>
                    {ingredient.ingredients.map((value, index) => <div key={"ingredient" + Index.toString() + "-" + index}><ChevronRightIcon /><EditIngredient recipe={recipe} Index={typeof Index === "number" ? [Index, index] : Index.concat(index)} ingredient={value} setRecipe={setRecipe} /></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className={"edit-ingredient-div"}>
            <TextField
                id="amount"
                value={safeIngredient.amount}
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
                <button onClick={(e) => paste(e, "ingredient")}><ContentPasteGoOutlinedIcon /></button>
                <TextField
                    id="ingredient"
                    value={safeIngredient.ingredient}
                    onChange={handleInputChange}
                    placeholder={"Ingredient Name"}
                    style={{ width: "15rem" }}
                    inputProps={{
                        'aria-label': 'ingredient'
                    }}
                    label="Ingredient Name"
                />
            </div>
            <div style={{display: "flex", gap: "0.5rem"}}>
                <button onClick={(e) => paste(e, "comment")}><ContentPasteGoOutlinedIcon /></button>
                <TextField
                    id="comment"
                    value={safeIngredient.comment}
                    onChange={handleInputChange}
                    placeholder={"Comments"}
                    style={{ width: "13rem" }}
                    inputProps={{
                        'aria-label': 'comment'
                    }}
                    label="Comments"
                />
            </div>
            <div className={"last"} style={{display: "flex", gap: "0.5rem", justifyContent: "right"}}>
                <button onClick={() => move("up")}><KeyboardDoubleArrowUpOutlinedIcon /></button>
                <button onClick={() => move("down")}><KeyboardDoubleArrowDownOutlinedIcon /></button>
                <button style={{marginLeft:"2rem"}} onClick={del}><RemoveIcon /></button>
            </div>
        </div>
    );
}
