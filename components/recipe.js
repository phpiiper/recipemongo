import * as React from 'react';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import Icon from "@/components/Icon";

export default function Recipe({ recipe, status, userPrefs }) {
    let r = recipe;
    let time = "";
    if (r.time) {
        let th = Math.floor(r.time / 60); let tm = r.time % 60;
        if (th > 0) { time += th + " hr" + (th > 1 ? "s " : " ") }
        if (tm > 0) { time += tm + " min" }
    }

    // Get the category color from userPrefs, default to blank if not available
    const categoryColor = userPrefs && userPrefs.categories[r.cat] ? userPrefs.categories[r.cat]+80 : '';

    return (
        <div className={"recipe-div"} style={{ backgroundColor: categoryColor }}>
            <span className={"recipe-category"}>{r.cat}</span>
            <span className={"recipe-name"}><a href={`/recipes/${r.id}`}>{r.name}</a></span>
            <span className={"recipe-time"}>{time}</span>
            <div style={{ display: "flex", gap: "1rem" }}>
                <Icon children={<MenuBookIcon />} href={`/recipes/${r.id}`} btnText={"View Recipe"} />
                {status === "authenticated" ? (
                    <Icon children={<EditIcon />} href={`/editor?id=${r.id}`} btnText={"Edit Recipe"} />) : <></>}
            </div>
        </div>
    );
}
