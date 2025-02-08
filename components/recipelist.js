import * as React from 'react';

import Recipe from '@/components/recipe';
export default function RecipeList({status,recipes, userPrefs}){
    if (JSON.stringify(recipes) === "{}" || recipes.error){
        return(<div>"Not available."</div>)
    }

return (
    <div className={"recipe-list-div"}>
        {recipes.map(x => <Recipe status={status} recipe={x} key={x.id} userPrefs={userPrefs}/>)}
    </div>
        )
}