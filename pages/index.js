"use client";
import client from "@/lib/mongoconnect";
import * as React from "react";
import RecipeList from "@/components/recipelist";
import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash"; // Import lodash for debouncing
import EditIcon from '@mui/icons-material/Edit';

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
  const { status } = useSession();

  // Controlled inputs
  const [searchName, setSearchName] = useState("");
  const [searchIngredients, setSearchIngredients] = useState("");

  // API query parameters (updates after debounce)
  const [debouncedSearch, setDebouncedSearch] = useState({ name: "", ingredients: "" });

  // Function to update state immediately when typing
  const handleInputChange = (type, value) => {
    if (type === "name") setSearchName(value);
    else if (type === "ingredients") setSearchIngredients(value);
    debouncedUpdateSearch(value, type); // Calls debounced function
  };

  // Debounce API request (waits for user to stop typing before updating API call)
  const debouncedUpdateSearch = useCallback(
      debounce((value, type) => {
        setDebouncedSearch((prev) => ({ ...prev, [type]: value.trim() }));
      }, 500), // Adjust debounce delay (500ms recommended)
      []
  );

  // Construct API URL dynamically (only add parameters if they have values)
  const queryParams = new URLSearchParams();
  if (debouncedSearch.name) queryParams.append("name", debouncedSearch.name);
  if (debouncedSearch.ingredients) queryParams.append("ingredients", debouncedSearch.ingredients);
  const apiUrl = `/api/recipes?${queryParams.toString()}`;

  // Use SWR for fetching data
  const { data, error } = useSWR(apiUrl, fetcher, { revalidateOnFocus: false });

  if (error) return <div>Failed to load: {JSON.stringify(error)}</div>;
  if (!data) return <div />;

  const recipes = data || [];

  return (
      <>
        {isConnected ? (
            <div id="content">
              <div id="home-bar">
                {status === "unauthenticated" && <button onClick={() => signIn()}>Sign in</button>}
                {status === "authenticated" && <button onClick={() => signOut()}>Sign Out</button>}
                <h1 style={{ textAlign: "center" }}>Recipes V4</h1>
                {status === "authenticated" && (
                    <span className={"link"} style={{display: "flex", alignItems: "center", gap: "0.25rem"}}>
                      <EditIcon fontSize={"24pxx"}/>
                      <a href="editor">Create Recipe</a>
                    </span>
                )}
                {/* Search by Name */}
                <FormControl variant="outlined" style={{ marginRight: "10px" }}>
                  <TextField
                      id="search-name"
                      className={"search-forms"}
                      placeholder="Search by name..."
                      value={searchName} // Controlled input
                      onChange={(event) => handleInputChange("name", event.target.value)}
                      label="Search Recipe"
                  />
                </FormControl>

                {/* Search by Ingredients */}
                <FormControl variant="outlined">
                  <TextField
                      id="search-ingredients"
                      className={"search-forms"}
                      placeholder="Search by ingredients (comma-separated)..."
                      value={searchIngredients} // Controlled input
                      onChange={(event) => handleInputChange("ingredients", event.target.value)}
                      label="Recipe Name"
                  />
                </FormControl>
              </div>
              <RecipeList status={status === "authenticated"} recipes={recipes} />
            </div>
        ) : (
            <h1>NOT CONNECTED</h1>
        )}
      </>
  );
}
