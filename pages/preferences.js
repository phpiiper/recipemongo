import * as React from "react";
import { useSession } from "next-auth/react";
import client from "@/lib/mongoconnect";
import "@/styles/preferences-page.css";
// Library Components
import Autocomplete from "@mui/material/Autocomplete";
import TextField from '@mui/material/TextField';
// SYMBOLS
import HomeIcon from '@mui/icons-material/Home';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import Snackbar from "@mui/material/Snackbar";
import ContentPasteGoOutlinedIcon from "@mui/icons-material/ContentPasteGoOutlined"; // Import context
import Confirm from "@/components/Confirm"
import Icon from "@/components/Icon";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SaveAsIcon from '@mui/icons-material/SaveAs';
const fetcher = (url) => fetch(url).then((res) => res.json());

export const getServerSideProps = async () => {
    try {
        await client.connect();
        return { props: { isConnected: true }, };
    } catch (e) {
        console.error(e);
        return {  props: { isConnected: false },  };
    }
};

export default function Preferences({ isConnected }) {
    const { data, status } = useSession();
    // >>>> USER PREFERENCES <<<< //
    const { fontFamily, setFontFamily, fontSize, setFontSize } = useUserPreferences();
    const [localFontFamily, setLocalFontFamily] = useState(fontFamily);
    const [localFontSize, setLocalFontSize] = useState(fontSize);

    const savePreferencesContext = () => {
        setFontFamily(localFontFamily);  // Update context with the new font family
        setFontSize(localFontSize);      // Update context with the new font size
    };
    // >>>> USER PREFERENCES END <<<< //
    const [userPrefs, setUserPrefs] = useState({
        fontFamily: "Calibri",
        fontSize: "18px",
        categories: {},
    });
    const [categoryOptions, setCategoryOptions] = useState([]); // State for category options

    useEffect(() => {
        const getPrefs = async () => {
            try {
                const response = await fetch('/api/user-apis/preferences');
                const data = await response.json();
                const updatedCategories = { ...data.categories };

                // Set categories from the user preferences response
                setUserPrefs({
                    ...data,
                    categories: updatedCategories,
                });
            } catch (error) {
                console.error("Error fetching preferences:", error);
            }
        };

        const getCategoryOptions = async () => {
            try {
                const response = await fetch('/api/recipes?getCategories=yes');
                const categoriesData = await response.json();
                setCategoryOptions(categoriesData.categories); // Assuming the response is a list of categories
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        if (status === "authenticated") {
            getPrefs();
            getCategoryOptions();
        }
    }, [status]);

    const fontFamiliesOptions = [
        "Calibri", "Times New Roman", "Gowun Dodum", "Ysabeau"
    ];
    const fontSizeOptions = [
        "14px", "16px", "18px", "20px", "22px", "24px"
    ];

    // Debounced function for updating category color
    const debouncedColorChange = useCallback(
        debounce((category, color) => {
            setUserPrefs((prev) => ({
                ...prev,
                categories: {
                    ...prev.categories,
                    [category]: color,
                },
            }));
        }, 500),
        [] // Ensure the debounced function is only created once
    );

    // >>>> SNACK BAR <<< //
    const [openSnackBar, setOpenSnackBar] = React.useState(false);
    const [snackbarText, setSnackbarText] = React.useState("Alert!");
    const handleClickSnackBar = () => { setOpenSnackBar(true);};
    const handleSnackBarClose = (event, reason) => {
        if (reason === 'clickaway') { return; }
        setOpenSnackBar(false);
    };
    // >>> END SNACKBAR <<< //


    const savePreferences = async (func) => {
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
                console.log("Preferences saved:", result.message);
            } else {
                const errorData = await response.json();
                console.error("Error saving preferences:", errorData.message);
            }
            if (typeof func === "function") {func();}
            location.reload();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    if (isConnected && status === "loading") {
        return (
            <div id={"preferences-page"}>
                <h1>Loading...</h1>
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div id={"preferences-page"}>
                <h1>NOT CONNECTED</h1>
                <a href="/">[GO BACK]</a>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div id={"preferences-page"}>
                <h1>NOT ALLOWED</h1>
                <a href="/">[GO BACK]</a>
            </div>
        );
    }

    return (
        <div id={"preferences-page"}>
            <Snackbar
                anchorOrigin={{vertical: "top", horizontal: "center"}}
                open={openSnackBar}
                autoHideDuration={1000}
                onClose={handleSnackBarClose}
                message={snackbarText}
            />
            <div id={"preferences-page-header"} className={"container row"}>
                <Icon children={<HomeIcon />} href={"/"} btnText={"HOME"} />
                <h1>PREFERENCES</h1>
                <span>({data.user.name})</span>
            </div>
            <div id={"preferences-page-body"} className={"container"}>
                <h1>SETTINGS</h1>
                <p>Change your account preferences.</p>
                <Confirm
                    dialogFunction={savePreferences}
                    dialogText={"Update to these preferences?"}
                    btnText={"Save Preferences"}
                    children={<SaveAsIcon />}
                />
                <h2>FONT SETTINGS</h2>
                <div className={"container row"}>
                    <FontDownloadIcon />
                    <Autocomplete
                        autoHighlight
                        id="fontFamily"
                        sx={{ width: 300 }}
                        options={fontFamiliesOptions}
                        value={userPrefs.fontFamily}
                        onChange={(event, newValue) => setUserPrefs(prev => ({ ...prev, fontFamily: newValue })) }
                        getOptionLabel={(option) => option}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Font Family"
                            />
                        )}
                    />
                </div>
                <div className={"container row"}>
                    <FormatSizeIcon />
                    <Autocomplete
                        autoHighlight
                        id="fontSize"
                        sx={{ width: 300 }}
                        options={fontSizeOptions}
                        value={userPrefs.fontSize}
                        onChange={(event, newValue) => setUserPrefs(prev => ({ ...prev, fontSize: newValue })) }
                        getOptionLabel={(option) => option}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Font Size"
                            />
                        )}
                    />
                </div>
                <h2>CATEGORY SETTINGS</h2>
                {categoryOptions.map((value, index) => (
                    <div className={"container row"} key={"cat"+index}>
                        <div className={"pref-cat-container"}>
                            <div className={"pref-cat-color-block"} style={{backgroundColor: userPrefs.categories[value]+80 || "#ffffff80"}} />
                            <span>{value}</span>
                            <TextField
                                label="Color Picker"
                                variant="outlined"
                                sx={{ width: "6rem" }}
                                type={'color'}
                                value={userPrefs.categories[value] || "#ffffff"}
                                onChange={(e) => {
                                    const newColor = e.target.value;
                                    debouncedColorChange(value, newColor); // Use debounced color change
                                }}
                            />
                            <TextField
                                label="Color"
                                variant="outlined"
                                sx={{ width: "10rem" }}
                                value={userPrefs.categories[value] || "#ffffff"}
                            />
                        </div>
                    </div>
                ))}
                {
                    /*

                    FUTURE IMPLEMENTATIONS
                    >>> Check:
                        - size recipes on homepage based on font-size
                        - predetermined small, normal, larger
                    >>> Favorites:
                        - view favorites
                        - filter for favorites
                        - delete favorites
                    >>> Group Recipes:
                        - /create-group
                        - add to group | push to user.groups = [id,id,id]
                        - ??? (be careful of private recipes I guess)
                     */
                }
            </div>
        </div>
    );
}
