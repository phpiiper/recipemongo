"use client"
import client from "@/lib/mongoconnect";
import * as React from "react";
import RecipeList from "@/components/recipelist";
import { signIn, signOut, useSession } from "next-auth/react"

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


export default function Home({isConnected}) {
    const { status } = useSession();
  return (
    <>
      {isConnected ? (<div id={"content"}>
            <div id={"home-bar"}>
              {(status === "unauthenticated") ? <button onClick={() => signIn()}>Sign in</button> : <></>}
              {(status === "authenticated") ?
                  <button onClick={() => signOut()}>Sign Out</button> : <></>}
              <h1 style={{textAlign:"center"}}>Recipes V4</h1>
              {(status === "authenticated") ?
                  <button><a href={"editor"}>Recipe Editor</a></button> : <></>}
            </div>
              <RecipeList status={status === "authenticated"}/>
          </div>
      ) : (
        <h1>NOT CONNECTED</h1>
      )}
    </>
  );
}
