import client from "@/lib/mongoconnect";
import * as React from "react";
import RecipeList from "@/components/recipelist"
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
  return (
    <>
      {isConnected ? (<div id={"content"}>
            <h1 style={{textAlign:"center"}}>Recipes V4</h1>
              <RecipeList />
          </div>
      ) : (
        <h1>NOT CONNECTED</h1>
      )}
    </>
  );
}
