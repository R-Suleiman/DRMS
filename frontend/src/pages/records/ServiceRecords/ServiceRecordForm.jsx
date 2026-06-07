import React, { useEffect, useState } from "react";
import { FileWarning, FolderOpen, Upload, User } from "lucide-react";
import { useModal } from "../../../context/ModalContext";
import axiosClient from "../../../assets/js/axios-client";
import { showTopSuccessAlert } from "../../../utils/sweetAlert";
import { can } from "../../../utils/auth";
import { useAuth } from "../../../context/AuthProvider";

function ServiceRecordForm({ navigateTo, record = null }) {
    const { user } = useAuth();
    const { closeModal } = useModal();
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [formValues, setFormValues] = useState({
        service_name: record?.service_records?.[0]?.service_name || "",
        department_id: record?.service_records?.[0]?.department_id || "",
        description: record?.service_records?.[0]?.description || "",
        is_classified: record?.service_records?.[0]?.is_classified || false,
    });
    const [metadata, setMetadata] = useState({
        shelf_no:
            record?.metadata.find((m) => m.meta_key === "shelf_no")
                ?.meta_value || "",
        raw_no:
            record?.metadata.find((m) => m.meta_key === "raw_no")?.meta_value ||
            "",
        draw_no:
            record?.metadata.find((m) => m.meta_key === "draw_no")
                ?.meta_value || "",
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axiosClient.get(
                    "/service-records/departments/get",
                );
                if (response.data && response.data.departments) {
                    setDepartments(response.data.departments);
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        }
        fetchDepartments();
    }, []);

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target;

        setFormValues((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
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
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("service_name", formValues.service_name);
        data.append("department_id", formValues.department_id);
        data.append("description", formValues.description);
        data.append("metadata", JSON.stringify(metadata));
        data.append("is_classified", formValues.is_classified ? 1 : 0);

        try {
            let response = null;
            if (record && record.id) {
                response = await axiosClient.post(
                    `/service-records/${record.id}/update`,
                    data,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    },
                );
            } else {
                response = await axiosClient.post("/service-records", data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            if (response.data && response.data.success) {
                showTopSuccessAlert(response.data.message);
                closeModal();
                navigateTo(`/records/service/${response.data.recordId}`);
            }
        } catch (error) {
            const response = error.response;
            if (response && response.status == 422) {
                setErrors(response.data.errors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleUpload} className="space-y-6">
                {errors && (
                    <div className="p-2 text-red-500 font-semibold">
                        {Object.keys(errors).map((key) => (
                            <p
                                key={key}
                                className="border border-red-600 bg-red-400 rounded-sm p-1 w-fit text-white flex items-center text-sm space-x-2"
                            >
                                <div className="text-xs">
                                    <FileWarning />
                                </div>{" "}
                                <span>{errors[key][0]}</span>
                            </p>
                        ))}
                    </div>
                )}

                <h3 className="text-slate-500 flex items-center space-x-2">
                    <User /> <span className="text-lg">Profile Details</span>
                </h3>
                {/* Profile info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="service_name"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Service Name
                        </label>
                        <input
                            type="text"
                            name="service_name"
                            value={formValues.service_name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="department_id"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Department
                        </label>
                        <select
                            name="department_id"
                            value={formValues.department_id}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300 cursor-pointer"
                        >
                            <option value="">Select department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name} {`(${dept.short_name})`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="description"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                    >
                        Description
                    </label>
                    <textarea
                        rows={4}
                        name="description"
                        value={formValues.description}
                        onChange={handleInputChange}
                        className="w-8/12 px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                    ></textarea>
                </div>

                <h3 className="text-slate-500 flex items-center space-x-2">
                    <FolderOpen />{" "}
                    <span className="text-lg">Records Metadata</span>
                </h3>
                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="shelf_no"
                            className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                        >
                            Shelf Number
                        </label>
                        <input
                            type="text"
                            name="shelf_no"
                            value={metadata.shelf_no}
                            onChange={handleMetadataChange}
                            placeholder="eg., xx"
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
                            type="text"
                            name="raw_no"
                            value={metadata.raw_no}
                            onChange={handleMetadataChange}
                            placeholder="eg., xx"
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
                            type="text"
                            name="draw_no"
                            value={metadata.draw_no}
                            onChange={handleMetadataChange}
                            placeholder="eg., xx"
                            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 focus:outline-none transition-all duration-200 hover:border-slate-300"
                        />
                    </div>

                    {can(user, "manage_classified_records") && (
                        <div className="flex items-center gap-2 text-sm mt-2">
                            <label
                                htmlFor="is_classified"
                                className="font-semibold text-slate-700"
                            >
                                Mark as Classified
                            </label>
                            <input
                                type="checkbox"
                                className="w-5 h-5"
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
                        {loading
                            ? "saving record..."
                            : record?.id
                              ? "Update Record"
                              : "Create Record"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ServiceRecordForm;
