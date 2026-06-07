import { FileWarning } from 'lucide-react'
import React, { useState } from 'react'
import { showTopErrorAlert, showTopSuccessAlert } from '../../utils/sweetAlert'
import axiosClient from '../../assets/js/axios-client'
import { useModal } from '../../context/ModalContext'

function DepartmentForm({ department = null, reload }) {
    const { closeModal } = useModal()
    const [errors, setErrors] = useState()
    const [loading, setLoading] = useState(false)
    const [formValues, setFormValues] = useState({
        name: department?.name || '',
        short_name: department?.short_name || '',
    })

    const handleInputChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            let response = null
            if (department && department.id) {
                response = await axiosClient.put(`/departments/${department.id}`,
                    { ...formValues },
                )
            } else {
                response = await axiosClient.post('/departments',
                    { ...formValues },
                )
            }
            if (response.data && response.data.success) {
                showTopSuccessAlert(response.data.message)
                reload()
                closeModal()
            }
        } catch (error) {
            const response = error.response;
            if (response && response.status == 422) {
                setErrors(response.data.errors);
            } else {
                showTopErrorAlert(response?.data?.message || 'An error occurred')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
                {errors && (
                    <div className="p-2 text-red-500 font-semibold">
                        {Object.keys(errors).map((key) => (
                            <p key={key} className='border border-red-600 bg-red-400 rounded-sm p-1 w-fit text-white flex items-center text-sm space-x-2'><div className='text-xs'><FileWarning /></div> <span>{errors[key][0]}</span></p>
                        ))}
                    </div>
                )}

                <div className="space-y-2">
                    <label
                        htmlFor="name"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        Department Name
                    </label>
                    <input
                        type='text'
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Human Resources"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="short_name"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        Short Name
                    </label>
                    <input
                        type='text'
                        name="short_name"
                        value={formValues.short_name}
                        onChange={handleInputChange}
                        placeholder="e.g., HR"
                        maxLength="10"
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                    />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 disabled:bg-gray-400 transition"
                    >
                        {loading ? 'Saving...' : (department ? 'Update' : 'Create')}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default DepartmentForm
