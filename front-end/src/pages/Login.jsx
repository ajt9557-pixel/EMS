import React from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authcontext.jsx'
import { API_URL } from '../utils/api'
import {useTheme} from '../context/ThemeContext.jsx'

const Login = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [remember, setRemember] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const [response] = await Promise.all([
        axios.post(`${API_URL}/api/auth/login`, {
          email,
          password,
        }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ])

      if (response.data.success) {
        login(response.data.user)

        if (remember) {
          localStorage.setItem('token', response.data.tokken)
        } else {
          sessionStorage.setItem('token', response.data.tokken)
        }
        if (response.data.user.role === 'admin') {
          navigate('/admin-dashboard')
        } else {
          navigate('/employee-dashboard')
        }
      }
    } catch (err) {
      if (err.response && !err.response.data.success) {
        setError(err.response.data.error)
      } else {
        setError('Something went wrong. Try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div  className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 dark:bg-gray-950"
       style={{ background: theme === 'dark' ? '#030712' : 'linear-gradient(160deg, #EBF4FF 0%, #DBEAFE 30%, #EFF6FF 60%, #F0F9FF 100%)' }}>

      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg ring-1 ring-white/60 dark:ring-gray-700/60 text-gray-600 dark:text-black hover:bg-white dark:hover:bg-gray-700 transition-colors"
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        )}
      </button>


      {loading && (
        <div  className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
          <div  className="w-24 h-24 rounded-3xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-blue-50 dark:ring-gray-700 flex items-center justify-center animate-bounce">
            <img src="/pics/aics.jpg" alt="Company Logo" className="w-16 h-16 object-contain rounded-xl" />
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-blue-400">Signing in...</span>
          </div>
        </div>
      )}


      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 dark:opacity-0"
        style={{ background: 'radial-gradient(circle, #93C5FD 0%, transparent 70%)' }} />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-20 dark:opacity-0"
        style={{ background: 'radial-gradient(circle, #BFDBFE 0%, transparent 70%)' }} />
      <div className="absolute top-1/3 left-10 w-20 h-20 rounded-full opacity-20 dark:opacity-0"
        style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-16 w-14 h-14 rounded-full opacity-15 dark:opacity-0"
        style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }} />


      <div className="relative z-10 flex flex-col items-center space-y-6 w-full max-w-sm">


        <div  className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900 flex items-center justify-center ring-1 ring-blue-50 dark:ring-gray-700">
          <img src="/pics/aics.jpg" alt="Company Logo" className="w-14 h-14 object-contain rounded-lg" />
        </div>


        <div className="text-center space-y-1">
           <h1 className="text-2xl font-bold tracking-tight dark:text-white" style={{ color: '#1E3A5F' }}>
            AICS
          </h1>
          <p className="text-sm font-medium text-blue-400 tracking-wide">
            Employee Management System
          </p>
        </div>


        <div  className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6 ring-1 ring-white/60 dark:ring-gray-700/60">

          <div className="text-center space-y-1">
            <h2 className="text-xl font-semibold dark:text-white" style={{ color: '#1E3A5F' }}>
              Welcome back
            </h2>
            <p className="text-xs text-blue-300 dark:text-black">Sign in to continue to your account</p>
          </div>
    

          {error && (
            <div className="flex items-start gap-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}


          <form className="space-y-5" onSubmit={handleSubmit}>

 
            <div className="space-y-1.5">
              <label htmlFor="email"  className="block text-sm font-medium text-gray-600 dark:text-black">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-blue-300 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                   className="w-full border border-blue-100 bg-blue-50/40 dark:border-gray-600 dark:bg-gray-700/50 dark:text-black dark:placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:border-blue-300 transition-all"
                  required
                />
              </div>
            </div>


            <div className="space-y-1.5">
              <label htmlFor="password"  className="block text-sm font-medium text-gray-600 dark:text-black" >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-blue-300 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-blue-100 bg-blue-50/40 dark:border-gray-600 dark:bg-gray-700/50 dark:text-black dark:placeholder-gray-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:border-blue-300 transition-all"
                  required
                />
              </div>
            </div>


            <div className="flex items-center justify-between">
              <label htmlFor="remember" className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4.5 h-4.5 w-[18px] h-[18px] rounded-md border-2 border-blue-200 dark:border-gray-600 bg-white dark:bg-gray-700 peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
                <span  className="text-sm text-gray-500 dark:text-black group-hover:text-gray-700 dark:group-hover:text-gray-700 transition-colors">
                  Remember me
                </span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm font-medium text-blue-400 hover:text-blue-600 transition-colors"
              >
                Forgot password?
              </a>
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>


          <div className="relative">
            <div className="absolute inset-0 flex items-center">
               <div className="w-full border-t border-blue-100 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
               <span className="bg-white/80 dark:bg-gray-800/80 px-3 text-blue-300 dark:text-black">POGI NA GAWA NI ALEXIS</span>
            </div>
          </div>
        </div>


        <p  className="text-xs text-blue-300 dark:text-black text-center">
          AICS Employee Management System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

export default Login