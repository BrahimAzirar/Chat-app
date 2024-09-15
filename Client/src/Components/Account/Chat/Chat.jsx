import React, { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';
import { IoSend } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true // Ensure credentials (cookies) are sent
});

export default function Chat() {
  const [Messages, setMessages] = useState([]);
  const messageRef = useRef();
  const { TargetMember } = useParams();
  const worker = new Worker("/Workers/ChatWorker.js");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    worker.postMessage({ message: "getMessages", API_URL, data: { TargetMember } });

    // Listen for incoming messages
    socket.on('receiveMessage', (newMessage) => {  
      if (TargetMember === newMessage.senderId) {
        newMessage.targetMember = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    socket.on('deleteMessage', (message) => {
      if (TargetMember === message.senderId) {
        setMessages(msg => msg.filter(ele => ele._id !== message.messageId));
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const handleDeleteBtn = async (MessageId) => {
    worker.postMessage({ message: "deleteMessage", API_URL, data: { MessageId } });
  }

  const handleAddMessageBtn = async (e, message) => {
    e.preventDefault();
    worker.postMessage({ message: "addMessage", API_URL, data: { TargetMember, message } });
  }

  worker.onmessage = async e => {
    try {
      const { message = null, result = null, err = null } = e.data;

      if (err) throw new Error(err);
      else if (message === "Messages") setMessages(result);
      else if (message === "Deleted") {
        setMessages(prev => prev.filter(ele => {
          return ele._id !== result;
        }));
      }
      else if (message === "Added") {
        setMessages(prev => [...prev, result]);
        messageRef.current.value = "";
      }
    } catch (error) {
      alert(error.message);
    }
  }

  return (
    <div id="ChatContent">
      <div id="messages">
        {
          Messages.map(ele => {
            if (ele.targetMember) {
              return (
                <div key={ele._id} className="d-flex align-items-center mb-2">
                  <p className="m-0" style={{ background: "rgb(189 172 195)" }}>{ele.message}</p>
                </div>
              );
            }

            return (
              <div key={ele._id} className="d-flex justify-content-end align-items-center mb-2">
                <MdDelete onClick={() => handleDeleteBtn(ele._id)} />
                <p className="m-0">{ele.message}</p>
              </div>
            );
          })
        }
      </div>
      <div className="d-flex justify-content-between">
        <textarea ref={messageRef} placeholder="Type your message" className="form-control"></textarea>
        <button
          className="d-flex align-items-center justify-content-evenly btn"
          onClick={(e) => handleAddMessageBtn(e, messageRef.current.value)}
        >
          <p className="m-0">Send</p>
          <IoSend />
        </button>
      </div>
    </div>
  );
}