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
import ContentPasteGoOutlinedIcon from '@mui/icons-material/ContentPasteGoOutlined';
import KeyboardDoubleArrowUpOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowUpOutlined';
import KeyboardDoubleArrowDownOutlinedIcon from '@mui/icons-material/KeyboardDoubleArrowDownOutlined';
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
        name: "New Recipe",
        cat: "New Category",
        time: 30,
        ingredients: [],
        steps: [],
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

    if (status === "unauthenticated") {
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
            fetch('/api/recipe.handler', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipe),
            })
                .then((response) => response.json())
                .then((data) => {console.log("PUT response", data); setSnackbarText("Edited successfully!"); setOpenSnackBar(true); setInterval(() => {location.href = "/"}, 500); });
        } else {
            fetch('/api/recipe.handler', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipe),
            })
                .then((response) => response.json())
                .then((data) => {console.log("POST response", data); setSnackbarText("Added successfully!"); setOpenSnackBar(true); setInterval(() => {location.href = "/"}, 500); });
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
            <Snackbar
                anchorOrigin={{vertical: "top", horizontal: "center"}}
                open={openSnackBar}
                autoHideDuration={1000}
                onClose={handleSnackBarClose}
                message={snackbarText}
            />
            <div id={"editor-page-header"}>
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
                            <h3>General</h3>
                            <div className={"symbol-help"}>
                                <CodeIcon />
                                <span>DEBUG: View Recipe in console</span>
                            </div>
                        </div>
                        <div className={"container"}>
                            <h2>Ingredients</h2>
                            <i>Properties</i>
                            <ul>
                                <li>[Required] [Text] Name - The name of the recipe (Lemon)</li>
                                <li>[Optional] [Text] Measurement - The measurement method of the ingredient (Large)</li>
                                <li>[Optional] [Num] [-] Amount - The numeric amount of an ingredient (2)</li>
                                <li>[Optional] [Text] Comments - The extra comments for an ingredient (zested)</li>
                            </ul>
                        </div>
                        <div className={"container"}>
                            <h2>Notes</h2>
                            <ul>
                                <li>Scroll down the editor to view the Ingredients!</li>
                                <li>Use the extra space to the right to scroll down without scrolling down the Ingredient container!</li>
                            </ul>
                        </div>
                    </div>
                </Modal>
                <Icon
                    children={<ExitToAppIcon />}
                    btnText={"HOME"}
                    href={id ? `recipes/${id}` : "/"}
                />
                <Icon
                    children={<AddToQueueIcon />}
                    btnText={"Add to DB"}
                    clickEvent={handleOpenConf}
                />
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
                    <button className={"add"} onClick={() => {addIngrFunc(); handleClickSnackBar(); setSnackbarText("Added Ingredient to Ingredients!");}}
                    > + Add Ingredient </button>
                    <button className={"group"} onClick={() => {addGroupFunc(); handleClickSnackBar(); setSnackbarText("Added Group to Ingredients!");}}
                    > + Add Group </button>
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
                    <button className={"add"} onClick={() => {addStepFunc(); handleClickSnackBar(); setSnackbarText("Added step!");}}
                    >  + Add Step </button>
                    <button className={"copy"} onClick={() => {stepPaste(); handleClickSnackBar(); setSnackbarText("Pasted step from clipboard!");}}
                    > + Paste From Clipboard </button>
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
