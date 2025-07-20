import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const ORDER_API = import.meta.env.VITE_ORDER_URL || '';

const MyOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const { currency, axios, user } = useAppContext();
  const [expandedOrders, setExpandedOrders] = useState([]);

  const fetchMyOrders = async () => {
    try {
      const { data } = await axios.get(`${ORDER_API}/api/order/user`);
      if (data.success) {
        setMyOrders(data.orders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;
    try {
      const { data } = await axios.put(`${ORDER_API}/api/order/${orderId}/status`, {
        status: 'Cancelled'
      });

      if (data.success) {
        toast.success("Order cancelled");
        fetchMyOrders();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to cancel order");
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  return (
    <div className='mt-16 pb-16'>
      <div className='flex flex-col items-end w-max mb-8'>
        <p className='text-2xl font-medium uppercase'>My Orders</p>
        <div className='w-16 h-0.5 bg-primary rounded-full'></div>
      </div>

      {myOrders.map((order) => {
        const isExpanded = expandedOrders.includes(order._id);
        const toggleExpand = () => {
          setExpandedOrders((prev) =>
            prev.includes(order._id)
              ? prev.filter((id) => id !== order._id)
              : [...prev, order._id]
          );
        };

        return (
          <div
            key={order._id}
            onClick={toggleExpand}
            className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-5xl cursor-pointer'
          >
            <div className="grid grid-cols-4 justify-between text-gray-400 md:font-medium mb-4">
              <span className="col-span-1 truncate">OrderId: {order._id}</span>
              <span></span>
              <span className="text-left">Payment: {order.paymentType}</span>
              <span className="text-right">Total Amount: <span className="font-semibold text-gray-800">{currency}{order.amount}</span></span>
            </div>

            {(isExpanded ? order.items : order.items.slice(0, 1)).map((item, idx) => {
              const product = item?.productDetails || {};
              const imageUrl = Array.isArray(product.image) ? product.image[0] : '/no-image.png';
              const amount = product.offerPrice && item.quantity ? product.offerPrice * item.quantity : 0;

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-4 gap-4 items-center text-gray-500/70 border-b border-gray-300 py-5`}
                >
                  <div className='flex items-center'>
                    <div className='bg-primary/10 p-4 rounded-lg'>
                      <img src={imageUrl} alt={product.name} className='w-16 h-16' />
                    </div>
                    <div className='ml-4'>
                      <h2 className='text-xl font-medium text-gray-800'>{product.name}</h2>
                      <p className='text-gray-400'>Category: {product.category}</p>
                    </div>
                  </div>

                  <div>
                    <p>Quantity: {item.quantity}</p>
                    <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div>
                    <p>Status: <span className="font-semibold">{order.status}</span></p>
                    <button
                      disabled={!(order.paymentType === "COD" && order.status === "Pending")}
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelOrder(order._id);
                      }}
                      className={`text-sm mt-2 px-3 py-1 rounded border font-medium transition-colors duration-150 ${
                        order.paymentType === "COD" && order.status === "Pending"
                          ? "text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          : "text-gray-400 border-gray-300 cursor-not-allowed"
                      }`}
                    >
                      Cancel Order
                    </button>
                  </div>

                  <div className='text-primary text-lg font-medium text-right'>
                    Amount: {currency}{amount}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default MyOrders;
