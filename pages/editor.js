import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import client from "@/lib/mongoconnect";
import EditorPageMeta from "@/components/editorpagemeta";
import EditStep from "@/components/EditStep";
import EditIngredient from "@/components/EditIngredient";
import ContentPasteGoOutlinedIcon from '@mui/icons-material/ContentPasteGoOutlined';
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import RemoveIcon from '@mui/icons-material/Remove';

const fetcher = (url) => fetch(url).then((res) => res.json());

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

export default function Editor({ isConnected }) {
    const { status } = useSession();
    const r = useRouter();
    const { id } = r.query;

    const [recipe, setRecipe] = useState({
        name: "New Recipe",
        cat: "New Category",
        time: 30,
        ingredients: [],
        steps: [],
    });

    const [categories, setCategories] = useState([]);
    const [allRecipes, setAllRecipes] = useState([]);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        if (status === "authenticated") {
            // Fetch all recipes when the session is authenticated
            fetch("/api/recipes")
                .then((res) => res.json())
                .then((data) => {
                    setAllRecipes(data);
                    setCategories([...new Set(data.map((x) => x.cat))]);

                    // Find the recipe by the `id` from the query params
                    const rec = data.find((x) => x.id === id);
                    if (rec) {
                        setRecipe(rec);
                    } else {
                        // Generate a random ID if no recipe is found
                        const generateID = () => {
                            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                            let id = "";
                            for (let i = 0; i < 8; i++) {
                                id += chars.charAt(Math.floor(Math.random() * chars.length));
                            }
                            return id;
                        };
                        setRecipe((prevRecipe) => ({
                            ...prevRecipe,
                            id: generateID(),
                        }));
                    }
                });
        }
    }, [status, id]);

    if (isConnected && status === "loading") {
        return (
            <div id={"editor-page"}>
                <h1>Loading...</h1>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div id={"editor-page"}>
                <h1>NOT CONNECTED</h1>
                <a href="/">[GO BACK]</a>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div id={"editor-page"}>
                <h1>NOT ALLOWED</h1>
                <a href="/">[GO BACK]</a>
            </div>
        );
    }

    const handleInputChange = (e, newValue) => {
        const { id } = e.target;
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            [id.split("-")[0]]: newValue || e.target.value, // Ensure you update the value properly
        }));
    };

    const handleTimeChange = (e) => {
        const value = parseInt(e.target.value, 10); // Ensure it's a number
        setRecipe((prevRecipe) => ({
            ...prevRecipe,
            time: value,
        }));
    };

    // Handle database save logic (add or update recipe)
    const handlePush = () => {
        if (allRecipes.find((x) => x.id === recipe.id)) {
            fetch('/api/recipe.handler', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipe),
            })
                .then((response) => response.json())
                .then((data) => console.log("PUT response", data));
        } else {
            fetch('/api/recipe.handler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipe),
            })
                .then((response) => response.json())
                .then((data) => console.log("POST response", data));
        }
    };

    const addStepFunc = (value) => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        newRecipe.steps.push(typeof value === "string" ? value : "New Step");
        setRecipe(newRecipe);
    };

    const stepPaste = async () => {
        const text = await navigator.clipboard.readText();
        if (text) {
            addStepFunc(text);
        }
    };

    const addIngrFunc = (value) => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        newRecipe.ingredients.push(
            typeof value === "object" && !Array.isArray(value) && value.ingredient
                ? value
                : { ingredient: "New Ingredient" }
        );
        setRecipe(newRecipe);
    };

    const addGroupFunc = (value) => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        newRecipe.ingredients.push(
            typeof value === "object" && !Array.isArray(value) && value.ingredient
                ? value
                : { type: "New Group", ingredients: [] }
        );
        setRecipe(newRecipe);
    };

    return (
        <div id={"editor-page"}>
            <div id={"editor-page-header"}>
                <h1>Recipes V4 Editor</h1>
                <button>
                    <a href={"/"}>[GO BACK]</a>
                </button>
                <button onClick={() => console.log(recipe)}>[LOG RECIPE]</button>
                <button onClick={handleOpen}>[Help Guide]</button>
                <button onClick={handlePush}>[Add to Database]</button>
                <Modal open={open} onClose={handleClose}>
                    <div id={"recipe-editor-helper"}>
                        <h1>Recipe Help Guide</h1>
                        <div className={"container"}>
                            <h2>SYMBOLS</h2>
                            <div className={"symbol-help"}>
                                <ContentPasteGoOutlinedIcon />
                                <span>Paste Clipboard to Input (to the right of it for Ingredients)</span>
                            </div>
                            <div className={"symbol-help"}>
                                <RemoveIcon />
                                <span>Delete This</span>
                            </div>
                            <div className={"symbol-help"}>
                                <KeyboardDoubleArrowUpOutlinedIcon />
                                <span>Move This UP</span>
                            </div>
                            <div className={"symbol-help"}>
                                <KeyboardDoubleArrowDownOutlinedIcon />
                                <span>Move This DOWN</span>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>

            <EditorPageMeta recipe={recipe} categories={categories} setRecipe={setRecipe} />

            <div id={"editor-page-steps"}>
                <h2>STEPS</h2>
                <div className={"edit-steps"}>
                    {recipe.steps.map((value, index) => (
                        <EditStep key={"step" + index} stepIndex={index} v={value} setRecipe={setRecipe} />
                    ))}
                </div>
                <div id={"edit-bot-btns"}>
                    <button onClick={addStepFunc} className={"add"}>
                        + Add Step
                    </button>
                    <button onClick={stepPaste} className={"copy"}>
                        + Paste From Clipboard
                    </button>
                </div>
            </div>

            <div id={"editor-page-ingredients"}>
                <h2>Ingredients</h2>
                {recipe.ingredients.map((value, index) => (
                    <EditIngredient key={"ingredient" + index} Index={index} ingredient={value} setRecipe={setRecipe} />
                ))}
                <div id={"edit-bot-btns"}>
                    <button onClick={addIngrFunc} className={"add"}>
                        + Add Ingredient
                    </button>
                    <button onClick={addGroupFunc} className={"group"}>
                        + Add Group
                    </button>
                </div>
            </div>
        </div>
    );
}
