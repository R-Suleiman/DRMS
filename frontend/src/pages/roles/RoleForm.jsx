import { FileWarning, Upload } from 'lucide-react'
import React, { useState } from 'react'
import { showTopErrorAlert, showTopSuccessAlert } from '../../utils/sweetAlert'
import axiosClient from '../../assets/js/axios-client'
import { useModal } from '../../context/ModalContext'

function RoleForm({ role = null, reload }) {
    const { closeModal } = useModal()
    const [errors, setErrors] = useState()
    const [loading, setLoading] = useState(false)
    const [roleName, setRoleName] = useState(role?.name || '')

    const handleUpload = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            let response = null
            if (role && role.id) {
                response = await axiosClient.put(`/roles/${role.id}`,
                    { name: roleName },
                )
            } else {
                response = await axiosClient.post('/roles',
                    { name: roleName },
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
                        htmlFor="role_name"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        Role Name
                    </label>
                    <input
                        type='text'
                        name="role_name"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
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
                        {loading ? 'saving role...' : role?.id ? 'Update Role' : 'Create Role'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default RoleForm
