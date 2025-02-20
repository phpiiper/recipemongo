import React, { createContext, useContext, useState, useEffect } from 'react';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import fontColorContrast from 'font-color-contrast';
const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
    return useContext(UserPreferencesContext);
};

export const UserPreferencesProvider = ({ children }) => {
    const [fontFamily, setFontFamily] = useState('Calibri')
    const [fontSize, setFontSize] = useState('22px');
    const [iconBtnVisibility, setIconBtnVisibility] = useState(true);
    const [shortenMeasurements, setShortenMeasurements] = useState(false);
    const [compactSize, setCompactSize] = useState('Standard');
    const [theme, setTheme] = useState('Light');
    const [highlight, setHighlight] = useState('#3669ef');
    const DarkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: highlight, // highlight
            },
            text: {
                primary: '#fff', // col-t-1
                secondary: '#afafaf', // col-t-2
            },
            secondary : {
                main: '#dc1d1d',  // col-s-1
            },
            background: {
                paper: '#121212', // col-b
                default: '#121212' // col-b
            },
            action: {
                active: '#121212', // col-a-a
                selected: highlight, // highlight
                selectedOpacity: 0.01
            },
            typography: {
                fontFamily: fontFamily,
                fontSize: fontFamily
            },
        },
    });
    const LightTheme = createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: highlight, // highlight color
            },
            secondary : {
                main: '#dc1d1d',  // if necessary
            },
            text: {
                primary: '#121212',
                secondary: '#afafaf',  // labels in inputs
            },
            background: {
                paper: '#fff',
                default: '#fff'
            },
            action: {
                active: '#121212', // input ui buttons
                selected: highlight,
                selectedOpacity: 0.01
            },
            typography: {
                fontFamily: fontFamily,
                fontSize: fontFamily
            },
        },
    });
    const BlankTheme = createTheme({})
    const [themeActual, setThemeActual] = useState(BlankTheme);


    const [loading, setLoading] = useState(true); // To track loading state

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await fetch('/api/user-apis/preferences');
                if (response.ok) {
                    const data = await response.json();
                    // Safely update the state if preferences are available
                    if (data?.fontFamily) setFontFamily(data.fontFamily);
                    if (data?.fontSize) setFontSize(data.fontSize);
                    if ('iconTextHelp' in data) setIconBtnVisibility(data.iconTextHelp);
                    if ('shortenMeasurements' in data) setShortenMeasurements(data.shortenMeasurements);
                    if (data?.compactSize) setCompactSize(data.compactSize);
                    if (data?.theme) setTheme(data.theme + "Theme");
                    if (data?.highlight) setHighlight(data.highlight);
                } else {
                    console.warn('Failed to fetch preferences, using defaults');
                }
            } catch (error) {
                // console.error('Error fetching preferences:', error);
                // Default values are retained if fetching fails
            } finally {
                setLoading(false); // Stop loading when the fetch is done
            }
        };

        fetchPreferences();
    }, []); // Run once when the component mounts

    // Apply the styles to the body once the preferences are loaded
    useEffect(() => {
        if (!loading) {
            const root = document.querySelector(':root');
            root.style.setProperty('--fs-root', fontSize);
            root.style.setProperty('--ff-header', fontFamily);
            root.style.setProperty('--ff-text', fontFamily);
            root.style.setProperty('--icon-btn-visibility', iconBtnVisibility ? 'true' : 'false');
            root.style.setProperty('--shorten-measurements', shortenMeasurements ? 'true' : 'false');
            root.style.setProperty('--compactSize', compactSize);
            root.style.setProperty('--fc-highlight', `${highlight}`);
            root.style.setProperty('--fc-highlight-text', `${fontColorContrast(highlight)}`);
            root.style.setProperty('--fc-highlight-recipe', `${highlight}`);
            root.style.setProperty('--fc-highlight-recipe-text', `${fontColorContrast(highlight)}`);
            root.classList.add(theme);
            if (theme.includes("Dark")){setThemeActual(DarkTheme);}
            else if (theme.includes("Light")){setThemeActual(LightTheme);}
            else {setThemeActual(BlankTheme) }
        }
    }, [fontFamily, fontSize, iconBtnVisibility, shortenMeasurements, compactSize, theme, loading]);

    return (
        <UserPreferencesContext.Provider value={{ fontFamily, setFontFamily, fontSize, setFontSize, iconBtnVisibility, setIconBtnVisibility, shortenMeasurements, setShortenMeasurements, compactSize, setCompactSize }}>
            <ThemeProvider theme={themeActual}>
            {loading ? <div></div> : children}
            </ThemeProvider>
        </UserPreferencesContext.Provider>
    );
};
