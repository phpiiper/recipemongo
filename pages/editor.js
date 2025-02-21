import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import client from "@/lib/mongoconnect";
import EditorPageMeta from "@/components/editorpagemeta";
import EditStep from "@/components/EditStep";
import EditIngredient from "@/components/EditIngredient";
import Icon from "@/components/Icon";
// icons
import ContentPasteGoOutlinedIcon from '@mui/icons-material/ContentPasteGoOutlined';
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
// components
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Snackbar from "@mui/material/Snackbar";
// ICONS
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import CodeIcon from '@mui/icons-material/Code';
import RemoveIcon from '@mui/icons-material/Remove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Confirm from "@/components/Confirm";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
    const { data, status } = useSession();
    const r = useRouter();
    const { id } = r.query;

    const [recipe, setRecipe] = useState({
        name: "",
        cat: "",
        time: 30,
        ingredients: [],
        steps: [],
        access: "public"
    });

    const [categories, setCategories] = useState([]);
    const [allRecipes, setAllRecipes] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [openConfirmation, setOpenConfirmation] = React.useState(false);
    const [viewGroup, setViewGroup] = useState("Ingredients");
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleOpenConf = () => setOpenConfirmation(true);
    const handleCloseConf = () => setOpenConfirmation(false);
    // >>>> SNACK BAR <<< //
    const [openSnackBar, setOpenSnackBar] = React.useState(false);
    const [snackbarText, setSnackbarText] = React.useState("Alert!");
    const handleClickSnackBar = () => { setOpenSnackBar(true);};
    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setOpenSnackBar(false);
    };
    // >>> END SNACKBAR <<< //

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

    if (status === "unauthenticated" || (data && data.user && recipe.author && data.user.name !== recipe.author)) {
        return (
            <div id={"editor-page"}>
                <h1>NOT ALLOWED</h1>
                <a href="/">[GO BACK]</a>
            </div>
        );
    }

    // Handle database save logic (add or update recipe)
    const handlePush = () => {
        if (allRecipes.find((x) => x.id === recipe.id)) {
            // recipe exists | edit
            fetch('/api/recipe.handler', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipe),
            })
                .then((response) => response.json())
                .then((data) => {console.log("PUT response", data); setSnackbarText("Edited successfully!"); setOpenSnackBar(true);
                   // setInterval(() => {location.href = "/"}, 500);
                });
        } else {
            if (recipe.author){return}
            fetch('/api/recipe.handler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipe),
            })
                .then((response) => response.json())
                .then((data) => {console.log("POST response", data); setSnackbarText("Added successfully!"); setOpenSnackBar(true) });
            setInterval(() => {location.href = "/"}, 500);
        }
    };

    const addStepFunc = (value) => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        newRecipe.steps.push(typeof value === "string" ? value : "");
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
                : { ingredient: "" }
        );
        setRecipe(newRecipe);
    };

    const addGroupFunc = (value) => {
        let newRecipe = JSON.parse(JSON.stringify(recipe));
        newRecipe.ingredients.push(
            typeof value === "object" && !Array.isArray(value) && value.ingredient
                ? value
                : { type: "Group", ingredients: [] }
        );
        setRecipe(newRecipe);
    };

    return (
        <div id={"editor-page"}>
            <Snackbar
                anchorOrigin={{vertical: "top", horizontal: "center"}}
                open={openSnackBar}
                autoHideDuration={1000}
                onClose={handleSnackBarClose}
                message={snackbarText}
            />
            <div id={"editor-page-header"}>
                <Icon
                    children={<ExitToAppIcon />}
                    btnText={"HOME"}
                    href={id ? `recipes/${id}` : "/"}
                />
                <Icon
                    children={<HelpOutlineIcon />}
                    btnText={"Help"}
                    clickEvent={handleOpen}
                />
                <Modal open={open} onClose={handleClose}>
                    <div id={"recipe-editor-helper"}>
                        <h1>Recipe Help Guide</h1>
                        <div className={"container"}>
                            <h2>SYMBOLS</h2>
                            <h3>General</h3>
                            <div className={"symbol-help"}>
                                <AddToQueueIcon />
                                <span>Push This to Database</span>
                            </div>
                            <div className={"symbol-help"}>
                                <ExitToAppIcon />
                                <span>Leave Editor (go back to recipe if not new)</span>
                            </div>
                            {process.env.NODE_ENV !== 'production' ?<div className={"symbol-help"}>
                                <CodeIcon />
                                <span>DEBUG: View Recipe in console</span>
                            </div> : <></>
                            }
                            <h3>Editing</h3>
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
                        <div className={"container"}>
                            <h2>Recipe</h2>
                            <i>Properties</i>
                            <table>
                            <thead>
                                <tr>
                                    <th>TERM</th>
                                    <th>DESCRIPTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Access</td>
                                    <td>Who can view it? If set public, anyone can view it. Set to private so only you can access it!</td>
                                </tr>
                                <tr>
                                    <td>Recipe Name</td>
                                    <td>Name of the recipe.</td>
                                </tr>
                                <tr>
                                    <td>Time</td>
                                    <td>How long it takes (prep and cooking) in minutes</td>
                                </tr>
                                <tr>
                                    <td>Category</td>
                                    <td>What type of recipe this is by category; you can make a new one up!</td>
                                </tr>
                                <tr>
                                    <td>Servings</td>
                                    <td>Determine how many servings this recipe produces.</td>
                                </tr>
                            </tbody></table>
                        </div>
                        <div className={"container"}>
                            <h2>Ingredients</h2>
                            <i>Properties</i>

                            <table>
                                <thead>
                                <tr>
                                    <th>Term</th>
                                    <th>Requirements</th>
                                    <th>Description</th>
                                    <th>Example</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>Ingredient Name</td>
                                    <td>Text</td>
                                    <td>A REQUIRED field. The name of the ingredient.</td>
                                    <td>Flour, Lemon</td>
                                </tr>
                                <tr>
                                    <td>Measurement</td>
                                    <td>Text</td>
                                    <td>The measurement method of the ingredient</td>
                                    <td>Cups, Large</td>
                                </tr>
                                <tr>
                                    <td>Amount</td>
                                    <td>Number</td>
                                    <td>The numeric amount of the ingredient</td>
                                    <td>2</td>
                                </tr>
                                <tr>
                                    <td>Comments</td>
                                    <td>Text</td>
                                    <td>The extra comments for an ingredient</td>
                                    <td>Enriched, Zested</td>
                                </tr>
                                </tbody></table>
                        </div>
                        <div className={"container"}>
                            <h2>Notes</h2>
                            <ul>
                                <li>Scroll down the editor to view the Ingredients/Steps if it's long!</li>
                                <li>Copy steps, then click the paste from clipboard button to make it easier!</li>
                            </ul>
                        </div>
                    </div>
                </Modal>
                <Icon
                    children={<AddToQueueIcon />}
                    btnText={recipe.author ? "Update Recipe" : "Save Recipe"}
                    clickEvent={handleOpenConf}
                />
                {process.env.NODE_ENV !== 'production' ? <Icon
                    children={<CodeIcon />}
                    btnText={"Log Recipe"}
                    clickEvent={() => {console.log(recipe)}}
                /> : <></>
                }
                <Dialog
                    open={openConfirmation}
                    onClose={handleCloseConf}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogContent>
                        Confirming you want to push this recipe as is to the database.
                    </DialogContent>
                    <DialogActions>
                        <button className={"dialog-btn"} onClick={handleCloseConf}>No</button>
                        <button className={"dialog-btn"} onClick={() => {handleCloseConf();  handlePush()}} autoFocus>
                            Yes
                        </button>
                    </DialogActions>
                </Dialog>
                <h1>Recipes V4 Editor</h1>
            </div>

            <EditorPageMeta recipe={recipe} categories={categories} setRecipe={setRecipe} status={status} session={data ? data : false}/>

            <div className={"container flex"}>
                {recipe.author ? <Confirm
                    btnClasses={"const"}
                    btnText={"Delete Recipe"}
                    children={<DeleteOutlineIcon />}
                    dialogHeader={"Confirmation"}
                    dialogText={"Are you sure you want to delete this recipe?"}
                    dialogFunction={() => {
                        fetch('/api/recipe.handler', {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(recipe),
                        })
                            .then((response) => response.json())
                            .then((data) => {console.log("DELETE response", data); setSnackbarText("Removed successfully!"); setOpenSnackBar(true) });
                        setInterval(() => {location.href = "/"}, 500); ;
                        // setTimeout(() => {location.href = "/"}, 1000);
                    }}
                /> : <></>
                }
                <Icon
                    btnClass={"const " + (viewGroup === "Ingredients" ? "selected" : "")}
                    children={<VisibilityIcon />}
                    btnText={"Ingredients"}
                    clickEvent={() => {
                        setViewGroup("Ingredients")
                    }}
                />
                <Icon
                    btnClass={"const " + (viewGroup === "Steps" ? "selected" : "")}
                    children={<VisibilityIcon />}
                    btnText={"Steps"}
                    clickEvent={() => {
                        setViewGroup("Steps")
                    }}
                />
            </div>

            {/* INGREDIENTS */}
            <div id={"editor-page-ingredients"} style={{display: viewGroup !== "Ingredients" ? "none" : ""}}>
                <h2>INGREDIENTS</h2>
                {recipe.ingredients.map((value, index) => (
                    <EditIngredient key={"ingredient" + index} Index={index} ingredient={value} setRecipe={setRecipe} recipe={recipe}/>
                ))}
                <div id={"edit-bot-btns"}>
                    <Icon
                        children={<NoteAddIcon />}
                        btnClass={"add const"}
                        clickEvent={() => {addIngrFunc(); handleClickSnackBar(); setSnackbarText("Added Ingredient to Ingredients!");}}
                        btnText={"Add Ingredient"}
                    ></Icon>
                    <Icon
                        children={<CreateNewFolderIcon />}
                        btnClass={"group const"}
                        clickEvent={() => {addGroupFunc(); handleClickSnackBar(); setSnackbarText("Added Group to Ingredients!");}}
                        btnText={"Add Group"}
                    ></Icon>
                </div>
            </div>

            {/* STEPS */}
            <div id={"editor-page-steps"} style={{display: viewGroup !== "Steps" ? "none" : ""}}>
                <h2>STEPS</h2>
                <div className={"edit-steps"}>
                    {recipe.steps.map((value, index) => (
                        <EditStep key={"step" + index} stepIndex={index} v={value} setRecipe={setRecipe} recipe={recipe}/>
                    ))}
                </div>
                <div id={"edit-bot-btns"}>
                    <Icon
                        children={<NoteAddIcon />}
                        btnClass={"add const"}
                        clickEvent={() => {addStepFunc(); handleClickSnackBar(); setSnackbarText("Added step to recipe!");}}
                        btnText={"Add Step"}
                    ></Icon>
                    <Icon
                        children={<ContentPasteGoOutlinedIcon />}
                        btnClass={"group const"}
                        clickEvent={() => {stepPaste(); handleClickSnackBar(); setSnackbarText("Pasted new step from clipboard!");}}
                        btnText={"Paste From Clipboard"}
                    ></Icon>
                </div>
            </div>
            <Icon
                btnText={"Back to Top"}
                clickEvent={(event) => {
                    console.log(event)
                    window.scrollTo({top: 0, behavior: "smooth"})
                }}
            />
        </div>
    );
}
