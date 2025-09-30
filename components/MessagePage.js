import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Avatar from './Avatar';
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft, FaPlus, FaImage, FaVideo } from "react-icons/fa";
import uploadFile from '../helpers/uploadFile';
import { IoClose } from "react-icons/io5";
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg';
import { IoMdSend } from "react-icons/io";
import moment from 'moment';

const MessagePage = () => {
  const params = useParams();
  const socketConnection = useSelector(state => state?.user?.socketConnection);
  const user = useSelector(state => state?.user);
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [allMessage, setAllMessage] = useState([]);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState(null);
  const currentMessage = useRef(null);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [allMessage]);

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(prev => !prev);
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const uploadPhoto = await uploadFile(file);
        setMessage(prev => ({
          ...prev,
          imageUrl: uploadPhoto.url
        }));
      } catch (error) {
        console.error("Failed to upload image:", error);
      } finally {
        setLoading(false);
        setOpenImageVideoUpload(false);
      }
    }
  };

  const handleClearUploadImage = () => {
    setMessage(prev => ({
      ...prev,
      imageUrl: ""
    }));
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const uploadPhoto = await uploadFile(file);
        setMessage(prev => ({
          ...prev,
          videoUrl: uploadPhoto.url
        }));
      } catch (error) {
        console.error("Failed to upload video:", error);
      } finally {
        setLoading(false);
        setOpenImageVideoUpload(false);
      }
    }
  };

  const handleClearUploadVideo = () => {
    setMessage(prev => ({
      ...prev,
      videoUrl: ""
    }));
  };

  useEffect(() => {
    if (socketConnection) {
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId);

      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });

      socketConnection.on('message', (data) => {
        setAllMessage(data);
      });
    }
  }, [socketConnection, params.userId]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage(prev => ({
      ...prev,
      text: value
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id
        });
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: ""
        });
      }
    }
  };

  const handleDeleteMessage = (msgId) => {
    if (socketConnection) {
      socketConnection.emit('delete message', msgId);
      setAllMessage(prevMessages => prevMessages.filter(msg => msg._id !== msgId));
    }
  };

  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='bg-no-repeat bg-cover'>
      <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
        <div className='flex items-center gap-4'>
          <Link to={"/"} className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
            <p className='-my-2 text-sm'>
              {
                dataUser.online ? <span className='text-primary'>online</span> : <span className='text-slate-400'>offline</span>
              }
            </p>
          </div>
        </div>
        <div>
          <button className='cursor-pointer hover:text-primary'>
            <HiDotsVertical />
          </button>
        </div>
      </header>

      <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50'>
        <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
          {allMessage.map((msg, index) => (
            <div
              key={index}
              className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === msg?.msgByUserId ? "ml-auto bg-teal-100" : "bg-white"}`}
              onMouseEnter={() => setHoveredMessageIndex(index)}
              onMouseLeave={() => setHoveredMessageIndex(null)}
            >
              <div className='relative'>
                {msg?.imageUrl && (
                  <img
                    src={msg?.imageUrl}
                    alt='message'
                    className='w-full h-full object-scale-down'
                  />
                )}
                {msg?.videoUrl && (
                  <video
                    src={msg.videoUrl}
                    className='w-full h-full object-scale-down'
                    controls
                  />
                )}
                {user._id === msg?.msgByUserId && hoveredMessageIndex === index && (
                  <button
                  onClick={() => handleDeleteMessage(msg._id)}
                  className='absolute top-1 right-1 bg-black text-white rounded-full p-1'
                >
                  X
                </button>
                
                )}
              </div>
              <p className='px-2'>{msg.text}</p>
              <p className='text-xs ml-auto w-fit'>{moment(msg.createdAt).format('hh:mm')}</p>
            </div>
          ))}
        </div>

        {/**upload Image display */}
        {message.imageUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadImage}>
              <IoClose size={30} />
            </div>
            <div className='bg-white p-3'>
              <img
                src={message.imageUrl}
                alt='Uploaded'
                className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
              />
            </div>
          </div>
        )}

        {/**upload video display */}
        {message.videoUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-black-600' onClick={handleClearUploadVideo}>
              <IoClose size={30} />
            </div>
            <div className='bg-white p-3'>
              <video
                src={message.videoUrl}
                className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                controls
                muted
                autoPlay
              />
            </div>
          </div>
        )}

        {loading && (
          <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
            <Loading />
          </div>
        )}
      </section>

      {/**send message */}
      <section className='h-16 bg-white flex items-center px-4'>
        <div className='relative '>
          <button onClick={handleUploadImageVideoOpen} className='flex justify-center items-center w-11 h-11 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white'>
            <FaPlus size={20} />
          </button>
          {openImageVideoUpload && (
            <div className='absolute z-20 w-40 right-0 bg-white border border-primary rounded-md shadow-lg'>
              <div className='flex flex-col'>
                <label className='flex justify-between items-center cursor-pointer hover:bg-slate-200'>
                  <span className='p-2'>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleUploadImage} className='hidden' />
                </label>
                <label className='flex justify-between items-center cursor-pointer hover:bg-slate-200'>
                  <span className='p-2'>Upload Video</span>
                  <input type="file" accept="video/*" onChange={handleUploadVideo} className='hidden' />
                </label>
              </div>
            </div>
          )}
        </div>
        <form className='flex items-center gap-2 w-full ml-2' onSubmit={handleSendMessage}>
          <input
            type='text'
            name='message'
            value={message.text}
            onChange={handleOnChange}
            className='border border-primary rounded-full p-2 w-full'
            placeholder='Type a message...'
          />
          <button type='submit' className='bg-primary text-white rounded-full p-2'>
            <IoMdSend size={25} />
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessagePage;
