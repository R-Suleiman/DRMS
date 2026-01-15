import { createContext, useContext, useEffect, useRef, useState } from "react";
import axiosClient from "../assets/js/axios-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, _setUser] = useState(JSON.parse(localStorage.getItem("USER")));
    const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
    const [loading, setLoading] = useState(false);
    const tokenExpiryTimeout = useRef(null);
    const expiryTimeInSeconds = 600; //  10 minutes
    const isAuthenticated = !!token && user;

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("ACCESS_TOKEN", token);
        } else {
            localStorage.removeItem("ACCESS_TOKEN");
        }
    };

    const setUser = (User) => {
        _setUser(User);
        if (User) {
            localStorage.setItem("USER", JSON.stringify(User));
        } else {
            localStorage.removeItem("USER");
        }
    };

    // const getUser = () => {
    //     setLoading(true);
    //     axiosClient.get("/get-user").then(({ data }) => {
    //         setUser(data.user);
    //         setLoading(false);
    //     });
    // };

    // useEffect(() => {
    //     if (token) {
    //         getUser();
    //     }
    // }, []);

    // Global logout sync (Log out user in all tabs)
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "ACCESS_TOKEN" && !event.newValue) {
                window.location.href = "/";
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    // Log out user after 1 hr of inactivity
    const resetTokenTimer = () => {
        if (tokenExpiryTimeout.current) {
            clearTimeout(tokenExpiryTimeout.current);
        }

        tokenExpiryTimeout.current = setTimeout(() => {
            setUser({});
            setToken(null);
            window.location.href = "/";
        }, expiryTimeInSeconds * 1000);
    };

    useEffect(() => {
        const activityEvents = ["click", "mousemove", "keydown", "scroll"];

        if (token) {
            resetTokenTimer(); // Start timer on mount

            const handleUserActivity = () => resetTokenTimer();

            activityEvents.forEach((event) =>
                window.addEventListener(event, handleUserActivity)
            );

            return () => {
                activityEvents.forEach((event) =>
                    window.removeEventListener(event, handleUserActivity)
                );
                clearTimeout(tokenExpiryTimeout.current);
            };
        }
    }, [token]);

    const logout = () => {
        axiosClient.post("/logout").then(() => {
            setUser({});
            setToken(null);
            window.location.href = "/";
            showSuccessAlert("Successfully Logged out!");
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                setUser,
                setToken,
                setLoading,
                isAuthenticated,
                // getUser,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
