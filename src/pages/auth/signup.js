import { useState } from 'react';
import Router from 'next/router';

function SignUpForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    async function handleSubmit(event) {
        event.preventDefault();

        // Send a POST request to the API to create a new user
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            // Redirect to the sign-in page if the user was successfully created
            Router.push('/auth/signin');
        } else {
            const { message } = await response.json();
            setError(message);
        }
    }

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Sign up for an account</h2>
                {error && <div className="auth-error">{error}</div>}
                <div className="auth-input-group">
                    <label htmlFor="username" className="auth-input-label">
                        Username:
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        className="auth-input-field"
                    />
                </div>
                <div className="auth-input-group">
                    <label htmlFor="password" className="auth-input-label">
                        Password:
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="auth-input-field"
                    />
                </div>
                <button type="submit" className="auth-button">
                    Create account
                </button>
            </form>
        </div>
    );
}

export default SignUpForm;