import { useState } from 'react';
import Router from 'next/router';
import { useSession, signIn } from 'next-auth/react';

function SignInForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { status } = useSession();

  if (status === 'authenticated') {
    Router.push('/');
    return null;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    const result = await signIn('credentials', {
      username,
      password,
      redirect: false
    });
    if (!result.error) {
      Router.push('/');
    } else {
      setError(result.error);
    }
  };

  function handleSignUp() {
    Router.push('/auth/signup');
  }

  function handleForgotPassword() {
    Router.push('/forgotpassword');
  }

  function dismissError() {
    setError('');
  }

  // Custom error messages based on error type
  const getErrorMessage = (error) => {
    switch (error) {
      case 'Invalid credentials':
        return 'The username or password you entered is incorrect.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <div className='container form-container'>
      <div className='mx-auto w-[400px] flex-1 mt-6 md:mt-2'>
        <form onSubmit={handleSubmit} className='form'>
          <h1 className='heading font-display text-title font-medium  uppercase mt-50 mb-30'>
            Sign In
          </h1>
          {/* Display the error message */}
          {error && (
            <div className='flash-error text-white rounded p-4 mb-5 relative'>
              <button
                type='button'
                className='absolute top-2 right-3 text-xl font-semibold bg-transparent text-red'
                onClick={dismissError}
              >
                &times;
              </button>
              <i className='fa fa-exclamation-circle' aria-hidden='true'></i> {getErrorMessage(error)}
            </div>
          )}
          <div className='formGroup mb-5'>
            <label
              htmlFor='username'
              className='label block font-bold mb-2 font-semibold text-white'
            >
              Username:
            </label>
            <input
              type='text'
              id='username'
              value={username}
              onChange={event => setUsername(event.target.value)}
              className='input w-full border-1 bg-dark px-3 py-2'
            />
          </div>
          <div className='formGroup'>
            <label
              htmlFor='password'
              className='label block font-bold mb-2 text-white'
            >
              Password:
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={event => setPassword(event.target.value)}
              className='input w-full border-1 bg-dark px-3 py-2'
            />
          </div>
          <button
            type='submit'
            className='submitButton font-semibold w-full mt-5 mb-5 h-11'
          >
            Sign In
          </button>
          <div className='linksContainer text-gray'>
            <a href='#' onClick={handleSignUp} className='link mr-2 text-xs'>
              Sign Up
            </a>
            <span className='separator mr-2'>|</span>
            <a href='#' onClick={handleForgotPassword} className='link text-xs'>
              Forgot Password
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignInForm;
