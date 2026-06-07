import { FileWarning } from 'lucide-react'
import React, { useState } from 'react'
import { showTopErrorAlert, showTopSuccessAlert } from '../../utils/sweetAlert'
import axiosClient from '../../assets/js/axios-client'
import { useModal } from '../../context/ModalContext'

function CategoryForm({ category = null, reload }) {
    const { closeModal } = useModal()
    const [errors, setErrors] = useState()
    const [loading, setLoading] = useState(false)
    const [formValues, setFormValues] = useState({ category_name: category?.category_name || '' })

    const handleInputChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response = null;
            if (category && category.id) {
                response = await axiosClient.put(`/document-categories/${category.id}`, { ...formValues });
            } else {
                response = await axiosClient.post('/document-categories', { ...formValues });
            }
            if (response.data && response.data.success) {
                showTopSuccessAlert(response.data.message)
                reload()
                closeModal()
            }
        } catch (error) {
            const response = error.response;
            if (response && response.status == 422) setErrors(response.data.errors);
            else showTopErrorAlert(response?.data?.message || 'An error occurred')
        } finally { setLoading(false); }
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
                    <label className="text-sm font-semibold text-slate-700">Category Name</label>
                    <input type="text" name="category_name" value={formValues.category_name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700" />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={closeModal} className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg bg-gray-600 text-white">{loading ? 'Saving...' : (category ? 'Update' : 'Create')}</button>
                </div>
            </form>
        </div>
    )
}

export default CategoryForm
