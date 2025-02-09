import * as React from 'react';
import Fraction from "fraction.js";
export default function Ingredient( {ingredient, ingIndex=0, sizing=1} ){
    let i = ingredient; let amount; let size;
    if (i.amount){
        let amt = Array.isArray(i.amount) ? i.amount.map(x => x*sizing) : (i.amount * sizing);
        if (Array.isArray(amt)){
            amount = amt.join(" - ")
        }
        else if (Number.isInteger(amt)){
            amount = amt;
        } else {
            let f = new Fraction(amt).simplify(0.1).toFraction(true).split(" ");
            let f1 = f.at(-1).includes("/") && f.length === 1? "" : f[0];
            let f2 = f.length > 1 ? f[1] : f[0]
            amount = <><span>{f1}</span><span className={"fraction"}>{f2}</span></>

        }
    }
    if (i.size){
        let rec = {
            tablespoon: "tbs",
            teaspoon: "tsp",
            pound: "lbs",
            ounce: "oz",
            cup: "cup",
            clove: "clove",
            bunch: "bunch",
        };
        let doShorten = getComputedStyle(document.documentElement).getPropertyValue('--shorten-measurements');
        function mapUnit(input) {
            const unitMap = rec;
            const normalizedInput = input.trim().toLowerCase().replace(/s$/, '');
            return unitMap[normalizedInput] || input; // Return mapped value or null if not found
        }
        size = doShorten === 'true' ? mapUnit(i.size) : i.size;
    }
    if (i.type){
        return (
            <div className={"ingredient-div-category"}>
                <span>{i.type.toUpperCase()}</span>
                {i.ingredients.map((value,index) => (
                <div className={"ingredient-div-category-item"} key={"ing-cat-"+index}>
                    <span>{">"}</span>
                    <Ingredient ingredient={value} sizing={sizing} ingIndex={typeof ingIndex === "number" ? [ingIndex,index] : ingIndex.concat(index)}/>
                </div>
                ))}
            </div>
        )
    } else {
        return (
            <div className={"ingredient-div"}>
                {i.amount ? <span className={"ingredient-div-amount"}>{amount}</span> : <></>}
                {size ? <span className={"ingredient-div-size"}>{size}</span> : <></>}
                {i.ingredient ? <span className={"ingredient-div-ingredient"}>{i.ingredient}</span> : <></>}
                {i.comment ? <span className={"ingredient-div-comments"}>{
                    i.comment.join("; ")
                }</span> : <></>}
            </div>
        )
    }
}
