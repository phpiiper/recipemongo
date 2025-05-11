import * as React from 'react';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import Icon from "@/components/Icon";
import fontColorContrast from "font-color-contrast";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState, useEffect } from "react";

export default function Recipe({ recipe, status, session, userPrefs, setUserPrefs, savePreferences}) {
    const [isEffect, setIsEffect] = useState(false)
    useEffect(() => {
        if (isEffect && savePreferences) {
            const result = savePreferences(userPrefs);
            setIsEffect(false)
        }
    }, [isEffect]);

    let r = recipe;
    let time = "";
    if (r.time) {
        let th = Math.floor(r.time / 60); let tm = r.time % 60;
        if (th > 0) { time += th + " hr" + (th > 1 ? "s " : " ") }
        if (tm > 0) { time += tm + " min" }
    }

    // Get the category color from userPrefs, default to blank if not available
    let cs = userPrefs && userPrefs.categories ? userPrefs.categories : undefined;
    let th = userPrefs && userPrefs.theme;
    let num = 80;
        if (th && th.includes("Dark")){   num = 33;  }
        if (th && th.includes("Light")){   num = 80;  }
    const categoryColor = cs ? cs[r.cat]+num : ""
    let borderColor = fontColorContrast(categoryColor)

    return (
        <div className={'recipe-div'} style={{ backgroundColor: categoryColor }}>
            <span className={'recipe-category'}>{r.cat}</span>
            <span
                className={'recipe-name'}
                style={{
                    "--recipe-name-shadow": borderColor
                }}
            ><a href={`/recipes/${r.id}`}>
                {r.name}
            </a></span>
            <span className={'recipe-time'}>{time}</span>
            <div style={{ display: "flex", gap: "1rem" }}>
                {status === "authenticated" ? (
                    <Icon btnClass="icons-hidden" children={userPrefs && userPrefs.favorites.includes(r.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />} clickEvent={() => {
                        let newFavs;
                        if (userPrefs.favorites.includes(r.id)) {
                            // REMOVE RECIPE TO FAVORITES
                            newFavs = userPrefs.favorites.filter(x => x !== r.id)
                        } else {
                            // ADD RECIPE TO FAVORITES
                            newFavs = userPrefs.favorites.concat([r.id])
                        }
                        setUserPrefs((prevUserPrefs) => ({
                            ...prevUserPrefs,
                            favorites: newFavs,
                        }))
                        setIsEffect(true)

                    }} btnText={"Favorite"} />
                ) : <></>}
                <Icon children={<MenuBookIcon />} href={`/recipes/${r.id}`} btnText={"View Recipe"} />
                {status === "authenticated" && session.user.name === r.author ? (
                    <Icon children={<EditIcon />} href={`/editor?id=${r.id}`} btnText={"Edit Recipe"} />
                ) : <></>}
            </div>
        </div>

    );
}
