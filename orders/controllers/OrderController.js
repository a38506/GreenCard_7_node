import axios from 'axios';
import 'dotenv/config';

const PAYMENT_API = process.env.PAYMENT_API;

export const fetchUserOrdersFromPayment = async (req, res) => {
  try {
    const { data } = await axios.get(`${PAYMENT_API}/api/payment/user`, {
      headers: {
        Cookie: req.headers.cookie, // nếu có auth token trong cookie
        Authorization: req.headers.authorization // nếu dùng Bearer token
      }
    });

    res.json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchAllOrdersFromPayment = async (req, res) => {
  try {
    const { data } = await axios.get(`${PAYMENT_API}/api/payment/seller`, {
      headers: {
        Cookie: req.headers.cookie,
        Authorization: req.headers.authorization
      }
    });

    res.json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forwardUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const { data } = await axios.put(`${PAYMENT_API}/api/payment/orders/${id}/status`,
      { status },
      {
        headers: {
          Cookie: req.headers.cookie,
          Authorization: req.headers.authorization
        }
      }
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// api/order/dashboard
export const fetchOrderStatsFromPayment = async (req, res) => {
  try {
    const { data } = await axios.get(`${PAYMENT_API}/api/payment/seller`, {
      headers: {
        Cookie: req.headers.cookie,
        Authorization: req.headers.authorization,
      },
    });

    const orders = data.orders || [];

    // Tính tổng doanh thu
    const totalRevenue = orders.reduce((acc, o) => {
      const paymentType = o.paymentType?.toLowerCase();
      const status = o.status?.toLowerCase();
      const isPaid = o.isPaid || (paymentType === 'cod' && status === 'delivered');
      return acc + (isPaid ? o.amount : 0);
    }, 0);

    // Tính revenue theo từng ngày
    const revenueByDay = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
    };

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });

      const paymentType = order.paymentType?.toLowerCase();
      const status = order.status?.toLowerCase();
      const isPaid = order.isPaid || (paymentType === 'cod' && status === 'delivered');

      if (isPaid && revenueByDay.hasOwnProperty(day)) {
        revenueByDay[day] += order.amount;
      }
    });

    const stats = {
      totalPlaced: orders.length,
      totalConfirmed: orders.filter(o => o.status?.toLowerCase() === 'confirmed').length,
      totalDelivered: orders.filter(o => o.status?.toLowerCase() === 'delivered').length,
      totalPending: orders.filter(o => o.status?.toLowerCase() === 'pending').length,
      totalCancelled: orders.filter(o => o.status?.toLowerCase() === 'cancelled').length,
      totalRevenue,
      revenueByDay: Object.entries(revenueByDay).map(([day, revenue]) => ({ day, revenue })),
    };

    res.json({ success: true, ...stats });
  } catch (err) {
    console.error("Failed to fetch stats from PAYMENT_API:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
