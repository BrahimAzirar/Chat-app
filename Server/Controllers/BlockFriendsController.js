const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const BlockFriend = async (req, res) => {
    const { client } = req.app.locals;
    const session = client.startSession();

    try {
        const { db } = req.app.locals;
        const TargetId = req.params.TargetId;
        const token = req.cookies.auth;
        const { _id } = await jwt.verify(token, process.env.JWT_KEY);

        session.startTransaction();

        await db.collection("Members").updateOne({ _id: new ObjectId(_id) }, {
            $push: { BlockedFriends: new ObjectId(TargetId) },
            $pull: { Friends: new ObjectId(TargetId) }
        });

        await db.collection("Members").updateOne({ _id: new ObjectId(TargetId) }, {
            $pull: { Friends: new ObjectId(_id) }
        });

        await session.commitTransaction();

        res.status(200).json({ response: TargetId });
    } catch (error) {
        await session.abortTransaction();
        console.log(`The error from BlockFriendsController in BlockFriend(): ${error.message}`);
        res.status(500).json({ err: "An error occurred on the server. Please try again later." });
    }
}

const CancelBlockFriends = async (req, res) => {
    try {
        const { db } = req.app.locals;
        const TargetId = req.params.TargetId;
        const token = req.cookies.auth;
        const { _id } = await jwt.verify(token, process.env.JWT_KEY);

        await db.collection("Members").updateOne({ _id: new ObjectId(_id) }, {
            $pull: { BlockedFriends: new ObjectId(TargetId) }
        });

        res.status(200).json({ response: true });
    } catch (error) {
        console.log(`The error from BlockFriendsController in CancelBlockFriends(): ${error.message}`);
        res.status(500).json({ err: "An error occurred on the server. Please try again later." });
    }
}

module.exports = { BlockFriend, CancelBlockFriends };