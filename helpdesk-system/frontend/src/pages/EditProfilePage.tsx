import { useState } from "react";

export default function SettingsPage() {
    const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const [fullName, setFullName] = useState(
        storedUser.fullName || ""
    );

    const [email] = useState(
        storedUser.email || ""
    );

    const [message, setMessage] = useState("");

    const handleSave = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        const updatedUser = {
            ...storedUser,
            fullName: fullName.trim(),
        };

        localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
        );

        setMessage("Settings saved successfully");
    };

    return (
        <div>
            <div>
                <h1>Settings</h1>

                <p>
                    Manage your account preferences.
                </p>
            </div>

            <form onSubmit={handleSave}>
                <div>
                    <label>Full Name</label>

                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) =>
                            setFullName(e.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        disabled
                    />
                </div>

                <div>
                    <label>Role</label>

                    <input
                        type="text"
                        value={storedUser.role || "-"}
                        disabled
                    />
                </div>

                {message && (
                    <p>{message}</p>
                )}

                <button type="submit">
                    Save Changes
                </button>
            </form>
        </div>
    );
}