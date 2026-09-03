import { useState } from "react";
import api from "../api/client";
import catImage from "../assets/cat-logo.png";

type AuthMode = "login" | "register";

export default function LoginPage() {
    const [mode, setMode] = useState<AuthMode>("login");

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        const response = await api.post("/auth/login", {
            email: email.trim().toLowerCase(),
            password,
        });

        const token = response.data.data.token;
        const user = response.data.data.user;

        localStorage.setItem("token", token);

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        /*
          مهم:
          نستخدم window.location هنا حتى App.tsx
          يعيد القراءة من localStorage
          ويلتقط الـ token الجديد مباشرة.
        */
        window.location.href = "/dashboard";
    };

    const handleRegister = async () => {
        await api.post("/auth/register", {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
        });

        setSuccess(
            "Account created successfully. You can sign in now."
        );

        setMode("login");

        setFullName("");
        setPassword("");
        setError("");
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            if (mode === "login") {
                await handleLogin();
            } else {
                await handleRegister();
            }
        } catch (error: any) {
            console.error(
                "Authentication error:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (
        newMode: AuthMode
    ) => {
        setMode(newMode);

        setError("");
        setSuccess("");
        setPassword("");
    };

    return (
        <div className="auth-page">
            <div className="auth-shell">
                {/* LEFT SIDE */}

                <section className="auth-visual">
                    <div className="auth-visual-copy">
                        <p className="auth-kicker">
                            WASL IT MANAGEMENT
                        </p>

                        <h1>
                            Support that actually
                            <span> connects.</span>
                        </h1>

                        <p>
                            Tickets, assets, users and IT
                            operations in one clean
                            workspace.
                        </p>
                    </div>

                    <img
                        src={catImage}
                        alt="WASL mascot"
                        className="auth-mascot"
                    />
                </section>

                {/* RIGHT SIDE */}

                <section className="auth-card">
                    <div className="auth-card-brand">
                        <div className="auth-brand-mark">
                            W
                        </div>

                        <div className="auth-brand-copy">
                            <strong>WASL</strong>

                            <span>
                                IT Help Desk & Asset Management
                            </span>
                        </div>
                    </div>

                    {/* LOGIN / REGISTER TABS */}

                    <div className="auth-tabs">
                        <button
                            type="button"
                            className={
                                mode === "login"
                                    ? "auth-tab active"
                                    : "auth-tab"
                            }
                            onClick={() =>
                                switchMode("login")
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
                            onClick={() =>
                                switchMode("register")
                            }
                        >
                            New User
                        </button>
                    </div>

                    {/* HEADER */}

                    <div className="auth-heading">
                        <p>
                            {mode === "login"
                                ? "WELCOME BACK"
                                : "GET STARTED"}
                        </p>

                        <h2>
                            {mode === "login"
                                ? "Sign in to your account"
                                : "Create your account"}
                        </h2>

                        <span>
                            {mode === "login"
                                ? "Access your IT workspace securely."
                                : "Join the WASL support workspace."}
                        </span>
                    </div>

                    {/* FORM */}

                    <form
                        className="auth-form"
                        onSubmit={handleSubmit}
                    >
                        {mode === "register" && (
                            <div className="auth-field">
                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Your full name"
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                            </div>
                        )}

                        <div className="auth-field">
                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        {/* ERROR */}

                        {error && (
                            <p className="auth-error">
                                {error}
                            </p>
                        )}

                        {/* SUCCESS */}

                        {success && (
                            <p className="auth-success">
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? mode === "login"
                                    ? "Signing in..."
                                    : "Creating account..."
                                : mode === "login"
                                    ? "Sign In"
                                    : "Create Account"}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Secure IT operations powered by
                        WASL
                    </p>
                </section>
            </div>
        </div>
    );
}