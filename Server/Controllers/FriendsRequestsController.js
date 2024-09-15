const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const SendFriendRequest = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const TargetMember = req.params.TargetMember;
    const MemberId = await jwt.verify(req.cookies.auth, process.env.JWT_KEY)._id;

    const targetMember = new ObjectId(TargetMember);
    const memberId = new ObjectId(MemberId);

    await db.collection("Members").updateOne(
      { _id: targetMember },
      { $push: { FriendsRequests: memberId } }
    );

    res.status(200).json({ response: TargetMember });
  } catch (error) {
    console.log(
      `The error from FriendsRequestsController in SendFriendRequest(): ${error.message}`
    );
    res.json({
      err: "An error occurred on the server. Please try again later.",
    });
  }
};

const SeeFriendsRequests = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const MemberId = new ObjectId((await jwt.verify(req.cookies.auth, process.env.JWT_KEY))._id);

    const friendsRequests = await db.collection("Members").aggregate([
      {
        $match: { _id: MemberId }
      },
      {
        $lookup: {
          from: 'Members',
          localField: 'FriendsRequests',
          foreignField: '_id',
          as: 'friendRequestsInfo'
        }
      },
      {
        $project: {
          _id: 0,
          friendRequestsInfo: {
            _id: 1,
            FirstName: 1,
            LastName: 1,
            Photo: 1
          }
        }
      },
      {
        $unwind: '$friendRequestsInfo'
      },
      {
        $replaceRoot: { newRoot: '$friendRequestsInfo' }
      }
    ]).toArray();

    res.status(200).json({ response: friendsRequests });
  } catch (error) {
    console.log(`The error from FriendsRequestsController in SeeFriendsRequests(): ${error.message}`);
    res.status(500).json({ err: "An error occurred on the server. Please try again later." });
  }
};

const AcceptFriendRequest = async (req, res) => {
  const { db, client } = req.app.locals;
  try {
    const TargetMember = new ObjectId(req.params.TargetMember);
    const MemberId = new ObjectId((await jwt.verify(req.cookies.auth, process.env.JWT_KEY))._id);

    const session = client.startSession();
    session.startTransaction();

    await db.collection("Members").updateOne({ _id: MemberId }, { $push: { Friends: TargetMember } });
    await db.collection("Members").updateOne({ _id: TargetMember }, { $push: { Friends: MemberId } });
    await db.collection("Members").updateOne({ _id: MemberId }, { $pull: { FriendsRequests: TargetMember } });

    await session.commitTransaction();
    res.status(200).json({ response: TargetMember });
  } catch (error) {
    await session.abortTransaction();
    console.log(`The error from FriendsRequestsController in AcceptFriendRequest(): ${error.message}`);
    res.status(500).json({ err: "An error occurred on the server. Please try again later." });
  }
};

const CancelFriendRequest = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const TargetMember = new ObjectId(req.params.TargetMember);
    const MemberId = new ObjectId((await jwt.verify(req.cookies.auth, process.env.JWT_KEY))._id);

    await db.collection("Members").updateOne({ _id: MemberId }, { $pull: { FriendsRequests: TargetMember } });

    res.status(200).json({ response: TargetMember });
  } catch (error) {
    console.log(`The error from FriendsRequestsController in CancelFriendRequest(): ${error.message}`);
    res.status(500).json({ err: "An error occurred on the server. Please try again later." });
  }
}

module.exports = { SendFriendRequest, SeeFriendsRequests, AcceptFriendRequest, CancelFriendRequest };
