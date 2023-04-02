import { useState } from 'react';
import axios from 'axios';
import Router from 'next/router';
import { useSession, signIn } from 'next-auth/react'
import styles from './signin.module.css';

function SignInForm() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    // const { status } = useSession();
    // console.log(status);

    // if (status === 'authenticated') {
    //     Router.push('/');
    //     return null;
    // }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await signIn('credentials', {
            username,
            password,
            redirect: false,
            // callbackUrl: '/',
        })
        if (!result.error) {
            Router.push('/')
        } else {
            setError(result.error)
        }
    }

    // async function handleSubmit(event) {
    //     event.preventDefault();

    //     const response = await fetch('/api/auth/signin', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ username, password }),
    //     });
    //     if (response.ok) {
    //         const data = await response.json();
    //         console.log(data);
    //         localStorage.setItem('session', JSON.stringify(data.session));
    //         // Router.push('/');
    //     } else {
    //         const { message } = await response.json();
    //         setError(message);
    //     }
    // }

    function handleSignUp() {
        Router.push('/auth/signup');
    }

    function handleForgotPassword() {
        Router.push('/forgotpassword');
    }

    return (
        <div className="container form-container">
            <div className="mx-auto w-[400px] flex-1 mt-6 md:mt-2">
                <form onSubmit={(handleSubmit)} className="form">
                    <h1 className="heading font-display text-title font-medium  uppercase mt-50 mb-30">Sign In</h1>
                    <div className="formGroup mb-5">
                        <label htmlFor="username" className="label block font-bold mb-2 text-xs font-semibold uppercase italic text-white">Username:</label>
                        <input type="text" id="username" value={username} onChange={(event) => setUsername(event.target.value)} className="input w-full" />
                    </div>
                    <div className="formGroup">
                        <label htmlFor="password" className="label block font-bold mb-2 text-xs font-semibold uppercase italic text-white">Password:</label>
                        <input type="password" id="password" value={password} onChange={(event) => setPassword(event.target.value)} className="input w-full" />
                    </div>
                    <button type="submit" className="submitButton font-semibold w-full mt-5 mb-8 h-11">Sign In</button>
                    <div className="linksContainer italic">
                        <a href="#" onClick={handleSignUp} className="link mr-2">Sign Up</a>
                        <span className="separator mr-2">|</span>
                        <a href="#" onClick={handleForgotPassword} className="link ">Forgot Password</a>
                    </div>
                </form>
            </div>
        </div>

    );
}

export default SignInForm;