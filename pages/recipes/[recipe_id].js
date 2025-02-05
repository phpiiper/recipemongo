import { useRouter } from 'next/router'
import useSWR from 'swr'
import Head from "next/head";
import * as React from "react";
import Ingredient from "@/components/ingredient"
import Step from "@/components/step"
import {useState} from "react";
const fetcher = (url) => fetch(url).then(res => res.json())

export default function RecipePage() {
    const [sizing, setSizing] = useState(1);
    const r = useRouter();
    const { recipe_id } = r.query;
    let { data, error } = useSWR(recipe_id ? `/api/getrecipe?id=${recipe_id}` : null, recipe_id ? fetcher : null)
    if (error) return <div>Failed to load: {JSON.stringify(error) +"|||"+recipe_id}</div>
    if (!data) return <div />
    if (JSON.stringify(data) === "{}" || data.error){
        return(<div>"Not available."</div>)
    }
    let ig = data.ingredients;
    const sizingArray = [0.25,0.5,0.75,1,1.25,1.5,1.75,2]
    function handleSizing(event){
        let prev_btn = document.getElementById("checkedSizingBtn");
        if (prev_btn){prev_btn.id = null}
        let btn = event.currentTarget;
        if (btn.nodeName === "BUTTON"){
            btn.id = "checkedSizingBtn";
            setSizing(btn.dataset.data)
        }
    }
    let time = "";
    if (data.time){
        let th = Math.floor(data.time/60); let tm = data.time%60;
        console.log(data.time,th,tm)
        if (th > 0) {time += th + " hr" + (th>1 ? "s " : " ")}
        if (tm > 0) {time += tm + " min"}
    }

    return (<>
        <Head>
            <title>{"RecipesV4" + " | " + data.name}</title>
        </Head>
        <div id={"recipe-page"}>
            <div className={"top"}>
                <div className={"meta"}>
                    {1 === 2 ? <span>FAVE</span> : <></> }
                    <span className={"recipe-name"}>{data.name}</span>
                    <span className={"recipes-category"}>{data.cat}</span>
                    <span className={"recipe-time"}>{time}</span>
                    <button className={"back-btn"}>
                        <a href={"/"}>BACK</a>
                    </button>
                </div>
                <div className={"sizing"}>
                    <span className={"sizing-text"}>SIZING</span>
                    {sizingArray.map(x => <button key={"sizing-btn-"+x} id={x===1 ? "checkedSizingBtn" : ""} className={"sizing-button"} data-data={x} onClick={handleSizing}>{x.toFixed(2) +"x"}</button> )}
                </div>
            </div>
            <div className={"bot"}>
                <div id={"steps-div"}>
                    <h1>STEPS</h1>
                    {data.steps.map((x,index) => <Step step={x} num={index+1} key={data.id + "-s-" + index} />) }
                </div>
                <div id={"ingredients-div"}>
                    <h1>INGREDIENTS</h1>
                    {ig.map((x,index) => <Ingredient ingredient={x} key={data.id + "-i-" + index} sizing={sizing}/>) }
                </div>
            </div>
        </div>
    </>)}