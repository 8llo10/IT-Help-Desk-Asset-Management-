import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div>
            <h1>404</h1>

            <h2>Page Not Found</h2>

            <p>
                The page you are looking for does not exist.
            </p>

            <Link to="/dashboard">
                Back to Dashboard
            </Link>
        </div>
    );
}