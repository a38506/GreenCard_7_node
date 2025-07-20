import jwt from 'jsonwebtoken'
import User from '../models/User.js';

// Login Seller : api/seller/login

export const sellerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (password == process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' })

            res.cookie('sellerToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 60 * 60 * 1000,
            });

            return res.json({ success: true, message: "Logged In" });
        } else {
            return res.json({ success: false, message: "Invalid Credentials" });
        }
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Seller isAuth : api/seller/is-auth
export const isSellerAuth = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Logout Seller : api/seller/logout
export const sellerLogout = async (req, res) => {
    try {
        res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })
        return res.json({ success: true, message: "Logged Out" })
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Block User: api/seller/block
export const blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBlocked = req.body.isBlocked;
        await user.save();

        res.status(200).json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully` });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
    }
};


// All User: api/seller/all
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({success: true, users});
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};