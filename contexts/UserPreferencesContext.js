import React, { createContext, useContext, useState, useEffect } from 'react';
import {createTheme, ThemeProvider} from "@mui/material/styles";

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
    const DarkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#d2d2d2',
            },
            text: {
                primary: '#fff',
            },
            background: {
                paper: '#121212',
                default: '#121212'
            },
        },
    });
    const LightTheme = createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#121212',
            },
            text: {
                primary: '#121212',
            },
            background: {
                paper: '#fff',
                default: '#fff'
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
