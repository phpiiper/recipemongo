"use client";
import client from "@/lib/mongoconnect";
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { debounce } from "lodash"; // Import lodash for debouncing
// ICONS
import EditIcon from '@mui/icons-material/Edit';
import LoginIcon from '@mui/icons-material/Login';
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

const fetcher = (url) => fetch(url).then((res) => res.json());

export const getServerSideProps = async () => {
    try {
        await client.connect();
        return {
            props: { isConnected: true },
        };
    } catch (e) {
        console.error(e);
        return {
            props: { isConnected: false },
        };
    }
};

export default function Home({ isConnected }) {
    const { status, data: sessionData } = useSession();
    const [filterList, setFilterList] = useState({   name: "", ingredients: "", cat: ""   });
    const [debouncedSearch, setDebouncedSearch] = useState({ name: "", ingredients: "", cat: "" });
    const debouncedUpdateSearch = useCallback(
        debounce((value, type) => {
            setDebouncedSearch((prev) => ({
                ...prev,
                [type]: value ? value.trim() : "",
            }));
        }, 500),
        []
    );
    const handleInputChange = (type, value) => {
        if (type === "reset"){
            setFilterList({ name: "", ingredients: "", cat: "" });
            setDebouncedSearch({ name: "", ingredients: "", cat: "" });
        } else {
            setFilterList((prev) => ({ ...prev, [type]: value }));
            debouncedUpdateSearch(value, type);
        }
    };
    // Construct API URL dynamically (only add parameters if they have values)
    const queryParams = new URLSearchParams(
        Object.entries(debouncedSearch)
            .filter(([_, value]) => value) // Remove empty values
    );
    const recipeListURL = `/api/recipes?${queryParams.toString()}`;
    // Use SWR for fetching data
    const { data, error } = useSWR(recipeListURL, fetcher, { revalidateOnFocus: false });
    const { data: ingredients, error: ingredientsError, isLoading: ingredientsLoading } = useSWR(`${recipeListURL}&getIngredients=yes`, fetcher, { revalidateOnFocus: false });
    const { data: categories, error: categoriesError, isLoading: categoriesLoading } = useSWR(`${recipeListURL}&getCategories=yes`, fetcher, { revalidateOnFocus: false });
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
                        <TextField
                            id="search-name-home-page"
                            className={"search-forms"}
                            placeholder="Search by name..."
                            value={filterList.name}
                            onChange={(event) => handleInputChange("name", event.target.value)}
                            label="Recipe Name"
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
                    }}
                    value={data?.length || ""}
                />
            </div>
            </div>

            {/* Pass userPrefs to RecipeList */}
            <RecipeList status={status} session={sessionData} recipes={data || []} userPrefs={userPrefs} />
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
