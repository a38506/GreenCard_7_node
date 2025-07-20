import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_ORDER_URL || '';
const PRODUCT_API = import.meta.env.VITE_PRODUCT_URL || '';
const USER_API = import.meta.env.VITE_USER_URL || '';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);

    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState([]);

    const [customers, setCustomers] = useState([]);

    // Fetch Seller Status
    const fetchSeller = async () => {
        try {
            const { data } = await axios.get(`${USER_API}/api/seller/is-auth`)
            if (data.success) {
                setIsSeller(true)
            } else {
                setIsSeller(false)
            }
        } catch (error) {
            setIsSeller(false)
        }
    }

    // Fetch User Auth Status, User Data and Cart Items
    const fetchUser = async () => {
        try {
            const { data } = await axios.get(`${USER_API}/api/seller/is-auth`)
            if (data.success) {
                setUser(data.user)
                setCartItems(data.user.cartItems)
            }
        } catch (error) {
            setUser(null)
        }
    }

    // Fetch all products
    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${PRODUCT_API}/api/product/list`)
            if (data.success) {
                setProducts(data.products)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Add product to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            cartData[itemId] += 1;
        }
        else {
            cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Added to cart")
    }

    // Update cart items quantity
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData);
        toast.success("Cart updated successfully")
    }

    // Remove item from cart
    const removeFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if (cartData[itemId]) {
            cartData[itemId] -= 1;
            if (cartData[itemId] === 0) {
                delete cartData[itemId];
            }
        }
        toast.success("Product removed from cart")
        setCartItems(cartData);
    }

    // Get cart items count
    const getCartCount = () => {
        let totalCount = 0;
        for (const item in cartItems) {
            totalCount += cartItems[item];
        }
        return totalCount;
    }

    // Get cart items amount
    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            if (cartItems[items] > 0) {
                totalAmount += itemInfo.offerPrice * cartItems[items];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }

    const fetchCustomers = async () => {
        try {
            const { data } = await axios.get(`${USER_API}/api/seller/all`);
            if (data.success) {
                setCustomers(data.users);  
            }
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchProducts();
        fetchSeller();
        fetchCustomers();
    }, []);

    // Update db cart items
    useEffect(() => {
        const updateCart = async () => {
            try {
                const { data } = await axios.post('api/cart/update', { cartItems })
                if (!data.success) {
                    toast.error(data.message)
                }
            } catch (error) {
                toast.error(data.message)
            }
        }
        if (user) {
            updateCart()
        }
    }, [cartItems])


    const value = {
        // Điều hướng & người dùng
        navigate, user, setUser, isSeller, setIsSeller, showUserLogin, setShowUserLogin,

        // Sản phẩm & tìm kiếm
        products, fetchProducts, searchQuery, setSearchQuery,

        // Giỏ hàng
        cartItems, addToCart, removeFromCart, updateCartItem, setCartItems, getCartCount, getCartAmount,

        // Tiền tệ
        currency,

        // Khách hàng
        customers, fetchCustomers,

        // Axios
        axios
    };

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = () => {
    return useContext(AppContext);
}

