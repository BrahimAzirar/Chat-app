const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const GetFriends = async (req, res) => {
    try {
        const { db } = req.app.locals;
        const token = req.cookies.auth;
        const page = req.query.page || 1;
        const { _id } = await jwt.verify(token, process.env.JWT_KEY);
        const Count = 10;
        const Skip = (page - 1) * Count;

        const result = await db.collection("Members").aggregate([
            { $match: { _id: new ObjectId(_id) } },
            { $unwind: "$Friends" },
            {
                $lookup: {
                    from: "Members",
                    localField: "Friends",
                    foreignField: "_id",
                    as: "FriendDetails"
                }
            },
            { $unwind: "$FriendDetails" },
            {
                $project: {
                    _id: "$FriendDetails._id",
                    FirstName: "$FriendDetails.FirstName",
                    LastName: "$FriendDetails.LastName",
                    Photo: "$FriendDetails.Photo"
                }
            }
        ])
            .limit(Count)
            .skip(Skip)
            .toArray();

        res.status(200).json({ response: result });
    } catch (error) {
        console.log(`The error from ChatController in GetFriends(): ${error.message}`);
        res.status(500).json({ err: "An error occurred on the server. Please try again later." });
    }
}

const AddMessage = async (req, res) => {
    try {
        const { db, io } = req.app.locals; // Use io instead of socket
        const { TargetMember, message } = req.body;
        const { _id } = await jwt.verify(req.cookies.auth, process.env.JWT_KEY);

        const data = {
            _id: new ObjectId(),
            TargetMember: new ObjectId(TargetMember),
            message,
            messageDate: new Date()
        };

        // Add the message to the database
        await db.collection("Members").updateOne({ _id: new ObjectId(_id) }, {
            $push: { Chat: data }
        });

        // Emit the message to the target member and current member
        io.emit('receiveMessage', { ...data, senderId: _id });

        res.status(200).json({ response: data });
    } catch (error) {
        console.log(`The error from ChatController in AddMessage(): ${error.message}`);
        res.status(500).json({ err: "An error occurred on the server. Please try again later." });
    }
};

const DeleteMessage = async (req, res) => {
    try {
        const { db, io } = req.app.locals;
        const { messageId } = req.params;
        const { _id } = await jwt.verify(req.cookies.auth, process.env.JWT_KEY);


        await db.collection('Members').updateOne(
            { _id: new ObjectId(_id) },
            { $pull: { Chat: { _id: new ObjectId(messageId) } } }
        );

        io.emit('deleteMessage', { messageId, senderId: _id });

        res.status(200).json({ response: messageId });
    } catch (error) {
        console.log(`The error from ChatController in DeleteMessage(): ${error.message}`);
        res.status(500).json({ err: "An error occurred on the server. Please try again later." });
    }
}

const GetMessages = async (req, res) => {
    try {
        const { db } = req.app.locals;
        const { _id } = await jwt.verify(req.cookies.auth, process.env.JWT_KEY);
        const { TargetMember } = req.params;
        const pageSize = 10;
        const page = req.query.page || 1;        

        const result1 = await db.collection('Members').aggregate([
            {
                $match: { _id: new ObjectId(_id) }
            },
            {
                $project: {
                    Chat: {
                        $filter: {
                            input: "$Chat",
                            as: "chat",
                            cond: { $eq: ["$$chat.TargetMember", new ObjectId(TargetMember)] }
                        }
                    }
                }
            },
            {
                $unwind: "$Chat"
            },
            {
                $sort: { "Chat.messageDate": 1 }
            },
            {
                $skip: (page - 1) * pageSize
            },
            {
                $limit: pageSize
            },
            {
                $project: {
                    _id: "$Chat._id",
                    message: "$Chat.message",
                    messageDate: "$Chat.messageDate"
                }
            }
        ]).toArray();

        const result2 = await db.collection('Members').aggregate([
            {
                $match: { _id: new ObjectId(TargetMember) }
            },
            {
                $project: {
                    Chat: {
                        $filter: {
                            input: "$Chat",
                            as: "chat",
                            cond: { $eq: ["$$chat.TargetMember", new ObjectId(_id)] }
                        }
                    }
                }
            },
            {
                $unwind: "$Chat"
            },
            {
                $sort: { "Chat.messageDate": 1 }
            },
            {
                $skip: (page - 1) * pageSize
            },
            {
                $limit: pageSize
            },
            {
                $addFields: {
                    targetMember: true
                }
            },
            {
                $project: {
                    _id: "$Chat._id",
                    message: "$Chat.message",
                    messageDate: "$Chat.messageDate",
                    targetMember: 1
                }
            }
        ]).toArray();

        const result = [...result1, ...result2]; 
        
        result.sort((a, b) => new Date(a.messageDate) - new Date(b.messageDate));

        res.status(200).json({ response: result });
    } catch (error) {
        console.log(`The error from ChatController in GetMessages(): ${error.message}`);
        res.status(500).json({ err: "An error occurred on the server. Please try again later." });
    }
}

module.exports = { GetFriends, GetMessages, AddMessage, DeleteMessage };