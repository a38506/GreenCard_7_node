import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets';
import toast from 'react-hot-toast';

const ORDER_API = import.meta.env.VITE_ORDER_URL || '';


const Orders = () => {
    const { currency, axios } = useAppContext();
    const [orders, setOrders] = useState([]);

    const fectchOrders = async () => {
        try {
            const { data } = await axios.get(`${ORDER_API}/api/order/seller`)
            if (data.success) {
                setOrders(data.orders)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const { data } = await axios.put(`${ORDER_API}/api/order/${orderId}/status`, {
                status: newStatus,
            });

            if (data.success) {
                toast.success("Order status updated");
                fectchOrders();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Error updating status");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#facc15';       // yellow-500
            case 'Confirmed': return '#3b82f6';     // blue-500
            case 'Delivered': return '#16a34a';     // green-600
            case 'Cancelled': return '#ef4444';     // red-500
            default: return '#6b7280';              // gray-500
        }
    };


    useEffect(() => {
        fectchOrders();
    }, [])

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium">Orders List</h2>
                {orders.map((order, index) => (
                    <div key={index} className="flex flex-col md:flex-row md:items-center justify-between p-5 max-w-4xl rounded-md border border-gray-300 gap-4 md:gap-0">

                        {/* Items */}
                        <div className="flex gap-4 w-full md:w-1/3">
                            <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                            <div>
                                {order.items.map((item, index) => (
                                    <p key={index} className="font-medium text-sm">
                                        {item.productDetails?.name} <br />{item.productDetails?.offerPrice} <span className="text-primary">x {item.quantity}</span>
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Address */}
                        <div className="w-full md:w-1/3 text-sm text-black/70 leading-5">
                            <p className="text-black">
                                {order.address?.firstName} {order.address?.lastName}
                            </p>
                            <p>{order.address?.street}, {order.address?.city}</p>
                            <p>{order.address?.state}, {order.address?.zipcode}, {order.address?.country}</p>
                            <p>{order.address?.phone}</p>
                        </div>

                        {/* Amount */}
                        <div className="w-full md:w-[70px] text-lg font-semibold text-center text-black">
                            {currency}{order.amount}
                        </div>

                        {/* Payment Info */}
                        <div className="w-full md:w-[120px] text-sm text-right md:text-left">
                            <p>Method: {order.paymentType}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                className="mt-1 text-xs border rounded p-1"
                                style={{ color: getStatusColor(order.status) }}
                            >
                                {['Pending', 'Confirmed', 'Delivered', 'Cancelled'].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>

                        </div>

                    </div>
                ))}
            </div>
        </div>
    )
}

export default Orders
