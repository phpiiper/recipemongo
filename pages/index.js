"use client";
import client from "@/lib/mongoconnect";
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { debounce } from "lodash";
// ICONS
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SearchIcon from '@mui/icons-material/Search';
// CUSTOM COMPONENTS
import RecipeList from "@/components/recipelist";
import Filters from "@/components/Filters";
import Icon from "@/components/Icon";
import Head from "next/head";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import SignIn from "@/components/SignIn"
import Autocomplete from "@mui/material/Autocomplete";
import FavoriteIcon from "@mui/icons-material/Favorite";

const fetcher = (url) => fetch(url).then((res) => res.json());

export const getServerSideProps = async () => {
    try {
        await client.connect();
        return { props: { isConnected: true },  };
    } catch (e) {
        console.error(e);
        return {  props: { isConnected: false },   };
    }
};

export default function Home({ isConnected }) {
    const { status, data: sessionData } = useSession();
    const [filterList, setFilterList] = useState({   name: "", ingredients: "", cat: "", showFavorites: false   });
    const [debouncedSearch, setDebouncedSearch] = useState({ name: "", ingredients: "", cat: "", showFavorites: false });
    const debouncedUpdateSearch = useCallback(
        debounce((value, type) => {
            setDebouncedSearch((prev) => ({
                ...prev,
                [type]: typeof value === "boolean" ? value: (value ? value.trim() : ""),
            }));
        }, 500),
        []
    );
    const handleInputChange = (type, value) => {
        if (type === "reset"){
            setFilterList({ name: "", ingredients: "", cat: "", showFavorites: false });
            setDebouncedSearch({ name: "", ingredients: "", cat: "", showFavorites: false });
        } else {
            setFilterList((prev) => ({ ...prev, [type]: value }));
            debouncedUpdateSearch(value, type);
        }
    };

    const queryParams = new URLSearchParams(
        Object.entries(debouncedSearch)
            .filter(([_, value]) => value)
    );
    const recipeListURL = `/api/recipes?${queryParams.toString()}`;
    // Use SWR for fetching data
    const { data, error, isLoading } = useSWR(recipeListURL, fetcher, { revalidateOnFocus: false });
    const { data: ingredients, error: ingredientsError } = useSWR(`${recipeListURL}&getIngredients=yes`, fetcher, { revalidateOnFocus: false });
    const { data: categories, error: categoriesError } = useSWR(`${recipeListURL}&getCategories=yes`, fetcher, { revalidateOnFocus: false });
    const { data: recipesName, error: recipesError } = useSWR(`${recipeListURL}&getRecipes=yes`, fetcher, { revalidateOnFocus: false });
    // Fetch user preferences if authenticated
    const [userPrefs, setUserPrefs] = useState(null);
    useEffect(() => {
        if (status === "authenticated" && sessionData.user) {
            const fetchUserPrefs = async () => {
                const response = await fetch(`/api/user-apis/preferences`);
                const data = await response.json();
                setUserPrefs(data);
            };
            fetchUserPrefs();
        }
    }, [status, sessionData]);

    const savePreferences = async () => {
        try {
            const response = await fetch("/api/user-apis/preferences", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prefs: userPrefs }),
            });
            if (response.ok) {
                const result = await response.json();
                // console.log("Preferences saved:", result.message);
                return result
            } else {
                const errorData = await response.json();
                // console.error("Error saving preferences:", errorData.message);
                return errorData
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (error) return <div>Failed to load: {JSON.stringify(error)}</div>;
    if (status === "loading") return <div>Loading...</div>;
    if (!isConnected) return <h1>NOT CONNECTED</h1>;
    return (
        <>
        <Head>
            <title>Recipes V4</title>
        </Head>
        <div id="content">
            <div id={"home-bar"}>
                <h1 style={{ textAlign: "center", lineHeight: "1" }}>Recipes V4</h1>
                <div id={"home-bar-search-bar"}>
                    <FormControl variant="outlined" style={{ width: "80%", display: "flex", gap:"0.5rem" , flexDirection: "row", alignItems: "center", marginLeft: "10%"}}>
                        <label htmlFor={"search-name-home-page"}><SearchIcon /></label>
                        <Autocomplete
                            freeSolo
                            autoHighlight
                            options={Array.isArray(recipesName) ? recipesName : []}
                            getOptionLabel={(option) => option || ""}
                            sx={{ minWidth: 200 }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Recipe Name"
                                />)}
                            id="search-name-home-page"
                            label={"recipe Name"}
                            className={"search-forms"}
                            placeholder="Search by name..."
                            onChange={(event, newValue) => {
                                let r = data.find(x => x.name === newValue);
                                if (r){
                                    window.location.href = `/recipes/${r.id}`
                                }
                                // handleInputChange("name", newValue || event.target.value)
                            }}
                            onKeyUp={(event) => {
                                handleInputChange("name", event.target.value || "");
                            }}
                            value={filterList.name ? filterList.name : ""}
                        />
                    </FormControl>
                </div>
            <div id={"home-bar-button-list"}>
                {status === "unauthenticated" ? (<SignIn status={status}/>) : <></>}
                {status === "authenticated" ? (<Icon children={<LogoutIcon />} clickEvent={() => signOut()} btnText={"Sign Out"} />) : <></>}
                {status === "authenticated" ? (<Icon children={<AccountBoxIcon />} href={"/preferences"} btnText={"Preferences"} />) : <></>}
                {status === "authenticated" ? (
                    <Icon children={<EditIcon />} href={"/editor"} btnText={"Create Recipe"} />
                ) : <></>}
                {status === "authenticated" && process.env.NODE_ENV !== 'production' ? (
                    <Icon children={<FavoriteIcon />} clickEvent={()=> {
                        console.log(userPrefs)
                    }} btnText={"Print Prefs"} />
                ) : <></>}

                <Filters
                    FilterList={filterList}
                    onChangeFunction={handleInputChange}
                    List={{
                        categories: !categoriesError
                            ? categories
                            : [],
                        ingredients: !ingredientsError
                            ? ingredients
                            : [],
                        recipes: !recipesError
                            ? recipesName
                            : [],
                    }}
                    value={data?.length || ""}
                    recipes={data}
                    userPrefs={userPrefs}
                />
            </div>
            </div>

            {/* Pass userPrefs to RecipeList */}
            <RecipeList
                status={status}
                session={sessionData}
                recipes={data || []}
                userPrefs={userPrefs}
                isLoading={isLoading}
                setUserPrefs={setUserPrefs}
                functions={{
                    savePreferences: savePreferences
                }}
            />
            <Icon
                btnText={"Back to Top"}
                btnClass={"back-to-top"}
                clickEvent={(event) => {
                    console.log(event)
                    window.scrollTo({top: 0, behavior: "smooth"})
                }}
            />
        </div>
    </>)
}
