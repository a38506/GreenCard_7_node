import Order from "../models/Order.js"
import stripe from 'stripe'
import axios from 'axios';
import 'dotenv/config';

const PRODUCT_API = process.env.PRODUCT_URL || '';
const USER_API = process.env.USER_URL || '';


const getUserById = async (id) => {
  const response = await axios.get(`${USER_API}/api/user/${id}`);
  return response.data;
};

const getProductById = async (id) => {
  const response = await axios.get(`${PRODUCT_API}/api/product/${id}`);
  return response.data?.product || null;
};


// Place Order COD: api/payment/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invaild data" })
    }

    // Caculate Amount Using Items
    let amount = 0;

    for (const item of items) {
      const product = await getProductById(item.product);
      if (!product || !product.offerPrice) {
        throw new Error("Sản phẩm không hợp lệ hoặc thiếu giá");
      }
      amount += product.offerPrice * item.quantity;
    }

    // Add Tax Change (2%)
    amount += Math.floor(amount * 0.02)

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD"
    });

    return res.json({ success: true, message: "Order Placed Successfully" })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}


// Place Order Online: api/payment/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;
    const { origin } = req.headers;
    const userId = req.userId;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invaild data" })
    }

    let productData = [];

    // Caculate Amount Using Items
    let amount = await items.reduce(async (acc, item) => {
      const product = await getProductById(item.product)
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      })
      return (await acc) + product.offerPrice * item.quantity;
    }, 0)

    // Add Tax Change (2%)
    amount += Math.floor(amount * 0.02)

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online"
    });

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    //Create line items for stripe
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round((item.price + item.price * 0.02) * 100)
        },
        quantity: item.quantity,
      }
    })

    // Create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      }
    })

    return res.json({ success: true, url: session.url, message: "Order Online Successfully" })
  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}


// Stripe Webhook
export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { orderId, userId } = session.metadata;

      if (!orderId || !userId) {
        console.error("Missing metadata from Stripe session");
        break;
      }

      try {
        await Order.findByIdAndUpdate(orderId, { isPaid: true });
        await axios.put(`${USER_API}/api/users/${userId}/clear-cart`, {}, {
  headers: {
    Authorization: `Bearer ${process.env.USER_SERVICE_SECRET_TOKEN}`
  }
});

      } catch (error) {
        console.error("❌ Error updating order/cart:", error.message);
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const { orderId } = session.metadata || {};

      if (orderId) {
        await Order.findByIdAndDelete(orderId);
        console.log(`🗑️ Order ${orderId} deleted due to expired session.`);
      }
      break;
    }

    default:
      console.log(`⚠️ Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};



// Get Orders by User ID: api/payment/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    }).sort({ createdAt: -1 });

    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const enrichedItems = await Promise.all(order.items.map(async (item) => {
        try {
          const response = await axios.get(`${PRODUCT_API}/api/product/${item.product}`);
          return {
            ...item.toObject(),
            productDetails: response.data.product
          };
        } catch (error) {
          return {
            ...item.toObject(),
            productDetails: null
          };
        }
      }));

      return {
        ...order.toObject(),
        items: enrichedItems
      };
    }));

    res.json({ success: true, orders: enrichedOrders });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};



// Get All Orders (for seller/admin): api/payment/seller 
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }]
    }).populate("items.product address").sort({ createdAt: -1 });

    // Fetch chi tiết sản phẩm từ node khác
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const enrichedItems = await Promise.all(order.items.map(async (item) => {
        try {
          // const response = await axios.get(`http://localhost:3000/api/product/${item.product}`);
          const response = await axios.get(`${PRODUCT_API}/api/product/${item.product}`);
          return {
            ...item.toObject(),
            productDetails: response.data.product
          };
        } catch (error) {
          return {
            ...item.toObject(),
            productDetails: null
          };
        }
      }));

      return {
        ...order.toObject(),
        items: enrichedItems
      };
    }));

    res.json({ success: true, orders: enrichedOrders });

  } catch (error) {
    console.log(error.message)
    res.json({ success: false, message: error.message })
  }
}


export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getRevenueReport = async (req, res) => {
  try {
    const { type } = req.query;
    const validTypes = ['day', 'week', 'month'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid type (day|week|month)' });
    }

    let fromDate = new Date();
    if (type === 'day') fromDate.setDate(fromDate.getDate() - 1);
    else if (type === 'week') fromDate.setDate(fromDate.getDate() - 7);
    else fromDate.setMonth(fromDate.getMonth() - 1);

    const result = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          status: { $ne: 'Cancelled' },
          createdAt: { $gte: fromDate }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const summary = result[0] || { totalOrders: 0, totalRevenue: 0 };

    res.json({
      success: true,
      type,
      totalOrders: summary.totalOrders,
      totalRevenue: summary.totalRevenue
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching revenue' });
  }
};

