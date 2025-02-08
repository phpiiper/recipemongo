"use client";
import client from "@/lib/mongoconnect";
import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import { debounce } from "lodash"; // Import lodash for debouncing
import { useUserPreferences } from '@/contexts/UserPreferencesContext'; // Import context
import "@/styles/home-page.css";
// ICONS
import EditIcon from '@mui/icons-material/Edit';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
// CUSTOM COMPONENTS
import RecipeList from "@/components/recipelist";
import Filters from "@/components/Filters";
import Icon from "@/components/Icon";

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
    // >>>> USER PREFERENCES <<<< //
    const { fontFamily, setFontFamily, fontSize, setFontSize } = useUserPreferences();
    const [localFontFamily, setLocalFontFamily] = useState(fontFamily);
    const [localFontSize, setLocalFontSize] = useState(fontSize);
    // >>>> USER PREFERENCES END <<<< //
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
        setFilterList((prev) => ({ ...prev, [type]: value }));
        debouncedUpdateSearch(value, type);
    };
    // Construct API URL dynamically (only add parameters if they have values)
    const queryParams = new URLSearchParams(
        Object.entries(debouncedSearch)
            .filter(([_, value]) => value) // Remove empty values
    );
    const recipeListURL = `/api/recipes?${queryParams.toString()}`;
    // Use SWR for fetching data
    const { data, error } = useSWR(recipeListURL, fetcher, { revalidateOnFocus: false });
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
        <div id="content">
            <div id="home-bar">
                {status === "unauthenticated" ? (<button onClick={() => signIn()}><LoginIcon /></button>) : <></>}
                {status === "authenticated" ? (<Icon children={<LogoutIcon />} clickEvent={() => signOut()} btnText={"Sign Out"} />) : <></>}
                {status === "authenticated" ? (<Icon children={<AccountBoxIcon />} href={"/preferences"} btnText={"Preferences"} />) : <></>}
                {status === "authenticated" ? (
                    <Icon children={<EditIcon />} href={"/editor"} btnText={"Create Recipe"} />
                ) : <></>}

                <h1 style={{ textAlign: "center", lineHeight: "0" }}>Recipes V4</h1>

                <Filters
                    Filters={filterList}
                    onChangeFunction={handleInputChange}
                    List={{
                        categories: data
                            ? [...new Set(data.map((x) => x.cat).filter(Boolean).map(String))]
                            : []
                    }}
                />
            </div>

            {/* Pass userPrefs to RecipeList */}
            <RecipeList status={status} recipes={data || []} userPrefs={userPrefs} />
        </div>
    );
}
