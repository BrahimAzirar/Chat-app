import { useEffect, useState } from "react";

export default function SearchMembers() {
  const API_URL = import.meta.env.VITE_API_URL;
  const worker = new Worker("/Workers/MembersWorker.js");

  const [MemberPage, setMemberPage] = useState(1);
  const [SearchPage, setSearchPage] = useState(1);
  const [TargetMembers, setTargetMembers] = useState('');
  const [Members, setMembers] = useState([]);
  const [FriendRequests, setFriendRequests] = useState([]);
  const [SearchedMembers, setSearchedMembers] = useState([]);

  const BtnStyle = {
    outline: "none",
    color: "white",
    fontWeight: "bold"
  }

  useEffect(() => {
    document.title = "Members Page";
    worker.postMessage({ message: "GetFriendRequests", API_URL });
  }, []);

  useEffect(() => {
    worker.postMessage({ message: "GetMembers", API_URL, data: MemberPage });
  }, [MemberPage]);

  useEffect(() => {
    if (SearchPage > 1) {
      worker.postMessage({
        message: "SearchMembers",
        API_URL,
        data: { val: TargetMembers, page: SearchPage }
      });
    }
  }, [SearchPage]);

  const handleScroll = (e) => {
    const target = e.target;
    const userAgent = navigator.userAgent;
    const scrollHeight = userAgent.indexOf("Edg") ? target.scrollHeight - 1 : target.scrollHeight;
    const scrollTop = target.scrollTop;
    const clientHeight = target.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight) {
      if (SearchedMembers.length) setSearchPage(prev => prev + 1);
      else setMemberPage(prev => prev + 1);
    };
  };

  worker.onmessage = (e) => {
    try {
      const { message = null, result = null, err = null } = e.data;
      if (err) throw new Error(err);
      if (message === "Members") setMembers(prev => [...prev, ...result]);
      else if (message === "FriendRequests") setFriendRequests(result);
      else if (message === "FriendRequestsSended")
        setMembers(prev => prev.map(ele => {
          if (ele._id === result) ele.SentFriendRequest = true;
          return ele;
        }));
      else if (message === "FriendRequestsCanceled" || message === "FriendRequestsAccepted")
        setFriendRequests(prev => prev.filter(ele => ele._id !== result));
      else if (message === "TargetMembers") setSearchedMembers(prev => [...prev, ...result]);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      <div>
        <img src="/magnifying-glass-solid 1.svg" />
        <input
          type="text"
          placeholder="Search member"
          value={TargetMembers}
          onChange={e => {
            setTargetMembers(e.target.value);
            if (!e.target.value) setSearchedMembers([]);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              setSearchedMembers([]);
              worker.postMessage({
                message: "SearchMembers",
                API_URL,
                data: { val: TargetMembers, page: SearchPage }
              });
            }
          }} />
      </div>
      <div id="Members9832X" className="m-auto mt-3" onScroll={handleScroll}>
        {
          SearchedMembers.length ?
            <div className="pb-3" style={{ position: "relative" }}>
              <div> <p className="Members-Label M_Content">Results</p> </div>
              <div>
                {
                  SearchedMembers.map(ele => {
                    return (
                      <div key={ele._id} className="MembersCards py-3 px-4 my-2">
                        <div className="d-flex align-items-center">
                          <div> <img src={ele.Photo ? ele.Photo : '/download 1.png'} alt="" /> </div>
                          <p className="m-0">{ele.FirstName} {ele.LastName}</p>
                        </div>
                        {
                          ele.SentFriendRequest || ele.Friends ?
                            <button
                              className="btn"
                              style={{
                                ...BtnStyle,
                                background: "rgba(199, 189, 202, 1)",
                                pointerEvents: "none",
                                padding: "5px",
                                fontSize: ".8rem"
                              }}>
                              {ele.Friends ? "Friends" : "Sent friend request"}
                            </button> :
                            <button
                              className="btn btn-sm"
                              style={{ ...BtnStyle, background: "rgba(201, 94, 238, 1)" }}
                              onClick={() => {
                                worker.postMessage({ message: "sendFriendRequest", API_URL, data: ele._id });
                              }}
                            >
                              Add a friend
                            </button>
                        }
                      </div>
                    );
                  })
                }
              </div>
            </div> :
            <>
              {
                FriendRequests.length ?
                  <div className="pb-3 mb-3" style={{ position: "relative" }}>
                    <div>
                      <p className="Members-Label FR_Content" style={{ color: "rgba(201, 94, 238, 0.8)" }}>Friend Requests</p>
                    </div>
                    <div>
                      {
                        FriendRequests.map(ele => {
                          return (
                            <div key={ele._id} style={{ cursor: "auto" }} className="MembersCards py-3 px-4 my-2">
                              <div className="d-flex align-items-center">
                                <div> <img src={ele.Photo ? ele.Photo : '/download 1.png'} alt="" /> </div>
                                <p className="m-0">{ele.FirstName} {ele.LastName}</p>
                              </div>
                              <div>
                                <button
                                  className="btn btn-sm me-2"
                                  style={{ ...BtnStyle, background: "rgba(199, 189, 202, 1)" }}
                                  onClick={() => {
                                    worker.postMessage({ message: "cancelFriendRequest", API_URL, data: ele._id });
                                  }}>
                                  Cancel
                                </button>
                                <button
                                  className="btn btn-sm"
                                  style={{ ...BtnStyle, background: "rgba(201, 94, 238, 1)" }}
                                  onClick={() => {
                                    worker.postMessage({ message: "acceptFriendRequest", API_URL, data: ele._id });
                                  }}>
                                  Accept
                                </button>
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div> : null
              }
              {
                Members.length ?
                  <div className="pb-3" style={{ position: "relative" }}>
                    <div> <p className="Members-Label M_Content">Members</p> </div>
                    <div>
                      {
                        Members.map(ele => {
                          return (
                            <div key={ele._id} style={{ cursor: "auto" }} className="MembersCards py-3 px-4 my-2">
                              <div className="d-flex align-items-center">
                                <div> <img src={ele.Photo ? ele.Photo : '/download 1.png'} alt="" /> </div>
                                <p className="m-0">{ele.FirstName} {ele.LastName}</p>
                              </div>
                              {
                                ele.SentFriendRequest || ele.Friends ?
                                  <button
                                    className="btn"
                                    style={{
                                      ...BtnStyle,
                                      background: "rgba(199, 189, 202, 1)",
                                      pointerEvents: "none",
                                      padding: "5px",
                                      fontSize: ".8rem"
                                    }}>
                                    {ele.Friends ? "Friends" : "Sent friend request"}
                                  </button> :
                                  <button
                                    className="btn btn-sm"
                                    style={{ ...BtnStyle, background: "rgba(201, 94, 238, 1)" }}
                                    onClick={() => {
                                      worker.postMessage({ message: "sendFriendRequest", API_URL, data: ele._id });
                                    }}
                                  >
                                    Add a friend
                                  </button>
                              }
                            </div>
                          );
                        })
                      }
                    </div>
                  </div> : null
              }
            </>
        }
      </div>
    </>
  )
}
