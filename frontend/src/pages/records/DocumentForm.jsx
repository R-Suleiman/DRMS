import React, { useEffect, useState } from "react";
import { FolderOpen, FileText, Upload, X, FileWarning } from "lucide-react";
import axiosClient from "../../assets/js/axios-client";
import { showTopSuccessAlert } from "../../utils/sweetAlert";
import { useModal } from "../../context/ModalContext";

function DocumentForm({ recordId, reload }) {
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [errors, setErrors] = useState([]);
    const { closeModal } = useModal();
    const [formValues, setFormValues] = useState({
        category: "",
        type: "",
        file: "",
    });

    const handleInputChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        const getCategories = async () => {
            const response = await axiosClient.get("/record-categories");
            setCategories(response.data.categories);
        };

        getCategories();
    }, []);

    useEffect(() => {
        const getRecordTypes = async () => {
            const response = await axiosClient.get(
                `/record-categories/${formValues.category}/record-types`
            );
            setTypes(response.data.types);
        };

        if (formValues.category) {
            getRecordTypes();
        }
    }, [formValues.category]);

    const handleFileChange = (e) => {
        setFormValues({
            ...formValues,
            file: e.target.files[0],
        });
    };

    const removeFile = () => {
        setFormValues({
            ...formValues,
            file: "",
        });
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("category", formValues.category);
        data.append("type", formValues.type);
        data.append("file", formValues.file);

        try {
            const response = await axiosClient.post(
                `/records/${recordId}/documents`,
                data,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            if (response.data.success === true) {
                showTopSuccessAlert(response.data.message);
                closeModal();
                reload();
            }
        } catch (error) {
            const response = error.response;
            if (response && response.status == 422) {
                setErrors(response.data.errors);
            }
        }
    };

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

                {/* Document Category */}
                <div className="space-y-2">
                    <label
                        htmlFor="category"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        <FolderOpen size={16} className="text-slate-500" />
                        Document Category
                    </label>
                    <select
                        id="category"
                        name="category"
                        value={formValues.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300 cursor-pointer"
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => {
                            return (
                                <option key={category.id} value={category.id}>
                                    {category.category_name}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Document Type */}
                <div className="space-y-2">
                    <label
                        htmlFor="type"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        <FileText size={16} className="text-slate-500" />
                        Document Type
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={formValues.type}
                        onChange={handleInputChange}
                        disabled={!formValues.category || types.length === 0}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300 cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:border-slate-200"
                    >
                        <option value="">
                            {!formValues.category
                                ? "Select a category first"
                                : types.length === 0
                                ? "Loading types..."
                                : "Select a type"}
                        </option>
                        {types.map((type) => {
                            return (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                    <label
                        htmlFor="file"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        <Upload size={16} className="text-slate-500" />
                        Attach Document
                    </label>
                    {!formValues.file ? (
                        <div className="relative">
                            <input
                                type="file"
                                id="file"
                                name="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-400 transition-all duration-200 group">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="p-4 rounded-full bg-slate-200/50 group-hover:bg-slate-300/50 transition-colors">
                                        <Upload
                                            size={24}
                                            className="text-slate-600"
                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-700">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-slate-200 rounded-xl p-4 bg-slate-50/50 flex items-center justify-between group hover:bg-slate-100/50 transition-all duration-200">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 rounded-lg bg-slate-200/50">
                                    <FileText
                                        size={20}
                                        className="text-slate-600"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">
                                        {formValues.file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(
                                            formValues.file.size /
                                            1024 /
                                            1024
                                        ).toFixed(2)}{" "}
                                        MB
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={removeFile}
                                className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group/btn"
                            >
                                <X
                                    size={18}
                                    className="group-hover/btn:scale-110 transition-transform"
                                />
                            </button>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        className="w-full group px-6 py-3 text-sm font-semibold rounded-xl bg-linear-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        disabled={
                            !formValues.category ||
                            !formValues.type ||
                            !formValues.file
                        }
                    >
                        <Upload
                            size={18}
                            className="group-hover:translate-y-[-2px] transition-transform"
                        />
                        Upload Document
                    </button>
                </div>
            </form>
        </div>
    );
}

export default DocumentForm;
