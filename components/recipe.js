import * as React from 'react';
export default function Recipe( {recipe} ){
    let r = recipe;
    let time = "";
    if (r.time){
        let th = Math.floor(r.time/60); let tm = r.time%60
        if (th > 0) {time += th + " hr" + (th>1 ? "s " : " ")}
        if (tm > 0) {time += tm + " min"}
    }
return (
    <div className={"recipe-div"}>
        <span className={"recipe-category"}>{r.cat}</span>
        <span className={"recipe-name"}>{r.name}</span>
        <span className={"recipe-time"}>{time}</span>
        <div>
            <button className={"recipes-button"}><a href={`/recipes/${r.id}`}>VIEW</a></button>
        </div>
    </div>
        )
}