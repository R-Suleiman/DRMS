import { useEffect, useState } from "react";
import axiosClient from "../../assets/js/axios-client";
import { Check, FileWarning } from "lucide-react";
import { showTopErrorAlert, showTopSuccessAlert } from "../../utils/sweetAlert";
import { useModal } from "../../context/ModalContext";

export default function UserRolesForm({ userId, reload }) {
    const { closeModal } = useModal()
    const [roles, setRoles] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('')
    const [errors, setErrors] = useState([])

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [users, rolesRes] = await Promise.all([
            axiosClient.get(`/users/${userId}`),
            axiosClient.get(`/get-roles`),
        ]);

        setRoles(rolesRes.data);
        setSelected(users.data.roles);
        setRole(users.data.roles.find((r) => r === 'root admin') || '')
    };

    const toggleRole = (role) => {
        setSelected(prev =>
            prev.includes(role)
                ? prev.filter(p => p !== role)
                : [...prev, role]
        );
    };

    const saveRoles = async () => {
        setLoading(true);

        try {
            const response = await axiosClient.post(`/users/${userId}/roles`, {
                roles: selected,
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
                User Roles
            </h2>

            {errors && (
                    <div className="p-2 text-red-500 font-semibold">
                        {Object.keys(errors).map((key) => (
                            <p key={key} className='border border-red-600 bg-red-400 rounded-sm p-1 w-fit text-white flex items-center text-sm space-x-2'><div className='text-xs'><FileWarning /></div> <span>{errors[key][0]}</span></p>
                        ))}
                    </div>
                )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roles.map(r => (
                    <label
                        key={r.id}
                        className="flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50"
                    >
                        <span className="capitalize">
                            {r.name.replaceAll("_", " ")}
                        </span>

                        <input
                            type="checkbox"
                            checked={selected.includes(r.name)}
                            onChange={() => toggleRole(r.name)}
                            className="w-5 h-5"
                            disabled={role === 'root admin' ? true : false}
                        />
                    </label>
                ))}
            </div>

            <div className="flex justify-end mt-6">
                <button
                    type="submit"
                    className="w-full group px-6 py-3 text-sm font-semibold rounded-xl bg-linear-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={saveRoles}
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
