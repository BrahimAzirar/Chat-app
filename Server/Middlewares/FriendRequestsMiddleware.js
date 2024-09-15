const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

const FriendRequestIsExist = async (req, res, next) => {
    try {
        const { db } = req.app.locals;
        const TargetMember = req.params.TargetMember;
        const MemberId = await jwt.verify(req.cookies.auth, process.env.JWT_KEY)._id;

        const targetMember = new ObjectId(TargetMember);
        const memberId = new ObjectId(MemberId);

        const result = await db.collection("Members").countDocuments({
            $and: [{ _id: targetMember }, { FriendsRequests: { $in: [memberId] } }]
        }, { projection: { _id: 1 } });

        if (result) 
            return res.status(200).json({ err: "You are already sent friend requests to this member" });

        next();
    } catch (error) {
        console.log(
            `The error from FriendRequestsMiddleware in FriendRequestIsExist(): ${error.message}`
        );
        res.json({
            err: "An error occurred on the server. Please try again later.",
        });
    }
};

module.exports = { FriendRequestIsExist };