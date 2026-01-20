import { FileWarning, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { showTopErrorAlert, showTopSuccessAlert } from '../../utils/sweetAlert'
import axiosClient from '../../assets/js/axios-client'
import { useModal } from '../../context/ModalContext'

function UserForm({ user = null, reload }) {
    const { closeModal } = useModal()
    const [errors, setErrors] = useState()
    const [loading, setLoading] = useState(false)
    const [formValues, setFormValues] = useState({
        first_name: user?.first_name || '',
        middle_name: user?.middle_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
    })

    const handleInputChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    const handleUpload = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            let response = null
            if (user && user.id) {
                response = await axiosClient.put(`/users/${user.id}`,
                    { ...formValues },
                )
            } else {
                response = await axiosClient.post('/users',
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
                showTopErrorAlert(response.data.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            <form onSubmit={handleUpload} className="space-y-6">
                {errors && (
                    <div className="p-2 text-red-500 font-semibold">
                        {Object.keys(errors).map((key) => (
                            <p key={key} className='border border-red-600 bg-red-400 rounded-sm p-1 w-fit text-white flex items-center text-sm space-x-2'><div className='text-xs'><FileWarning /></div> <span>{errors[key][0]}</span></p>
                        ))}
                    </div>
                )}

                <div className="space-y-2">
                    <label
                        htmlFor="first_name"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        First Name
                    </label>
                    <input
                        type='text'
                        name="first_name"
                        value={formValues.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                    />
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="middle_name"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        Middle Name
                    </label>
                    <input
                        type='text'
                        name="middle_name"
                        value={formValues.middle_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                    />
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="last_name"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        Last Name
                    </label>
                    <input
                        type='text'
                        name="last_name"
                        value={formValues.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                    />
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        Email
                    </label>
                    <input
                        type='email'
                        name="email"
                        value={formValues.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                    />
                </div>
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full group px-6 py-3 text-sm font-semibold rounded-xl bg-linear-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <Upload
                            size={18}
                            className="group-hover:translate-y-[-2px] transition-transform"
                        />
                        {loading ? 'saving user...' : user?.id ? 'Update User' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default UserForm
