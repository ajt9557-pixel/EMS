import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../../utils/api'

const EditDepartment = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [dep_name, setDepName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [error, setError] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const authHeader = { headers: { authorization: `Bearer ${token}` } }

  const fetchDepartment = async () => {
    if (!id) {
      setError('Invalid department id in URL')
      setLoading(false)
      return
    }
    try {
      const response = await axios.get(`${API_URL}/api/department/${id}`, authHeader)
      if (response.data.success) {
        setDepName(response.data.department.dep_name)
        setDescription(response.data.department.description)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load department')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchDepartment()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const response = await axios.put(
        `${API_URL}/api/department/${id}`,
        { dep_name, description },
        authHeader
      )
      if (response.data.success) {
        navigate('/admin-dashboard/department-dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <button
          type="button"
          onClick={() => navigate('/admin-dashboard/department-dashboard')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Departments
        </button>
        <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">
          Edit Department
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Update the department details
        </p>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="department-name" className="block text-sm font-medium text-gray-600">
              Department Name
            </label>
            <input
              type="text"
              id="department-name"
              value={dep_name}
              onChange={(e) => setDepName(e.target.value)}
              placeholder="Enter department name"
              className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-gray-600">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows="4"
              className="w-full border border-blue-100 bg-blue-50/40 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EditDepartment
