"use client"
import client from "@/lib/mongoconnect";
import * as React from "react";
import EditorPageMeta from "@/components/editorpagemeta";
import EditStep from "@/components/EditStep"
import EditIngredient from "@/components/EditIngredient"
import { useSession } from "next-auth/react"
import {useState, useEffect} from "react";
import {useRouter} from "next/router";
import useSWR from "swr";
const fetcher = (url) => fetch(url).then(res => res.json())

export const getServerSideProps = async () => {
    try {
        await client.connect();
        return {
            props: { isConnected: true },
        };
    } catch (e) {
        console.error(e);
        return {
            props: { isConnected: false },
        };
    }
};


export default function Editor({isConnected}) {
    const { status } = useSession();
    const r = useRouter();
    const { id } = r.query;
    let { data, error } = useSWR(`/api/recipes?id=${id}`, fetcher)
    const [recipe, setRecipe] = useState({
        name: "New Recipe", cat: "New Category", time: 30,
        ingredients: [], steps: []
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (data){
            let rec = data.findIndex(x => x.id === id)
            if (rec !== -1){
                setRecipe(data[rec])
            }
            setCategories([... new Set(data.map(x => x.cat))])
        }
    }, [data])


    // >>> HANDLERS <<< //
    const handleInputChange = (e, newValue) => {
        const { id } = e.target;
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            [id.split("-")[0]]: newValue || e.target.value,  // Ensure you update the value properly
        }));
        console.log(recipe);
    };


    const handleTimeChange = (e) => {
        const value = parseInt(e.target.value, 10); // Ensure it's a number
        // noinspection JSCheckFunctionSignatures
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            time: value,
        }));
    };

    const addStepFunc = (value)=>{
        let newRecipe = JSON.parse(JSON.stringify(recipe));
       newRecipe.steps.push(typeof value === "string" ? value : "New Step")
       setRecipe(newRecipe)
    }
    const stepPaste = async () => {
        const text = await navigator.clipboard.readText();
        if (text){  addStepFunc(text); }
    }

    const addIngrFunc = (value)=>{
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        newRecipe.ingredients.push((typeof value === "object" && !Array.isArray(value) && value.ingredient) ? value : {ingredient: "New Ingredient"})
        setRecipe(newRecipe)
    }
    const addGroupFunc = (value)=>{
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        newRecipe.ingredients.push((typeof value === "object" && !Array.isArray(value) && value.ingredient) ? value : {type: "New Group", ingredients: []})
        setRecipe(newRecipe)
    }
    if (isConnected){
        if (status === "loading"){
            return (<div id={"editor-page"}><h1>LOADING</h1></div>)
        } else if (status === "unauthenticated"){
            return (<div id={"editor-page"}><h1>NOT ALLOWED</h1><a href="/">[GO BACK]</a></div>)
        }
    } else {
        return (<div id={"editor-page"}><h1>NOT CONNECTED</h1><a href="/">[GO BACK]</a></div>)
    }


    return (
    <div id={"editor-page"}>
        <div id={"editor-page-header"}>
            <h1>Recipes V4 Editor</h1>
            <button><a href={"/"}>[GO BACK]</a></button>
            <button onClick={() => {console.log(recipe)}}>[LOG RECIPE]</button>
            <button onClick={() => {console.log(recipe)}}>[HELP GUIDE]</button>
        </div>
        <EditorPageMeta recipe={recipe} categories={categories} setRecipe={setRecipe}/>


        <div id={"editor-page-steps"} style={{display: "none"}}>
            <h2>STEPS</h2>
            <div className={"edit-steps"}>
                {recipe.steps.map((value, index) => <EditStep recipe={recipe} key={"step" + index} stepIndex={index} v={value} setRecipe={setRecipe}/>)}

            </div>
            <div id={"edit-bot-btns"}>
                <button onClick={addStepFunc} className={"add"}>+ Add Step</button>
                <button onClick={stepPaste} className={"copy"}>+ Paste From Clipboard</button>
            </div>
        </div>


        <div id={"editor-page-ingredients"}>
            <h2>Ingredients</h2>
            {recipe.ingredients.map((value, index) => <EditIngredient recipe={recipe} key={"ingredient" + index} Index={index} ingredient={value} setRecipe={setRecipe}/>)}
            <div id={"edit-bot-btns"}>
                <button onClick={addIngrFunc} className={"add"}>+ Add Ingredient</button>
                <button onClick={addGroupFunc} className={"group"}>+ Add Group</button>
            </div>
        </div>
    </div>
    );
}
