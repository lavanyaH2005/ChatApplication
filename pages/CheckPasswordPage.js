import React, { useEffect, useState } from 'react';
import { IoClose } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';

const CheckPasswordPage = () => {
    const [data, setData] = useState({ password: "", userId: "" });
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!location?.state?.name) {
            navigate('/email');
        } else {
            setData(prev => ({ ...prev, userId: location.state._id }));
        }
    }, [location, navigate]);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/password`;

        try {
            const response = await axios.post(URL, {
                userId: data.userId,
                password: data.password
            }, { withCredentials: true });

            toast.success(response.data.message);

            if (response.data.success) {
                dispatch(setToken(response.data.token));
                localStorage.setItem('token', response.data.token);

                setData({ password: "" });
                navigate('/');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className='mt-5'>
            <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto shadow-lg'>
                <div className='w-fit mx-auto mb-4 flex flex-col items-center'>
                    <Avatar
                        width={70}
                        height={70}
                        name={location?.state?.name}
                        imageUrl={location?.state?.profile_pic}
                    />
                    <h2 className='font-semibold text-lg mt-2'>{location?.state?.name}</h2>
                </div>

                <form className='grid gap-4 mt-3' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='password' className='font-semibold'>Password:</label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            placeholder='Enter your password'
                            className='bg-slate-100 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary'
                            value={data.password}
                            onChange={handleOnChange}
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='bg-primary text-lg px-4 py-2 hover:bg-secondary rounded font-bold text-white leading-relaxed tracking-wide'
                    >
                        Login
                    </button>
                </form>

                <p className='my-3 text-center'>
                    <Link to="/forgot-password" className='text-primary font-semibold hover:underline'>Forgot password?</Link>
                </p>
            </div>
        </div>
    );
};

export default CheckPasswordPage;
