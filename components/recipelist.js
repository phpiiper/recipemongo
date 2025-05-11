import * as React from 'react';
import Recipe from '@/components/recipe';
export default function RecipeList({status,session, recipes, userPrefs, isLoading=false, setUserPrefs, savePreferences}){
    if (JSON.stringify(recipes) === "{}" || recipes.error){
        return(<div>"Not available."</div>)
    }
    if (isLoading){
        return(<div id={"loading-div"}>LOADING RECIPES</div>)
    }
    if (JSON.stringify(recipes) === "[]"){
        return(<div>No recipes matching these filters.</div>)
    }
return (
    <div className={"recipe-list-div"}>
        {recipes.map(x => <Recipe status={status} session={session} recipe={x} key={x.id} userPrefs={userPrefs} setUserPrefs={setUserPrefs} savePreferences={savePreferences}/>)}
    </div>
        )
}