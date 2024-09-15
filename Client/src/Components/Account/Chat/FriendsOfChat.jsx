import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FriendsOfChat() {
    const [Friends, setFriends] = useState([]);
    const worker = new Worker("/Workers/ChatWorker.js");
    const API_URL = import.meta.env.VITE_API_URL;
    const redirect = useNavigate();
    const BtnStyle = {
        outline: "none",
        color: "white",
        fontWeight: "bold"
    };

    useEffect(() => {
        worker.postMessage({ message: "GetFriends", API_URL });
    }, []);

    const handleBtnClick = (_id) => {
        worker.postMessage({ message: "BlockFriend", API_URL, data: _id });
    };

    worker.onmessage = async e => {
        try {
            const { message = null, result = null, err = null } = e.data;

            if (err) throw new Error(err);
            else if (message === "Friends") setFriends(result);
            else if (message === "Blocked") {
                setFriends(prev => prev.filter(ele => ele._id !== result));
            }
        } catch (error) {
            alert(error.message);
        }
    }

    return (
        <>
            <div>
                <img src="/magnifying-glass-solid 1.svg" />
                <input type="text" placeholder="Search member" />
            </div>
            <div id="Members9832X" className="m-auto mt-3">
                {
                    Friends.length ?
                        <div className="pb-3 mb-3" style={{ position: "relative" }}>
                            <div>
                                <div> <p className="Members-Label M_Content">Friends</p> </div>
                            </div>
                            <div>
                                {
                                    Friends.map(ele => {
                                        return (
                                            <div key={ele._id} className="MembersCards py-3 px-4 my-2" onClick={() => redirect(`/Account/chat/${ele._id}`)}>
                                                <div className="d-flex align-items-center">
                                                    <div> <img src={ele.Photo ? ele.Photo : '/download 1.png'} alt="" /> </div>
                                                    <p className="m-0">{ele.FirstName} {ele.LastName}</p>
                                                </div>
                                                <button
                                                    className="btn"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleBtnClick(ele._id);
                                                    }}
                                                    style={{
                                                        ...BtnStyle,
                                                        background: "rgba(199, 189, 202, 1)",
                                                    }}>
                                                    Block
                                                </button>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div> : null
                }
            </div>
        </>
    );
}