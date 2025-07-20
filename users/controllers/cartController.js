
import User from '../models/User.js';

// Update User CartData: api/cart/update
export const updateCart = async (req, res) => {
    try {
        const { cartItems } = req.body
        const userId = req.userId
        await User.findByIdAndUpdate(userId, { cartItems })
        res.json({ success: true, message: "Cart Updates" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, cartItems: user.cartItems || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
