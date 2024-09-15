const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const getMembers = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { auth } = req.cookies;
    const membersPerPage = 10;
    const pageNumber = parseInt(req.query.page) || 1;
    const memberSkip = (pageNumber - 1) * membersPerPage;
    const { _id } = await jwt.verify(auth, process.env.JWT_KEY);

    const members = await db.collection('Members').aggregate([
      { $match: { _id: new ObjectId(_id) } },
      { $project: { FriendsRequests: 1, Friends: 1, BlockedFriends: 1 } },
      {
        $lookup: {
          from: 'Members',
          let: { friendsRequests: '$FriendsRequests', friends: '$Friends', blockedFriends: '$BlockedFriends' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$_id', new ObjectId(_id)] },
                    { $not: [{ $in: ['$_id', '$$friendsRequests'] }] },
                    { $not: [{ $in: ['$_id', '$$blockedFriends'] }] }  // Exclude blocked members
                  ]
                }
              }
            },
            { $skip: memberSkip },
            { $limit: membersPerPage },
            { $project: { FirstName: 1, LastName: 1, Photo: 1, FriendsRequests: 1, Friends: 1 } }
          ],
          as: 'members'
        }
      },
      { $unwind: '$members' },
      { $replaceRoot: { newRoot: '$members' } },
      {
        $addFields: {
          SentFriendRequest: {
            $in: [new ObjectId(_id), '$FriendsRequests']
          },
          Friends: {
            $in: [new ObjectId(_id), '$Friends']
          }
        }
      },
      { $project: { FriendsRequests: 0 } }
    ]).toArray();

    res.status(200).json({ response: members });
  } catch (error) {
    console.log(`The error from MembersController in getMembers(): ${error.message}`);
    res.json({ err: "An error occurred on the server. Please try again later." });
  }
};


/* 
  Perform a front-end level search (front-end data search)
  When any data is found, you should check if there
  is some remaining data in the database.
*/
const SearchMembers = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const { search, page = 1 } = req.query;
    const { auth } = req.cookies;
    const limit = 10;
    const skip = (page - 1) * limit;

    const { _id, FirstName, LastName } = await jwt.verify(auth, process.env.JWT_KEY);

    const currentUser = await db.collection('Members').findOne(
      { _id: new ObjectId(_id) },
      { projection: { BlockedFriends: 1 } }
    );
    const blockedFriends = currentUser.BlockedFriends || [];

    const result = await db.collection("Members").aggregate([
      {
        $addFields: {
          FullName: { $concat: ["$FirstName", " ", "$LastName"] } // Combine FirstName and LastName
        }
      },
      {
        $match: {
          $and: [
            {
              $or: [
                { FirstName: { $regex: search, $options: 'i' } },
                { LastName: { $regex: search, $options: 'i' } },
                { FullName: { $regex: search, $options: 'i' } }
              ]
            },
            {
              $or: [
                { FirstName: { $regex: FirstName, $options: 'i' } },
                { LastName: { $regex: LastName, $options: 'i' } },
                { FullName: { $regex: FirstName + ' ' + LastName, $options: 'i' } }
              ]
            },
            { _id: { $nin: blockedFriends } },
            { _id: { $ne: new ObjectId(_id) } } // Exclude yourself
          ]
        }
      },
      {
        $project: {
          _id: 1,
          FirstName: 1,
          LastName: 1,
          Photo: 1
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]).toArray();

    res.status(200).json({ response: result });
  } catch (error) {
    console.log(`The error from MembersController in SearchMembers(): ${error.message}`);
    res.json({ err: "An error occurred on the server. Please try again later." });
  }
}

const addMembers = async (req, res) => {
  try {
    const { db } = req.app.locals;
    const count = 1000;
    const alpha = "abcdefghijklmnopqrstuvwxyz";
    const data = [];

    function SliceAlpha() {
      const start = parseInt(Math.random() * (alpha.length - 5));
      const end = start + 4;

      return alpha.slice(start, end);
    };

    for (let index = 0; index < count; index++) {
      const FirstName = SliceAlpha();
      const LastName = SliceAlpha();
      const Email = `${FirstName}_${LastName}@gmail.com`;
      const Password = await bcrypt.hash(SliceAlpha(), 10);
      const Email_Verified = false;

      data.push({
        FirstName,
        LastName,
        Email,
        Password,
        Email_Verified,
        FriendsRequests: [],
        Friends: [],
        BlockedFriends: [],
        Chat: [],
        Notifications: []
      });
    };

    await db.collection('Members').insertMany(data);
    res.status(200).json({ response: data });
  } catch (error) {
    console.log(`The error from MembersController in addMembers(): ${error.message}`);
    res.json({ err: "An error in the server try later !" });
  }
}

module.exports = { getMembers, addMembers, SearchMembers };