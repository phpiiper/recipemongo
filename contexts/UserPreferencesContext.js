import React, { createContext, useContext, useState, useEffect } from 'react';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
    return useContext(UserPreferencesContext);
};

export const UserPreferencesProvider = ({ children }) => {
    const [fontFamily, setFontFamily] = useState('Calibri'); // Default font family
    const [fontSize, setFontSize] = useState('18px'); // Default font size
    const [loading, setLoading] = useState(true); // To track loading state

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await fetch('/api/user-apis/preferences');
                if (response.ok) {
                    const data = await response.json();
                    // Update the state if preferences are available
                    if (data && data.fontFamily) {
                        setFontFamily(data.fontFamily); // Update font family from the API
                    }
                    if (data && data.fontSize) {
                        setFontSize(data.fontSize); // Update font size from the API
                    }
                } else {
                    console.warn('Failed to fetch preferences, using defaults');
                }
            } catch (error) {
                console.error('Error fetching preferences:', error);
                // If fetch fails, keep the default values
            } finally {
                setLoading(false); // Stop loading when the fetch is done
            }
        };

        fetchPreferences();
    }, []); // Run once when the component mounts

    // Apply the styles to the body once the preferences are loaded
    useEffect(() => {
        if (!loading) {
            let root = document.querySelector(':root');
            root.style.setProperty('--fs-root', fontSize);
            root.style.setProperty('--ff-header', fontFamily);
            root.style.setProperty('--ff-text', fontFamily);
        }
    }, [fontFamily, fontSize, loading]);

    return (
        <UserPreferencesContext.Provider value={{ fontFamily, setFontFamily, fontSize, setFontSize }}>
            {loading ? <div>Loading preferences...</div> : children}
        </UserPreferencesContext.Provider>
    );
};
