import React, { useState } from 'react'
import { FileWarning, FolderOpen, Upload, User } from "lucide-react";
import { useModal } from '../../context/ModalContext';
import axiosClient from '../../assets/js/axios-client';
import { showTopSuccessAlert } from '../../utils/sweetAlert';
import { can } from '../../utils/auth';
import { useAuth } from '../../context/AuthProvider';

function RecordForm({ navigateTo, record = null }) {
    const { user } = useAuth()
    const { closeModal } = useModal()
    const [errors, setErrors] = useState([])
    const [loading, setLoading] = useState(false)
    const [formValues, setFormValues] = useState({
        first_name: record?.first_name || '',
        middle_name: record?.middle_name || '',
        last_name: record?.last_name || '',
        gender: record?.gender || '',
        dob: record?.dob || '',
        phone: record?.phone || '',
        email: record?.email || '',
        nida: record?.nida || '',
        photo: '',
        is_classified: record?.is_classified || false,
    })
    const [metadata, setMetadata] = useState({
        shelf_no: record?.metadata.find((m) => m.meta_key === 'shelf_no')?.meta_value || '',
        raw_no: record?.metadata.find((m) => m.meta_key === 'raw_no')?.meta_value || '',
        draw_no: record?.metadata.find((m) => m.meta_key === 'draw_no')?.meta_value || ''
    })

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target;

        setFormValues((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };


    const handleMetadataChange = (e) => {
        setMetadata({ ...metadata, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormValues({
            ...formValues,
            photo: e.target.files[0],
        });
    };

    const handleUpload = async (e) => {
        e.preventDefault()
        setLoading(true)

        const data = new FormData();
        data.append("first_name", formValues.first_name);
        data.append("middle_name", formValues.middle_name);
        data.append("last_name", formValues.last_name);
        data.append("gender", formValues.gender);
        data.append("dob", formValues.dob);
        data.append("phone", formValues.phone);
        data.append("email", formValues.email);
        data.append("nida", formValues.nida);
        data.append("photo", formValues.photo);
        data.append("metadata", JSON.stringify(metadata));
        data.append("is_classified", formValues.is_classified ? 1 : 0);

        try {
            let response = null
            if (record && record.id) {
                response = await axiosClient.post(`/records/${record.id}/update`,
                    data,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                )

            } else {
                response = await axiosClient.post('/records',
                    data,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                )

            }
            if (response.data && response.data.success) {
                showTopSuccessAlert(response.data.message)
                closeModal()
                navigateTo(`/records/${response.data.recordId}`)
            }
        } catch (error) {
            const response = error.response;
            if (response && response.status == 422) {
                setErrors(response.data.errors);
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

                <h3 className='text-slate-500 flex items-center space-x-2'><User /> <span className='text-lg'>Profile Details</span></h3>
                {/* Profile info */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
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
                            htmlFor="gender"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formValues.gender}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300 cursor-pointer"
                        >
                            <option value="">Select gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="dob"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Date of Birth
                        </label>
                        <input
                            type='date'
                            name="dob"
                            value={formValues.dob}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="phone"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Phone Number
                        </label>
                        <input
                            type='text'
                            name="phone"
                            value={formValues.phone}
                            onChange={handleInputChange}
                            placeholder='eg., 07xxxxxxxx'
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Email Adress
                        </label>
                        <input
                            type='email'
                            name="email"
                            value={formValues.email}
                            onChange={handleInputChange}
                            placeholder='eg., john@example.com'
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="nida"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Nida Number
                        </label>
                        <input
                            type='text'
                            name="nida"
                            value={formValues.nida}
                            onChange={handleInputChange}
                            placeholder='eg., xxxxxxxx-xxxxx-xxxxx-xx'
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="photo"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Profile Photo
                        </label>
                        <input
                            type='file'
                            name="photo"
                            onChange={handleFileChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>
                </div>

                <h3 className='text-slate-500 flex items-center space-x-2'><FolderOpen /> <span className='text-lg'>Records Metadata</span></h3>
                {/* Metadata */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className="space-y-2">
                        <label
                            htmlFor="shelf_no"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Shelf Number
                        </label>
                        <input
                            type='text'
                            name="shelf_no"
                            value={metadata.shelf_no}
                            onChange={handleMetadataChange}
                            placeholder='eg., xx'
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="raw_no"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Shelf Row Number
                        </label>
                        <input
                            type='text'
                            name="raw_no"
                            value={metadata.raw_no}
                            onChange={handleMetadataChange}
                            placeholder='eg., xx'
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="draw_no"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Shelf Draw Number
                        </label>
                        <input
                            type='text'
                            name="draw_no"
                            value={metadata.draw_no}
                            onChange={handleMetadataChange}
                            placeholder='eg., xx'
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>

                    {can(user, 'manage_classified_records') && (
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <label
                                htmlFor="is_classified"
                                className="font-semibold text-slate-700"
                            >
                                Mark as Classified
                            </label>
                            <input
                                type='checkbox'
                                className='w-5 h-5'
                                name="is_classified"
                                value={true}
                                checked={!!formValues.is_classified}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
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
                        {loading ? 'saving record...' : record?.id ? 'Update Record' : 'Create Record'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default RecordForm
