import { useState } from 'react';
import axios from 'axios';
import Router from 'next/router';
import { useSession, signIn } from 'next-auth/react'


function SignInForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { status } = useSession();
    console.log(status);

    if (status === 'authenticated') {
        Router.push('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await signIn('credentials', {
            username,
            password,
            callbackUrl: '/',
        })
        // if (!result.error) {
        //     router.push('/')
        // } else {
        //     setError(result.error)
        // }
    }

    function handleSignUp() {
        Router.push('/signup');
    }

    function handleForgotPassword() {
        Router.push('/forgotpassword');
    }

    return (
        <div className="container">
            <div className="formContainer">
                <form onSubmit={handleSubmit} className="form">
                    <h2 className="heading">Sign In</h2>
                    <div className="formGroup">
                        <label htmlFor="username" className="label">Username:</label>
                        <input type="text" id="username" value={username} onChange={(event) => setUsername(event.target.value)} className="input" />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="password" className="label">Password:</label>
                        <input type="password" id="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input" />
                    </div>
                    <button type="submit" className="submitButton">Sign In</button>
                    <div className="linksContainer">
                        <a href="#" onClick={handleSignUp} className="link">Sign Up</a>
                        <span className="separator">|</span>
                        <a href="#" onClick={handleForgotPassword} className="link">Forgot Password</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignInForm;