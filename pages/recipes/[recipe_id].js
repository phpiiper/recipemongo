import { useRouter } from 'next/router'
import useSWR from 'swr'
import Head from "next/head";
import * as React from "react";
import Ingredient from "@/components/ingredient"
import Step from "@/components/step"
import {useEffect, useState} from "react";
import { useSession } from "next-auth/react"
import EditIcon from '@mui/icons-material/Edit';
import Icon from "@/components/Icon";
import HomeIcon from "@mui/icons-material/Home";
import TextField from "@mui/material/TextField";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useMediaQuery } from 'react-responsive'
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Modal from "@mui/material/Modal";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {isMobile} from "react-device-detect";


const fetcher = (url) => fetch(url).then(res => res.json())
export default function RecipePage() {
    const { status, data: sessionData } = useSession();
    const [sizing, setSizing] = useState(1);
    const [visibleIngredient, setVisibleIngredient] = useState(true);
    const [visibleSteps, setVisibleSteps] = useState(true);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const r = useRouter();
    const { recipe_id } = r.query;
    let { data, error } = useSWR(recipe_id ? `/api/getrecipe?id=${recipe_id}` : null, recipe_id ? fetcher : null)
    const isPhone = useMediaQuery({
        query: '(max-width: 600px)'
    })
    useEffect(() => {
        if (isPhone){
            setVisibleIngredient(true)
            setVisibleSteps(false)
        } else {
            setVisibleIngredient(true)
            setVisibleSteps(true)
        }
    }, [data,isMobile]);
    const [isEffect, setIsEffect] = useState(false)
    useEffect(() => {
        if (isEffect) {
            const result = savePreferences(userPrefs);
        }
    }, [isEffect]);


    const [userPrefs, setUserPrefs] = useState(null);
    useEffect(() => {
        if (status === "authenticated" && sessionData.user) {
            const fetchUserPrefs = async () => {
                const response = await fetch(`/api/user-apis/preferences`);
                const data = await response.json();
                setUserPrefs(data);
            };
            fetchUserPrefs();
        }
    }, [status, sessionData]);

    const savePreferences = async () => {
        try {
            const response = await fetch("/api/user-apis/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prefs: userPrefs }),
            });
            if (response.ok) {
                const result = await response.json();
                // console.log("Preferences saved:", result.message);
                return result
            } else {
                const errorData = await response.json();
                // console.error("Error saving preferences:", errorData.message);
                return errorData
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (error) return (<div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: "2rem", padding: "2rem"}}>
        <h2>Unknown Recipe (or invalid access)</h2>
        <button><a href={"/"}>GO BACK</a></button>
    </div>)
    if (!data) return <div />
    if (JSON.stringify(data) === "{}" || data.error){
        return(<div>"Not available."</div>)
    }
    let ig = data.ingredients;
    let compactClass = getComputedStyle(document.documentElement).getPropertyValue('--compactSize');
    let time = "";
    if (data.time){
        let th = Math.floor(data.time/60); let tm = data.time%60;
        if (th > 0) {time += th + " hr" + (th>1 ? "s " : " ")}
        if (tm > 0) {time += tm + " min"}
    }
    let servings = "";
    if (data.servings){
        let s = data.servings;
        if (typeof s === "number") { servings = s*sizing }
        if (typeof s === "string"){
            if (s.includes("-")){
                s = s.split("-").map(x => Number(x) * sizing);
                servings = s.join(" - ")
            } else {
                if (Number(s)){ servings = Number(s)*sizing }
            }
        }
    }

    return (<>
        <Head>
            <title>{"RecipesV4" + " | " + data.name}</title>
        </Head>
        <div id={"recipe-page"} className={compactClass}>
            <div className={"top"}>
                <div className={"icon-btn-group row"}>
                    <Icon children={<HomeIcon />} href={"/"} btnText={"HOME"} />
                    {status === "authenticated" ? (
                        <Icon btnClass="icons-hidden" children={userPrefs && userPrefs.favorites.includes(data.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />} clickEvent={() => {
                            let newFavs;
                            if (userPrefs.favorites.includes(data.id)) {
                                newFavs = userPrefs.favorites.filter(x => x !== data.id)
                            } else {
                                newFavs = userPrefs.favorites.concat([data.id])
                            }
                            setUserPrefs((prevUserPrefs) => ({
                                ...prevUserPrefs,
                                favorites: newFavs,
                            }))
                            setIsEffect(true)

                        }} btnText={"Favorite"} />
                    ) : <></>}
                    {data.notes && data.notes.trim().length > 0 ?
                        <><Icon
                            children={<HelpOutlineIcon />}
                            btnText={"Notes"}
                            clickEvent={handleOpen}
                        />
                            <Modal open={open} onClose={handleClose}>
                                <div id={"recipe-editor-helper"} className={"recipe-page"}>
                                    <h1>Recipe Notes</h1>
                                    <span>{data.notes}</span>
                                </div>
                            </Modal></>: <></>
                    }
                    {status === "authenticated" && sessionData.user.name === data.author ?
                        <Icon children={<EditIcon />} href={`../editor?id=${recipe_id}`} btnText={"Edit Recipe"} /> : <></>
                    }
                </div>
                <div className={"meta"}>
                        <TextField
                            id="sizing"
                            value={sizing}
                            onChange={(event) => {
                                setSizing(event.target.value)
                            }}
                            onKeyUp={(event) => {
                                setSizing(event.target.value)
                            }}
                            style={{ width: "4rem", marginTop: "0.5rem" }}
                            inputProps={{
                                'aria-label': 'sizing',
                                'min': 0, 'step': 0.25,
                                'style': {padding: '0.5rem'}
                            }}
                            label="Scale"
                            type={"number"}
                        />
                    <span className={"recipe-name"}>{data.name}</span>
                    <span className={"recipes-category"}>{data.cat}</span>
                    {servings ? <span className={"recipe-serving-size"}>{servings} Serving{servings !== 1 ? "s" : ""} </span> : <></>}
                    <span className={"recipe-time"}>{time}</span>
                </div>
            </div>
            <div className={"mobile-only-viewer container"}>
                <Icon
                    btnClass={"const"}
                    children={<VisibilityIcon />}
                    btnText={"Ingredients"}
                    clickEvent={() => {
                        setVisibleIngredient(true)
                        setVisibleSteps(false)
                    }}
                />
                <Icon
                    btnClass={"const"}
                    children={<VisibilityIcon />}
                    btnText={"Steps"}
                    clickEvent={() => {
                        setVisibleSteps(true)
                        setVisibleIngredient(false)
                    }}
                />
            </div>
            <div className={"bot"}>
            {   /*
                <div id={"steps-div"} style={{display: visibleSteps ? "flex" : "none"}} >
                    <h1>STEPS</h1>
                    {data.steps.map((x,index) => <Step step={x} num={index+1} key={data.id + "-s-" + index} />) }
                </div>
                <div id={"ingredients-div"} style={{display: visibleIngredient ? "flex" : "none"}}>
                    <h1>INGREDIENTS</h1>
                    {ig.map((x,index) => <Ingredient ingredient={x} key={data.id + "-i-" + index} sizing={sizing} ingIndex={index}/>) }
                </div>
                */
            }
            <PanelGroup autoSaveId={"mongorecipes-recipe-panel"} direction={"horizontal"} className={"recipe-panel"}>
                {visibleSteps && (<Panel
                    defaultSize={60}
                    minSize={30}
                    collapsible={false}
                    >
                    <div id={"steps-div"}>
                        <h1>STEPS</h1>
                        {data.steps.map((x,index) => <Step step={x} num={index+1} key={data.id + "-s-" + index} />) }
                    </div>
                </Panel>)}
                {!isPhone && (<PanelResizeHandle className={"panel-resize-handle"}/>) }
                {visibleIngredient && (<Panel
                    minSize={30}
                    collapsible={false}
                    >
                    <div id={"ingredients-div"}>
                        <h1>INGREDIENTS</h1>
                        {ig.map((x,index) => <Ingredient ingredient={x} key={data.id + "-i-" + index} sizing={sizing} ingIndex={index}/>) }
                    </div>
                </Panel>
                )}
            </PanelGroup>
            </div>
            {isPhone ? <></> : <Icon
                btnText={"Back to Top"}
                btnClass={"back-to-top"}
                clickEvent={() => {
                    window.scrollTo({top: 0, behavior: "smooth"})
                }}
            /> }
        </div>
    </>)}