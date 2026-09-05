import {
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import api from "../api/client";
import useAuth from "../hooks/useAuth";

import catImage from "../assets/cat-logo.png";

type AuthMode =
    | "login"
    | "register";

interface LoginResponseUser {
    id: number;
    fullName: string;
    email: string;
    role:
    | "ADMIN"
    | "TECHNICIAN"
    | "EMPLOYEE";
    isActive: boolean;
}

interface RedirectState {
    from?: string;
}

export default function LoginPage() {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        login,
    } =
        useAuth();

    const [
        mode,
        setMode,
    ] =
        useState<AuthMode>(
            "login"
        );

    const [
        fullName,
        setFullName,
    ] =
        useState("");

    const [
        email,
        setEmail,
    ] =
        useState("");

    const [
        password,
        setPassword,
    ] =
        useState("");

    const [
        error,
        setError,
    ] =
        useState("");

    const [
        success,
        setSuccess,
    ] =
        useState("");

    const [
        loading,
        setLoading,
    ] =
        useState(false);

    /* =========================================================
       LOGIN
       ========================================================= */

    const handleLogin =
        async () => {
            const response =
                await api.post(
                    "/auth/login",
                    {
                        email:
                            email
                                .trim()
                                .toLowerCase(),

                        password,
                    }
                );

            const token =
                response.data?.data
                    ?.token ??
                response.data?.token;

            const user:
                | LoginResponseUser
                | undefined =
                response.data?.data
                    ?.user ??
                response.data?.user;

            if (
                !token ||
                !user
            ) {
                throw new Error(
                    "Invalid login response"
                );
            }

            /*
             * AuthContext now handles:
             * - localStorage
             * - token state
             * - user state
             */
            login(
                token,
                user
            );

            const state =
                location.state as
                | RedirectState
                | null;

            const destination =
                state?.from ??
                "/dashboard";

            navigate(
                destination,
                {
                    replace: true,
                }
            );
        };

    /* =========================================================
       REGISTER
       ========================================================= */

    const handleRegister =
        async () => {
            const normalizedName =
                fullName.trim();

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            if (
                !normalizedName
            ) {
                throw new Error(
                    "Full name is required."
                );
            }

            await api.post(
                "/auth/register",
                {
                    fullName:
                        normalizedName,

                    email:
                        normalizedEmail,

                    password,
                }
            );

            setSuccess(
                "Account created successfully. You can sign in now."
            );

            setMode(
                "login"
            );

            setFullName(
                ""
            );

            setPassword(
                ""
            );

            setError(
                ""
            );
        };

    /* =========================================================
       SUBMIT
       ========================================================= */

    const handleSubmit =
        async (
            event: React.FormEvent
        ) => {
            event.preventDefault();

            setError(
                ""
            );

            setSuccess(
                ""
            );

            if (
                !email.trim()
            ) {
                setError(
                    "Email is required."
                );

                return;
            }

            if (
                !password
            ) {
                setError(
                    "Password is required."
                );

                return;
            }

            try {
                setLoading(
                    true
                );

                if (
                    mode === "login"
                ) {
                    await handleLogin();
                } else {
                    await handleRegister();
                }
            } catch (error: any) {
                console.error(
                    "Authentication error:",
                    error.response?.data ??
                    error
                );

                setError(
                    error.response?.data
                        ?.message ??
                    error.message ??
                    "Something went wrong"
                );
            } finally {
                setLoading(
                    false
                );
            }
        };

    /* =========================================================
       SWITCH MODE
       ========================================================= */

    const switchMode = (
        newMode: AuthMode
    ) => {
        if (loading) {
            return;
        }

        setMode(
            newMode
        );

        setError(
            ""
        );

        setSuccess(
            ""
        );

        setPassword(
            ""
        );
    };

    /* =========================================================
       UI
       ========================================================= */

    return (
        <div className="auth-page">

            <div className="auth-shell">

                {/* ===================================================
            LEFT SIDE
            =================================================== */}

                <section className="auth-visual">

                    <div className="auth-visual-copy">

                        <p className="auth-kicker">
                            WASL IT MANAGEMENT
                        </p>

                        <h1>
                            Support that actually
                            <span>
                                {" "}
                                connects.
                            </span>
                        </h1>

                        <p>
                            Tickets, assets, users
                            and IT operations in one
                            clean workspace.
                        </p>

                    </div>

                    <img
                        src={catImage}
                        alt="WASL mascot"
                        className="auth-mascot"
                    />

                </section>

                {/* ===================================================
            RIGHT SIDE
            =================================================== */}

                <section className="auth-card">

                    {/* BRAND */}

                    <div className="auth-card-brand">

                        <div className="auth-brand-mark">
                            W
                        </div>

                        <div className="auth-brand-copy">

                            <strong>
                                WASL
                            </strong>

                            <span>
                                IT Help Desk & Asset
                                Management
                            </span>

                        </div>

                    </div>

                    {/* =================================================
              LOGIN / REGISTER TABS
              ================================================= */}

                    <div className="auth-tabs">

                        <button
                            type="button"
                            className={
                                mode === "login"
                                    ? "auth-tab active"
                                    : "auth-tab"
                            }
                            disabled={loading}
                            onClick={() =>
                                switchMode(
                                    "login"
                                )
                            }
                        >
                            Sign In
                        </button>

                        <button
                            type="button"
                            className={
                                mode === "register"
                                    ? "auth-tab active"
                                    : "auth-tab"
                            }
                            disabled={loading}
                            onClick={() =>
                                switchMode(
                                    "register"
                                )
                            }
                        >
                            New User
                        </button>

                    </div>

                    {/* =================================================
              HEADER
              ================================================= */}

                    <div className="auth-heading">

                        <p>
                            {mode ===
                                "login"
                                ? "WELCOME BACK"
                                : "GET STARTED"}
                        </p>

                        <h2>
                            {mode ===
                                "login"
                                ? "Sign in to your account"
                                : "Create your account"}
                        </h2>

                        <span>
                            {mode ===
                                "login"
                                ? "Access your IT workspace securely."
                                : "Join the WASL support workspace."}
                        </span>

                    </div>

                    {/* =================================================
              FORM
              ================================================= */}

                    <form
                        className="auth-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* FULL NAME */}

                        {mode ===
                            "register" && (
                                <div className="auth-field">

                                    <label
                                        htmlFor="fullName"
                                    >
                                        Full Name
                                    </label>

                                    <input
                                        id="fullName"
                                        type="text"
                                        placeholder="Your full name"
                                        value={
                                            fullName
                                        }
                                        autoComplete="name"
                                        disabled={
                                            loading
                                        }
                                        required
                                        onChange={(
                                            event
                                        ) =>
                                            setFullName(
                                                event.target
                                                    .value
                                            )
                                        }
                                    />

                                </div>
                            )}

                        {/* EMAIL */}

                        <div className="auth-field">

                            <label
                                htmlFor="email"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                value={
                                    email
                                }
                                autoComplete="email"
                                disabled={
                                    loading
                                }
                                required
                                onChange={(
                                    event
                                ) => {
                                    setEmail(
                                        event.target
                                            .value
                                    );

                                    setError(
                                        ""
                                    );
                                }}
                            />

                        </div>

                        {/* PASSWORD */}

                        <div className="auth-field">

                            <label
                                htmlFor="password"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={
                                    password
                                }
                                autoComplete={
                                    mode ===
                                        "login"
                                        ? "current-password"
                                        : "new-password"
                                }
                                disabled={
                                    loading
                                }
                                required
                                onChange={(
                                    event
                                ) => {
                                    setPassword(
                                        event.target
                                            .value
                                    );

                                    setError(
                                        ""
                                    );
                                }}
                            />

                        </div>

                        {/* ERROR */}

                        {error && (
                            <p
                                className="auth-error"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        {/* SUCCESS */}

                        {success && (
                            <p
                                className="auth-success"
                                role="status"
                            >
                                {success}
                            </p>
                        )}

                        {/* SUBMIT */}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={
                                loading
                            }
                        >
                            {loading
                                ? mode ===
                                    "login"
                                    ? "Signing in..."
                                    : "Creating account..."
                                : mode ===
                                    "login"
                                    ? "Sign In"
                                    : "Create Account"}
                        </button>

                    </form>

                    {/* FOOTER */}

                    <p className="auth-footer">
                        Secure IT operations
                        powered by WASL
                    </p>

                </section>

            </div>

        </div>
    );
}