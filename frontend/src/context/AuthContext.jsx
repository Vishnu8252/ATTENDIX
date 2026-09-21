import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    // =====================================================
    // CHECK CURRENT SESSION
    // =====================================================

    const checkAuth = async () => {

        try {

            const response = await api.get("/me");

            if (response.data.success) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }

        } catch {

            setUser(null);

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // INITIAL AUTH CHECK
    // =====================================================

    useEffect(() => {

        let mounted = true;

        const verifySession = async () => {

            try {

                const response = await api.get("/me");

                if (!mounted) {
                    return;
                }

                if (response.data.success) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }

            } catch{

                if (mounted) {
                    setUser(null);
                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }
        };

        verifySession();

        return () => {
            mounted = false;
        };

    }, []);


    // =====================================================
    // LOGIN
    // =====================================================

    const login = async (email, password) => {

        const response = await api.post("/login", {
            email: email.trim().toLowerCase(),
            password
        });

        if (response.data.success) {
            setUser(response.data.user);
        }

        return response.data;
    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = async () => {

        try {

            await api.get("/logout");

        } finally {

            setUser(null);

        }
    };


    // =====================================================
    // CONTEXT VALUE
    // =====================================================

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuth
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


// =========================================================
// CUSTOM AUTH HOOK
// =========================================================

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );

    }

    return context;
};