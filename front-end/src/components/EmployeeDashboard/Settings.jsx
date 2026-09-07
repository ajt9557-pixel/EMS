import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../utils/api'
import { useAuth } from '../../context/authcontext'

const Settings = () => {
    const navigate = useNavigate()
    const { user } = useAuth() || {}
    const fileInputRef = useRef(null)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    
    const [settings, setSettings] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [profile, setProfile] = useState(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [picError, setPicError] = useState('')
    const [picSuccess, setPicSuccess] = useState('')
    const [imageFailed, setImageFailed] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')
            try {
                const response = await axios.get(`${API_URL}/api/employee/my-profile`, {
                    headers: { authorization: `Bearer ${token}` },
                })
                if (response.data.success) {
                    setProfile(response.data.employee)
                }
            } catch (err) {
                try {
                    const verifyRes = await axios.get(`${API_URL}/api/auth/verify`, {
                        headers: { authorization: `Bearer ${token}` },
                    })
                    if (verifyRes.data.success && verifyRes.data.user) {
                        const u = verifyRes.data.user
                        setProfile({
                            name: u.name,
                            email: u.email,
                            profilePicture: u.profilePicture,
                            role: u.role,
                        })
                    }
                } catch (verifyErr) {
                    console.log('Failed to load profile for picture:', err.response?.data?.error)
                }
            } finally {
                setProfileLoading(false)
            }
        }
        fetchProfile()
    }, [])

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, [previewUrl])

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        setPicError('')
        setPicSuccess('')
        if (!file) {
            setSelectedFile(null)
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
                setPreviewUrl(null)
            }
            return
        }
        if (!file.type.startsWith('image/')) {
            setPicError('Please select a valid image file (jpg, png, webp).')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setPicError('Image must be smaller than 5MB.')
            return
        }
        setSelectedFile(file)
        const url = URL.createObjectURL(file)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(url)
        setImageFailed(false)
    }

    const handleUploadPicture = async () => {
        if (!selectedFile) {
            setPicError('Please choose an image first.')
            return
        }
        setPicError('')
        setPicSuccess('')
        setUploading(true)
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token')
            const formData = new FormData()
            formData.append('image', selectedFile)

            let response
            try {
                response = await axios.put(
                    `${API_URL}/api/settings/profile-picture`,
                    formData,
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                )
            } catch (firstErr) {
                if (firstErr.response?.status === 404) {
                    response = await axios.put(
                        `${API_URL}/api/employee/my-profile/picture`,
                        formData,
                        {
                            headers: {
                                authorization: `Bearer ${token}`,
                            },
                        }
                    )
                } else {
                    throw firstErr
                }
            }
            if (response.data.success) {
                setPicSuccess('Profile picture updated successfully!')
                setProfile((prev) => prev ? { ...prev, profilePicture: response.data.profilePicture } : { name: user?.name, email: user?.email, profilePicture: response.data.profilePicture })
                setSelectedFile(null)
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl)
                    setPreviewUrl(null)
                }
                if (fileInputRef.current) fileInputRef.current.value = ''
                setImageFailed(false)
            }
        } catch (err) {
            setPicError(err.response?.data?.error || 'Failed to upload picture. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const handleCancelSelection = () => {
        setSelectedFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        setPicError('')
        setPicSuccess('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setSettings((prev) => ({ ...prev, [name]: value }))
        setError('')
        setSuccess('')
    }

  
    const passwordsMatch = settings.confirmPassword && settings.newPassword === settings.confirmPassword
    const passwordsMismatch = settings.confirmPassword && settings.newPassword !== settings.confirmPassword

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!settings.oldPassword.trim()) {
            setError('Please enter your current password')
            return
        }

        if (!settings.newPassword.trim()) {
            setError('Please enter a new password')
            return
        }

        if (settings.newPassword.length < 6) {
            setError('Your new password needs at least 6 characters')
            return
        }

        if (settings.newPassword !== settings.confirmPassword) {
            setError('The passwords you entered don\'t match')
            return
        }

        if (settings.oldPassword === settings.newPassword) {
            setError('Your new password must be different from the old one')
            return
        }

        setLoading(true)

        try {
            const response = await axios.put(
                `${API_URL}/api/employee/settings/change-password`,
                {
                    userId: user?._id,
                    oldPassword: settings.oldPassword,
                    newPassword: settings.newPassword
                },
                {
                    headers: {
                        authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
                    }
                }
            )

            if (response.data.success) {
                setSuccess('Your password has been updated successfully!')
                setSettings({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            }
        } catch (error) {
            const msg = error.response?.data?.error
            if (msg?.includes('incorrect') || msg?.includes('wrong') || msg?.includes('invalid')) {
                setError('The current password you entered is incorrect. Please try again.')
            } else {
                setError(msg || 'Something went wrong while updating your password. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const PasswordToggle = ({ show, onClick }) => (
        <button
            type="button"
            onClick={onClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            tabIndex={-1}
        >
            {show ? (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ) : (
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
            )}
        </button>
    )

    const inputClasses = (hasError, isValid) =>
        `w-full border bg-blue-50/40 dark:bg-gray-700/50 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-700 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
            hasError
                ? 'border-red-300 dark:border-red-700 focus:ring-red-200 focus:border-red-400'
                : isValid
                    ? 'border-emerald-300 dark:border-emerald-700 focus:ring-emerald-200 focus:border-emerald-400'
                    : 'border-blue-100 dark:border-gray-600 focus:ring-blue-200 focus:border-blue-300'
        }`

    const displayPicture = profile?.profilePicture
    const avatarSrc = previewUrl
        ? previewUrl
        : displayPicture
            ? displayPicture.startsWith('data:')
                ? displayPicture
                : `${API_URL}/uploads/${displayPicture}`
            : null

    const fallbackInitial = profile?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || '?'

    return (
        <div className="flex justify-center">
            <div className="w-full max-w-3xl space-y-6">
                
                {/* Profile Picture Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center">
                            Profile Picture
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-100 text-center">
                            Update your profile photo visible to your team
                        </p>
                    </div>

                    {picError && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            {picError}
                        </div>
                    )}

                    {picSuccess && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm text-center flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {picSuccess}
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-5">
                        <div className="relative">
                            {profileLoading ? (
                                <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse border-4 border-blue-100 dark:border-blue-800" />
                            ) : avatarSrc && !imageFailed ? (
                                <img
                                    src={avatarSrc}
                                    alt={profile?.name || user?.name || 'Profile'}
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl bg-white dark:bg-gray-800"
                                    onError={() => setImageFailed(true)}
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-blue-100 dark:bg-blue-900/30 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {fallbackInitial}
                                </div>
                            )}
                            <label
                                htmlFor="profile-picture-input"
                                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white dark:border-gray-800 flex items-center justify-center cursor-pointer shadow-md hover:from-blue-600 hover:to-blue-700 transition-colors"
                                title="Choose new photo"
                            >
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                </svg>
                            </label>
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {profile?.name || user?.name || 'Employee'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-100">
                                {profile?.email || user?.email || ''}
                            </p>
                            {displayPicture && !previewUrl && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Current photo</p>
                            )}
                            {previewUrl && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Preview — click Update to save</p>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            id="profile-picture-input"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div className="w-full max-w-sm space-y-3">
                            <label
                                htmlFor="profile-picture-input"
                                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 dark:border-gray-600 bg-blue-50/50 dark:bg-gray-700/30 hover:bg-blue-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-100 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                                {selectedFile ? 'Change selected image' : 'Choose new photo'}
                            </label>

                            {selectedFile && (
                                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2">
                                    <span className="text-xs text-gray-600 dark:text-gray-100 truncate pr-2">{selectedFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={handleCancelSelection}
                                        className="text-xs font-medium text-red-500 hover:text-red-600 shrink-0"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleUploadPicture}
                                disabled={!selectedFile || uploading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Update Picture
                                    </>
                                )}
                            </button>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">JPG, PNG or WEBP — max 5MB</p>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
                    
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-white dark:bg-gray-800 border-4 border-blue-100 dark:border-blue-800 shadow-xl flex items-center justify-center overflow-hidden p-1.5">
                                <img
                                    src="/pics/aiics.jpg"
                                    alt="Company Logo"
                                    className="w-full h-full object-contain rounded-full"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
                            Change Password
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-100 text-center">
                            Keep your account secure with a strong password
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm text-center flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {success}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4 text-center max-w-sm mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-100 mb-1.5">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showOld ? "text" : "password"}
                                        name="oldPassword"
                                        value={settings.oldPassword}
                                        onChange={handleChange}
                                        placeholder="Enter your current password"
                                        className={inputClasses(false, false)}
                                        required
                                    />
                                    <PasswordToggle show={showOld} onClick={() => setShowOld(!showOld)} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-100 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        name="newPassword"
                                        value={settings.newPassword}
                                        onChange={handleChange}
                                        placeholder="Create a new password"
                                        className={inputClasses(false, false)}
                                        required
                                        minLength={6}
                                    />
                                    <PasswordToggle show={showNew} onClick={() => setShowNew(!showNew)} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-100 mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={settings.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your new password"
                                        className={inputClasses(passwordsMismatch, passwordsMatch)}
                                        required
                                        minLength={6}
                                    />
                                    <PasswordToggle show={showConfirm} onClick={() => setShowConfirm(!showConfirm)} />
                                </div>
                                {passwordsMatch && (
                                    <p className="mt-1.5 text-xs text-emerald-500 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        Passwords match
                                    </p>
                                )}
                                {passwordsMismatch && (
                                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Passwords don't match
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-200 active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Updating your password...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Settings
