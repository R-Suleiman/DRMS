import React, { useState } from 'react'
import axiosClient from '../assets/js/axios-client';
import { Check, FileWarning, Key } from 'lucide-react';
import { showSuccessAlert, showTopSuccessAlert } from '../utils/sweetAlert';

function ChangePassword() {
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [passwordAttributes, setPaswordAttributes] = useState({
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const handleInputChange = (e) => {
        setPaswordAttributes({
            ...passwordAttributes,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordUpdate = (e) => {
        e.preventDefault();
        setLoading(true);
        axiosClient
            .post("/change-password", passwordAttributes)
            .then(({ data }) => {
                showTopSuccessAlert(data.message);
                setLoading(false);
                setErrors(null);
                setPaswordAttributes([]);
            })
            .catch((err) => {
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(
                        response.data.errors || {
                            email: [response.data.message],
                        }
                    );
                }
                setLoading(false);
            });
    };

  return (
    <div className="w-full bg-white md:w-11/12 mx-auto rounded-lg p-8">
        <div className='w-fit flex items-center mx-auto space-x-2'>
            <div className='bg-slate-700 rounded-full p-2 text-white'>
        <Key size={18} />
            </div>
        <h1 className='text-slate-800 text-center my-4'>Change Password</h1>
        </div>
    <form onSubmit={handlePasswordUpdate} className="space-y-6 md:w-1/3 mx-auto">
        {errors && (
            <div className="p-2 text-red-500 font-semibold">
                {Object.keys(errors).map((key) => (
                    <p key={key} className='border border-red-600 bg-red-400 rounded-sm p-1 w-fit text-white flex items-center text-sm space-x-2'><div className='text-xs'><FileWarning /></div> <span>{errors[key][0]}</span></p>
                ))}
            </div>
        )}

        <div className="space-y-2">
            <label
                htmlFor="old_password"
                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
                Old Password
            </label>
            <input
                type='password'
                name="old_password"
                value={passwordAttributes.old_password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
            />
        </div>
        <div className="space-y-2">
            <label
                htmlFor="new_password"
                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
                New Password
            </label>
            <input
                type='password'
                name="new_password"
                value={passwordAttributes.new_password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
            />
        </div>
        <div className="space-y-2">
            <label
                htmlFor="new_password_confirmation"
                className="flex items-center gap-2 text-sm font-semibold text-slate-700"
            >
                Confirm New Password
            </label>
            <input
                type='password'
                name="new_password_confirmation"
                value={passwordAttributes.new_password_confirmation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
            />
        </div>
        <div className="pt-4">
            <button
                type="submit"
                className="w-full group px-6 py-3 text-sm font-semibold rounded-xl bg-linear-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
                <Check
                    size={18}
                    className="group-hover:translate-y-[-2px] transition-transform"
                />
                {loading ? 'saving...' : 'Change Password'}
            </button>
        </div>
    </form>
</div>
  )
}

export default ChangePassword
