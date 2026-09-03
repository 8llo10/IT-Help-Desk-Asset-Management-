import { NavLink } from "react-router-dom";

export default function Sidebar() {
    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    return (
        <aside>
            <h2>IT Help Desk</h2>

            <nav>
                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>

                <NavLink to="/tickets">
                    Tickets
                </NavLink>

                {(user.role === "ADMIN" ||
                    user.role === "TECHNICIAN") && (
                        <NavLink to="/assets">
                            Assets
                        </NavLink>
                    )}

                {user.role === "ADMIN" && (
                    <>
                        <NavLink to="/users">
                            Users
                        </NavLink>

                        <NavLink to="/departments">
                            Departments
                        </NavLink>

                        <NavLink to="/categories">
                            Categories
                        </NavLink>
                    </>
                )}
            </nav>
        </aside>
    );
}
