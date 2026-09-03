export default function ProfilePage() {
    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    return (
        <div>
            <h1>Profile</h1>

            <p>View your account information.</p>

            <div>
                <p>
                    <strong>Name:</strong>{" "}
                    {user.fullName || "-"}
                </p>

                <p>
                    <strong>Email:</strong>{" "}
                    {user.email || "-"}
                </p>

                <p>
                    <strong>Role:</strong>{" "}
                    {user.role || "-"}
                </p>

                <p>
                    <strong>Status:</strong>{" "}
                    {user.isActive === false
                        ? "Inactive"
                        : "Active"}
                </p>
            </div>
        </div>
    );
}