import * as React from 'react';
import useSWR from "swr";
const fetcher = (url) => fetch(url).then(res => res.json())

import Recipe from '@/components/recipe';
export default function RecipeList({status}){
    let { data, error } = useSWR(`/api/recipes`, fetcher)
    if (error) return <div>Failed to load: {JSON.stringify(error)}</div>
    if (!data) return <div />
    if (JSON.stringify(data) === "{}" || data.error){
        return(<div>"Not available."</div>)
    }
return (
    <div className={"recipe-list-div"}>
        {data.map(x => <Recipe status={status} recipe={x} key={x.id}/>)}
    </div>
        )
}