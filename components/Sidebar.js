import React, { useEffect, useState } from 'react';
import { IoChatbubbleEllipses } from "react-icons/io5";
import { FaUserPlus } from "react-icons/fa";
import { NavLink, useNavigate } from 'react-router-dom';
import { BiLogOut } from "react-icons/bi";
import Avatar from './Avatar';
import { useDispatch, useSelector } from 'react-redux';
import EditUserDetails from './EditUserDetails';
import Divider from './Divider'; // This import is not used. Consider removing it if it's not needed.
import { FiArrowUpLeft } from "react-icons/fi";
import SearchUser from './SearchUser';
import { FaImage, FaVideo } from "react-icons/fa6"; // You can combine these imports.
import { logout } from '../redux/userSlice';
import FriendList from './FriendList';
 // Adjust the path if needed


const Sidebar = () => {
    const user = useSelector(state => state?.user);
    const [editUserOpen, setEditUserOpen] = useState(false);
    const [allUser, setAllUser] = useState([]);
    const [openSearchUser, setOpenSearchUser] = useState(false);
    const socketConnection = useSelector(state => state?.user?.socketConnection);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (socketConnection) {
            socketConnection.emit('sidebar', user._id);

            const handleConversation = (data) => {
                const conversationUserData = data.map((conversationUser) => {
                    if (conversationUser?.sender?._id === conversationUser?.receiver?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser?.sender
                        };
                    } else if (conversationUser?.receiver?._id !== user?._id) {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.receiver
                        };
                    } else {
                        return {
                            ...conversationUser,
                            userDetails: conversationUser.sender
                        };
                    }
                });

                setAllUser(conversationUserData);
            };

            socketConnection.on('conversation', handleConversation);

            // Cleanup function to remove the event listener when the component unmounts
            return () => {
                socketConnection.off('conversation', handleConversation);
            };
        }
    }, [socketConnection, user]);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.clear();
        navigate("/email");
    };

    useEffect(() => {
        const toggleButton = document.getElementById('theme-toggle');

        const toggleTheme = () => {
            document.body.classList.toggle('black-theme');
            if (document.body.classList.contains('black-theme')) {
                toggleButton.setAttribute('title', 'Switch to Light Theme');
            } else {
                toggleButton.setAttribute('title', 'Switch to Black Theme');
            }
        };

        toggleButton.addEventListener('click', toggleTheme);

        return () => {
            toggleButton.removeEventListener('click', toggleTheme);
        };
    }, []);

    return (
        <div className='w-full h-full grid grid-cols-[48px,1fr] bg-white'>
            <div className='bg-slate-100 w-12 h-full rounded-tr-lg rounded-br-lg py-5 text-slate-600 flex flex-col justify-between'>
                <div>
                    <NavLink
                        className={({ isActive }) => `w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded ${isActive ? "bg-slate-200" : ""}`}
                        title='chat'
                        to="/chat"
                    >
                        <IoChatbubbleEllipses size={20} />
                    </NavLink>

                    <div
                        title='add friend'
                        onClick={() => setOpenSearchUser(true)}
                        className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'
                    >
                        <FaUserPlus size={20} />
                    </div>

                    {/* Theme toggle button */}
                    <div
                        id="theme-toggle"
                        title='Switch to Black Theme'
                        className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'
                    >
                        <span>🌙</span> {/* Use an icon or text for the toggle button */}
                    </div>
                </div>

                <div className='flex flex-col items-center'>
                    <button className='mx-auto' title={user?.name} onClick={() => setEditUserOpen(true)}>
                        <Avatar
                            width={40}
                            height={40}
                            name={user?.name}
                            imageUrl={user?.profile_pic}
                            userId={user?._id}
                        />
                    </button>
                    <button
                        title='logout'
                        className='w-12 h-12 flex justify-center items-center cursor-pointer hover:bg-slate-200 rounded'
                        onClick={handleLogout}
                    >
                        <BiLogOut size={20} />
                    </button>
                </div>
            </div>

            <div className='w-full'>
                <div className='h-16 flex items-center'>
                    <h2 className='text-xl font-bold p-4 text-slate-800'>Message</h2>
                </div>
                <div className='bg-slate-200 p-[0.5px]'></div>

                <div className='h-[calc(100vh-65px)] overflow-x-hidden overflow-y-auto scrollbar'>
                    {
                        allUser.length === 0 && (
                            <div className='mt-12'>
                                <div className='flex justify-center items-center my-4 text-slate-500'>
                                    <FiArrowUpLeft size={50} />
                                </div>
                                <p className='text-lg text-center text-slate-400'>Explore users to start a conversation with.</p>
                            </div>
                        )
                    }

                    {
                        allUser.map((conv) => (
                            <NavLink
                                to={"/" + conv?.userDetails?._id}
                                key={conv?._id}
                                className='flex items-center gap-2 py-3 px-2 border border-transparent hover:border-primary rounded hover:bg-slate-100 cursor-pointer'
                            >
                                <Avatar
                                    imageUrl={conv?.userDetails?.profile_pic}
                                    name={conv?.userDetails?.name}
                                    width={40}
                                    height={40}
                                />
                                <div>
                                    <h3 className='text-ellipsis line-clamp-1 font-semibold text-base'>{conv?.userDetails?.name}</h3>
                                    <div className='text-slate-500 text-xs flex items-center gap-1'>
                                        <div className='flex items-center gap-1'>
                                            {
                                                conv?.lastMsg?.imageUrl && (
                                                    <div className='flex items-center gap-1'>
                                                        <FaImage />
                                                        {!conv?.lastMsg?.text && <span>Image</span>}
                                                    </div>
                                                )
                                            }
                                            {
                                                conv?.lastMsg?.videoUrl && (
                                                    <div className='flex items-center gap-1'>
                                                        <FaVideo />
                                                        {!conv?.lastMsg?.text && <span>Video</span>}
                                                    </div>
                                                )
                                            }
                                        </div>
                                        <p className='text-ellipsis line-clamp-1'>{conv?.lastMsg?.text}</p>
                                    </div>
                                </div>
                                {
                                    Boolean(conv?.unseenMsg) && (
                                        <p className='text-xs w-6 h-6 flex justify-center items-center ml-auto p-1 bg-primary text-white font-semibold rounded-full'>{conv?.unseenMsg}</p>
                                    )
                                }
                            </NavLink>
                        ))
                    }
                </div>
            </div>

            {/**edit user details */}
            {
                editUserOpen && (
                    <EditUserDetails onClose={() => setEditUserOpen(false)} user={user} />
                )
            }

            {/**search user */}
            {
                openSearchUser && (
                    <SearchUser onClose={() => setOpenSearchUser(false)} />
                )
            }
        </div>
    );
}

export default Sidebar;
