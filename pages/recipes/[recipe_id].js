import { useRouter } from 'next/router'
import useSWR from 'swr'
import Head from "next/head";
import * as React from "react";
import Ingredient from "@/components/ingredient"
import Step from "@/components/step"
import {useState} from "react";
import { useSession } from "next-auth/react"
import EditIcon from '@mui/icons-material/Edit';
import Icon from "@/components/Icon";
import HomeIcon from "@mui/icons-material/Home";
import TextField from "@mui/material/TextField";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import VisibilityIcon from "@mui/icons-material/Visibility";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
const fetcher = (url) => fetch(url).then(res => res.json())
export default function RecipePage() {
    const { status, data: sessionData } = useSession();
    const [sizing, setSizing] = useState(1);
    const [visibleIngredient, setVisibleIngredient] = useState(true);
    const [visibleSteps, setVisibleSteps] = useState(true);
    const r = useRouter();
    const { recipe_id } = r.query;
    let { data, error } = useSWR(recipe_id ? `/api/getrecipe?id=${recipe_id}` : null, recipe_id ? fetcher : null)
    if (error) return (<div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: "2rem", padding: "2rem"}}>
        <h2>Unknown Recipe (or invalid access)</h2>
        <button><a href={"/"}>GO BACK</a></button>
    </div>)
    if (!data) return <div />
    if (JSON.stringify(data) === "{}" || data.error){
        return(<div>"Not available."</div>)
    }
    let ig = data.ingredients;
    const sizingArray = [0.25,0.5,0.75,1,1.25,1.5,1.75,2]
    let compactClass = getComputedStyle(document.documentElement).getPropertyValue('--compactSize');
    function handleSizing(){
    }
    let time = "";
    if (data.time){
        let th = Math.floor(data.time/60); let tm = data.time%60;
        if (th > 0) {time += th + " hr" + (th>1 ? "s " : " ")}
        if (tm > 0) {time += tm + " min"}
    }

    return (<>
        <Head>
            <title>{"RecipesV4" + " | " + data.name}</title>
        </Head>
        <div id={"recipe-page"} className={compactClass}>
            <div className={"top"}>
                <div className={"icon-btn-group row"}>
                    <Icon children={<HomeIcon />} href={"/"} btnText={"HOME"} />
                    {status === "authenticated" && sessionData.user.name === data.author ?
                        <Icon children={<EditIcon />} href={`../editor?id=${recipe_id}`} btnText={"Edit Recipe"} /> : <></>
                    }
                </div>
                <div className={"meta"}>
                    <span className={"recipe-name"}>{data.name}</span>
                    <span className={"recipes-category"}>{data.cat}</span>
                    {data.servings ? <span className={"recipe-serving-size"}>{!isNaN(data.servings) ? JSON.parse(data.servings)*sizing : 0} Serving{Number(data.servings) * sizing > 1 ? 's' : ''} </span> : <></>}
                    <span className={"recipe-time"}>{time}</span>
                </div>
                <div style={{paddingTop: "1rem"}}>
                    <TextField
                        id="sizing"
                        value={sizing}
                        onChange={(event) => {
                            setSizing(event.target.value)
                        }}
                        style={{ width: "4rem", minWidth: "8rem" }}
                        inputProps={{
                            'aria-label': 'sizing',
                            'min': 0, 'step': 0.25
                        }}
                        label="Ingredient Scale"
                        type={"number"}
                    />
                    {/*   sizingArray.map(x => <button key={"sizing-btn-"+x} id={x===1 ? "checkedSizingBtn" : ""} className={"sizing-button"} data-data={x} onClick={handleSizing}>{x.toFixed(2) +"x"}</button> ) */}
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
                <div id={"steps-div"} style={{display: visibleSteps ? "flex" : "none"}}>
                    <h1>STEPS</h1>
                    {data.steps.map((x,index) => <Step step={x} num={index+1} key={data.id + "-s-" + index} />) }
                </div>
                <div id={"ingredients-div"} style={{display: visibleIngredient ? "flex" : "none"}}>
                    <h1>INGREDIENTS</h1>
                    {ig.map((x,index) => <Ingredient ingredient={x} key={data.id + "-i-" + index} sizing={sizing} ingIndex={index}/>) }
                </div>
            </div>
            <Icon
                btnText={"Back to Top"}
                btnClass={"back-to-top"}
                clickEvent={() => {
                    window.scrollTo({top: 0, behavior: "smooth"})
                }}
            />
        </div>
    </>)}