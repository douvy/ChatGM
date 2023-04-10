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
        <div className="auth-container mx-auto w-[400px] flex-1 mt-5 md:mt-2">
            <form onSubmit={handleSubmit} className="auth-form ">
            <h1 className="heading font-display text-title font-medium  uppercase mt-50 mb-30">Sign up for an account</h1>
                {error && <div className="auth-error">{error}</div>}
                <div className="auth-input-group mb-5">
                    <label htmlFor="username" className="auth-input-label block font-bold mb-2 font-semibold text-white">
                        Username:
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        className="auth-input-field w-full"
                    />
                </div>
                <div className="auth-input-group">
                    <label htmlFor="password" className="auth-input-label block font-bold mb-2 font-semibold text-white">
                        Password:
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="auth-input-field w-full border-2"
                    />
                </div>
                <button type="submit" className="auth-button font-semibold w-full mt-5 mb-8 h-11">
                    Create account
                </button>
            </form>
        </div>
    );
}

export default SignUpForm;