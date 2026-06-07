import { FileWarning } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { showTopErrorAlert, showTopSuccessAlert } from '../../utils/sweetAlert'
import axiosClient from '../../assets/js/axios-client'
import { useModal } from '../../context/ModalContext'

function TypeForm({ type = null, reload }) {
    const { closeModal } = useModal()
    const [errors, setErrors] = useState()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])
    const [formValues, setFormValues] = useState({ category_id: type?.category_id || '', name: type?.name || '' })

    useEffect(() => {
        axiosClient.get('/document-categories/list').then(res => setCategories(res.data.categories || []))
    }, [])

    const handleInputChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response = null;
            if (type && type.id) {
                response = await axiosClient.put(`/document-types/${type.id}`, { ...formValues });
            } else {
                response = await axiosClient.post('/document-types', { ...formValues });
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
                    <label className="text-sm font-semibold text-slate-700">Category</label>
                    <select name="category_id" value={formValues.category_id} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700">
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Type Name</label>
                    <input type="text" name="name" value={formValues.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700" />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                    <button type="button" onClick={closeModal} className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-3 rounded-lg bg-gray-600 text-white">{loading ? 'Saving...' : (type ? 'Update' : 'Create')}</button>
                </div>
            </form>
        </div>
    )
}

export default TypeForm
