import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PiUserCircle } from "react-icons/pi";

const CheckEmailPage = () => {
    const [data, setData] = useState({ email: "" });
    const navigate = useNavigate();

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/email`;

        try {
            const response = await axios.post(URL, data);
            toast.success(response.data.message);

            if (response.data.success) {
                setData({ email: "" });
                navigate('/password', { state: response?.data?.data });
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className='mt-5'>
            <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto shadow-lg'>
                <div className='w-fit mx-auto mb-4'>
                    <PiUserCircle size={80} />
                </div>

                <h3 className='text-center text-2xl font-bold mb-4'>Welcome to Chat App!</h3>

                <form className='grid gap-4 mt-3' onSubmit={handleSubmit}>
                    <div className='flex flex-col gap-1'>
                        <label htmlFor='email' className='font-semibold'>Email:</label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            placeholder='Enter your email'
                            className='bg-slate-100 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary'
                            value={data.email}
                            onChange={handleOnChange}
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='bg-primary text-lg px-4 py-2 hover:bg-secondary rounded font-bold text-white leading-relaxed tracking-wide'
                    >
                        Let's Go
                    </button>
                </form>

                <p className='my-3 text-center'>
                    New User? <Link to="/register" className='text-primary font-semibold hover:underline'>Register</Link>
                </p>
            </div>
        </div>
    );
};

export default CheckEmailPage;
