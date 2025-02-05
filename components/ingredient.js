import * as React from 'react';
import Fraction from "fraction.js";
export default function Ingredient( {ingredient, sizing=1} ){
    let i = ingredient; let amount;
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
    if (i.type){
        return (
            <div className={"ingredient-div-category"}>
                <span>{i.type.toUpperCase()}</span>
                {i.ingredients.map((x) => (
                <div className={"ingredient-div-category-item"} key={crypto.randomUUID()}>
                    <span>{">"}</span>
                    <Ingredient ingredient={x}/>
                </div>
                ))}
            </div>
        )
    } else {
        return (
            <div className={"ingredient-div"}>
                {i.amount ? <span className={"ingredient-div-amount"}>{amount}</span> : <></>}
                {i.size ? <span className={"ingredient-div-size"}>{i.size}</span> : <></>}
                {i.ingredient ? <span className={"ingredient-div-ingredient"}>{i.ingredient}</span> : <></>}
                {i.comment ? <span className={"ingredient-div-comments"}>{
                    i.comment.join("; ")
                }</span> : <></>}
            </div>
        )
    }
}