import { useEffect, useState } from "react";
import axiosClient from "../../assets/js/axios-client";
import { Check } from "lucide-react";
import { showTopErrorAlert, showTopSuccessAlert } from "../../utils/sweetAlert";
import { useModal } from "../../context/ModalContext";

export default function RolePermissionsForm({ roleId, reload }) {
    const { closeModal } = useModal()
    const [permissions, setPermissions] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [roleRes, permsRes] = await Promise.all([
            axiosClient.get(`/roles/${roleId}`),
            axiosClient.get(`/permissions`),
        ]);

        setPermissions(permsRes.data);
        setSelected(roleRes.data.permissions);
    };

    const togglePermission = (permission) => {
        setSelected(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const savePermissions = async () => {
        setLoading(true);

        try {
            const response = await axiosClient.post(`/roles/${roleId}/permissions`, {
                permissions: selected,
            });

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
        }

        setLoading(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold mb-6">
                Role Permissions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {permissions.map(p => (
                    <label
                        key={p.id}
                        className="flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50"
                    >
                        <span className="capitalize">
                            {p.name.replaceAll("_", " ")}
                        </span>

                        <input
                            type="checkbox"
                            checked={selected.includes(p.name)}
                            onChange={() => togglePermission(p.name)}
                            className="w-5 h-5"
                        />
                    </label>
                ))}
            </div>

            <div className="flex justify-end mt-6">
                <button
                    type="submit"
                    className="w-full group px-6 py-3 text-sm font-semibold rounded-xl bg-linear-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={savePermissions}
                    disabled={loading}
                >
                    <Check
                        size={18}
                        className="group-hover:translate-y-[-2px] transition-transform"
                    />
                    Save Changes
                </button>
            </div>
        </div>
    );
}
