import * as React from "react";
import TextField from '@mui/material/TextField';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentPasteGoOutlinedIcon from '@mui/icons-material/ContentPasteGoOutlined';
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';

export default function EditStep({v, recipe, stepIndex, setRecipe}) {
    // >>> HANDLERS <<< //
    const handleInputChange = (e, newValue) => {
        console.log(e.target.value)
        let newV = newValue || e.target.value
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            "steps": prevRecipe.steps.map((value, index) => stepIndex === index ? newV : value),
        }));
    };
    const del = () => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        newRecipe.steps = newRecipe.steps.filter((value, index) => stepIndex !== index)
        setRecipe(newRecipe)
    }
    const move = (dir) => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        let newInd = dir === "up" ? stepIndex - 1 : stepIndex + 1;
        if (newInd > -1 && newInd < newRecipe.steps.length){
            let temp = newRecipe.steps[stepIndex];
            newRecipe.steps[stepIndex] = newRecipe.steps[newInd]
            newRecipe.steps[newInd] = temp;
            setRecipe(newRecipe)
        } else {console.log("out of bounds")}

    }
    const paste = async (e) => {
        const text = await navigator.clipboard.readText();
        if (text){
            let newRecipe = JSON.parse(JSON.stringify(recipe));
            newRecipe.steps[stepIndex] = text;
            setRecipe(newRecipe)
        }
    }

    return (
        <div className={"edit-step-div"}>
            <TextField
                id="step"
                multiline
                rows={4}
                value={v}
                onChange={handleInputChange}
                style={{width: "100%"}}
            />
            <div className={"edit-step-options"}>
                <button onClick={paste}><ContentPasteGoOutlinedIcon /></button>
                <button onClick={del}><DeleteOutlinedIcon /></button>
                <button onClick={() => move("up")}><KeyboardDoubleArrowUpOutlinedIcon /></button>
                <button onClick={() => move("down")}><KeyboardDoubleArrowDownOutlinedIcon /></button>
            </div>
        </div>
    );
}
