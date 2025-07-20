import React from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const USER_API = import.meta.env.VITE_USER_URL || '';

const CustomerList = () => {
    const { customers, axios, fetchCustomers } = useAppContext();

    const toggleBlock = async (id, isBlocked) => {
        try {
            const { data } = await axios.put(`${USER_API}/api/seller/block/${id}`, {
                isBlocked: !isBlocked
            });
            if (data.success) {
                fetchCustomers();
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-lg font-medium">All Customers</h2>
                <div className="flex flex-col items-center min-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                    <table className="md:table-auto table-fixed w-full overflow-hidden">
                        <thead className="text-gray-900 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate">Customer</th>
                                <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">Email</th>
                                <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">ID</th>
                                <th className="px-4 py-3 font-semibold truncate">Blocked</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {customers.map((user) => (
                                <tr key={user._id} className="border-t border-gray-500/20">
                                    <td className="md:px-4 pl-2 md:pl-4 py-3 truncate">{user.name}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">{user.email}</td>
                                    <td className="px-4 py-3 hidden md:table-cell">{user._id}</td>
                                    <td className="px-4 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                            <input
                                                onChange={() => toggleBlock(user._id, user.isBlocked)}
                                                checked={user.isBlocked}
                                                type="checkbox"
                                                className="sr-only peer"
                                            />
                                            <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-red-600 transition-colors duration-200"></div>
                                            <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
