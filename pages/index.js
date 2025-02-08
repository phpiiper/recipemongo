"use client";
import client from "@/lib/mongoconnect";
import * as React from "react";
import RecipeList from "@/components/recipelist";
import Filters from "@/components/Filters";
import { signIn, signOut, useSession } from "next-auth/react";
import useSWR from "swr";
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
  const [filterList, setFilterList] = useState({
    name: "", ingredients: "", cat: ""
  });

  // API query parameters (updates after debounce)
  const [debouncedSearch, setDebouncedSearch] = useState({ name: "", ingredients: "", cat: "" });

  // Debounce API request (waits for user to stop typing before updating API call)
    const debouncedUpdateSearch = useCallback(
        debounce((value, type) => {
            setDebouncedSearch((prev) => ({
                ...prev,
                [type]: value ? value.trim() : "", // Ensure it's always a string
            }));
        }, 500),
        []
    );


  // Function to update state immediately when typing
  const handleInputChange = (type, value) => {
    setFilterList((prev) => ({...prev, [type]: value}));
    debouncedUpdateSearch(value, type);
  };

  // Construct API URL dynamically (only add parameters if they have values)
    const queryParams = new URLSearchParams(
        Object.entries(debouncedSearch)
            .filter(([_, value]) => value) // Remove empty values
    );

    const apiUrl = `/api/recipes?${queryParams.toString()}`;

  // Use SWR for fetching data
  const { data, error } = useSWR(apiUrl, fetcher, { revalidateOnFocus: false });

  if (error) return <div>Failed to load: {JSON.stringify(error)}</div>;
  if (status === "loading") return <div>Loading...</div>;
  if (!isConnected) return <h1>NOT CONNECTED</h1>;

  return (
      <div id="content">
        <div id="home-bar">
          {status === "unauthenticated" ? (<button onClick={() => signIn()}>Sign in</button>) : <></>}
          {status === "authenticated" ? (<button onClick={() => signOut()}>Sign Out</button>) : <></>}
            {status === "authenticated" ? (<button><a href={"/preferences"}>Preferences</a></button>) : <></>}
          <h1 style={{ textAlign: "center" }}>Recipes V4</h1>

          {status === "authenticated" ? (
              <span className="link" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <EditIcon fontSize="24px" />
            <a href="editor">Create Recipe</a>
          </span>
          ) : <></>}

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

        <RecipeList status={status} recipes={data || []} /> :
      </div>
  );
}
