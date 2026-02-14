import { useEffect } from "react";

/**
 * This page is loaded inside the Google OAuth popup after successful authentication.
 * It closes the popup window automatically. The parent window detects the close
 * and refetches the user session.
 */
export default function AuthSuccess() {
    useEffect(() => {
        // Close this popup — the parent page will detect it and refetch /api/user
        window.close();
    }, []);

    // Fallback UI if window.close() is blocked (e.g. not opened via window.open)
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-4">
                <div className="text-4xl">✅</div>
                <h1 className="text-xl font-semibold text-foreground">
                    Login successful!
                </h1>
                <p className="text-muted-foreground">
                    This window should close automatically.
                    <br />
                    If not,{" "}
                    <button
                        onClick={() => window.close()}
                        className="text-purple-500 underline hover:text-purple-400"
                    >
                        click here to close
                    </button>{" "}
                    or navigate back to the app.
                </p>
            </div>
        </div>
    );
}
