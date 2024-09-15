const GetFriends = async (API_URL, data = 1) => {
    try {
        const Req_Options = { credentials: 'include' };
        const result = await (await fetch(`${API_URL}/chat/getFriends?page=${data}`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const BlockFriend = async (API_URL, data) => {
    try {
        const Req_Options = { credentials: 'include' };
        const result = await (await fetch(`${API_URL}/block/blockFriend/${data}`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const DeleteMessage = async (API_URL, data) => {
    try {
        const Req_Options = { method: "DELETE", credentials: 'include' };
        const result = await (await fetch(`${API_URL}/chat/deleteMessage/${data.MessageId}`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const GetMessages = async (API_URL, data) => {
    try {
        const Req_Options = { credentials: 'include' };
        const result = await (await fetch(`${API_URL}/chat/getMessages/${data.TargetMember}`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const AddMessage = async (API_URL, data) => {
    try {
        const Req_Options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: 'include'
        };
        const result = await (await fetch(`${API_URL}/chat/addMessage`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

self.onmessage = async e => {
    try {
        const { message, API_URL, data } = e.data;

        if (message === "GetFriends") {
            const result = await GetFriends(API_URL, data);
            self.postMessage({ message: "Friends", result });
        }
        else if (message === "BlockFriend") {
            const result = await BlockFriend(API_URL, data);
            self.postMessage({ message: "Blocked", result });
        }
        else if (message === "getMessages") {
            const result = await GetMessages(API_URL, data);
            self.postMessage({ message: "Messages", result });
        }
        else if (message === "deleteMessage") {
            const result = await DeleteMessage(API_URL, data);
            self.postMessage({ message: "Deleted", result });
        }
        else if (message === "addMessage") {
            const result = await AddMessage(API_URL, data);
            self.postMessage({ message: "Added", result });
        }
    } catch (error) {
        self.postMessage({ err: error.message });
    }
}