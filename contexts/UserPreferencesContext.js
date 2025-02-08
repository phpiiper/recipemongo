import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
    return useContext(UserPreferencesContext);
};

export const UserPreferencesProvider = ({ children }) => {
    const [fontFamily, setFontFamily] = useState('Calibri'); // Default font family
    const [fontSize, setFontSize] = useState('22px'); // Default font size
    const [iconBtnVisibility, setIconBtnVisibility] = useState(true);
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
                } else {
                    console.warn('Failed to fetch preferences, using defaults');
                }
            } catch (error) {
                console.error('Error fetching preferences:', error);
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
        }
    }, [fontFamily, fontSize, iconBtnVisibility, loading]);

    return (
        <UserPreferencesContext.Provider value={{ fontFamily, setFontFamily, fontSize, setFontSize, iconBtnVisibility, setIconBtnVisibility }}>
            {loading ? <div>Loading preferences...</div> : children}
        </UserPreferencesContext.Provider>
    );
};
