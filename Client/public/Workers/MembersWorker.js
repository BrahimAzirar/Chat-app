const GetMembers = async (apiUrl, page) => {
    try {
        const Req_Options = { credentials: 'include' };
        const result = await (await fetch(`${apiUrl}/members/getMembers?page=${page}`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
};

const GetFriendRequests = async (apiUrl) => {
    try {
        const Req_Options = { credentials: 'include' };
        const result = await (await fetch(`${apiUrl}/friendsRequests/seeFriendsRequests`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const SendFriendRequest = async (apiUrl, targetId) => {
    try {
        const Req_Options = { credentials: 'include' };
        const result = await (await fetch(`${apiUrl}/friendsRequests/sendFriendRequest/${targetId}`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const CancelFriendRequest = async (apiUrl, targetId) => {
    try {
        const Req_Options = { credentials: 'include' };
        const result = await (await fetch(`${apiUrl}/friendsRequests/cancelFriendRequest/${targetId}`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const AcceptFriendRequest = async (apiUrl, targetId) => {
    try {
        const Req_Options = { credentials: 'include' };
        const result = await (await fetch(`${apiUrl}/friendsRequests/acceptFriendRequest/${targetId}`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

const SearchMembers = async (apiUrl, target) => {
    try {
        const Req_Options = { credentials: 'include' };
        const result = await (await fetch(`${apiUrl}/members/SearchMembers?search=${target.val}&page=${target.page}`, Req_Options)).json();
        if (result.err) throw new Error(result.err);
        return result.response;
    } catch (error) {
        throw new Error(error.message);
    }
}

self.onmessage = async (e) => {
    try {
        const { message, API_URL, data } = e.data;

        if (message === "GetMembers") {
            const result = await GetMembers(API_URL, data);
            self.postMessage({ message: "Members", result });
        }
        else if (message === "GetFriendRequests") {
            const result = await GetFriendRequests(API_URL);
            self.postMessage({ message: "FriendRequests", result });
        }
        else if (message === "sendFriendRequest") {
            const result = await SendFriendRequest(API_URL, data);
            self.postMessage({ message: "FriendRequestsSended", result });
        }
        else if (message === "cancelFriendRequest") {
            const result = await CancelFriendRequest(API_URL, data);
            self.postMessage({ message: "FriendRequestsCanceled", result });
        }
        else if (message === "acceptFriendRequest") {
            const result = await AcceptFriendRequest(API_URL, data);
            self.postMessage({ message: "FriendRequestsAccepted", result });
        }
        else if (message === "SearchMembers") {
            const result = await SearchMembers(API_URL, data);
            self.postMessage({ message: "TargetMembers", result });
        }
    } catch (error) {
        self.postMessage({ err: error.message });
    }
}