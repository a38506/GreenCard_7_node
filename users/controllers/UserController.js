import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register User : api/user/register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Please fill all the fields" });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.json({
            success: true, user: {
                email: user.email, name: user.name
            }
        });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Login User : api/user/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: "Please fill all the fields" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: "Your account has been blocked by the administrator. Please contact us for assistance." });
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 60 * 60 * 1000,
        });

        return res.json({
            success: true, user: {
                email: user.email, name: user.name
            }
        });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message });
    }
}

// Check Auth : api/user/is-auth
export const isAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        return res.json({ success: true, user });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};



// Logout User : api/user/logout
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
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

// Clear card : api/user/:id/clear-cart
export const clearUserCart = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndUpdate(userId, { cart: [] });  
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
