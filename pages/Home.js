import axios from 'axios';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { logout, setOnlineUser, setSocketConnection, setUser } from '../redux/userSlice';
import Sidebar from '../components/Sidebar';
import logo from '../assets/logo.png';
import io from 'socket.io-client';

const Home = () => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const fetchUserDetails = async () => {
        try {
            const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
            const response = await axios({
                url: URL,
                withCredentials: true
            });

            dispatch(setUser(response.data.data));

            if (response.data.data.logout) {
                dispatch(logout());
                navigate("/email");
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            // Optionally, handle the error more gracefully (e.g., show a notification)
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [dispatch, navigate]);

    useEffect(() => {
        const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
            auth: {
                token: localStorage.getItem('token')
            },
        });

        socketConnection.on('onlineUser', (data) => {
            dispatch(setOnlineUser(data));
        });

        dispatch(setSocketConnection(socketConnection));

        return () => {
            socketConnection.disconnect();
        };
    }, [dispatch]);

    const basePath = location.pathname === '/';

    return (
        <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
            <section className={`bg-white lg:block ${basePath ? '' : 'hidden'}`}>
                <Sidebar />
            </section>

            <section className={`overflow-auto ${basePath ? 'hidden' : ''}`}>
                <Outlet />
            </section>

            <div className={`flex flex-col items-center justify-center gap-2 ${basePath ? 'lg:flex' : 'hidden'}`}>
                <img src={logo} width={250} alt='logo' />
                <p className='text-lg mt-2 text-slate-500'>Select a user to send a message</p>
            </div>
        </div>
    );
};

export default Home;
