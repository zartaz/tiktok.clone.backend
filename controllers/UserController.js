const me = async (req, res) => {
    const user = await User
        .findById(req.user._id)
        .populate([
            {
                path: "posts",
                options: {
                    sort: "-createdAt"
                }
            }
        ])
        .exec();

    res.json({
        success: true,
        data: user,
        message: "Your post just created"
    });
};

const follow = async (req, res) => {
    const loggedIn = await User.findById(req.user._id).exec();
    const toFollow = await User.findById(req.params.id).exec();

    if (!toFollow) {
        return res.json({
            success: false,
            message: "User not found"
        });
    }

    const strFollowers = toFollow.followers.map(f => f.toString());
    if (strFollowers.includes(loggedIn._id.toString())) {
        return res.json({
            success: false,
            message: "You already following this user"
        });
    }

    toFollow.followers.push(loggedIn._id);
    loggedIn.following.push(toFollow._id);

    await toFollow.save();
    await loggedIn.save();

    res.json({
        success: true,
        message: "You are following " + toFollow.name
    });
};

const userProfile = async (req, res) => {
    const postUserId = req.params.id;
    const user = await User
        .findById(postUserId)
        .populate([
            {
                path: "posts",
                options: {
                    sort: "-createdAt"
                }
            }
        ])
        .exec();

    if (!user) {
        res.json({
            success: false,
            message: "user not found"
        })
    }

    res.json({
        success: true,
        message: "user fetched successfully",
        data: user
    })
};

const following = async (req, res) => {
    const user = await User
        .findById(req.params.id)
        .select({
            following: 1
        })
        .populate({
            path: "following",
            // select: {}
        })
        .exec();

    res.json({
        success: true,
        message: "following users fetched successfully",
        data: user.following
    })
};

const followers = async (req, res) => {
    const user = await User
        .findById(req.params.id)
        .select({
            followers: 1
        })
        .populate({
            path: "followers",
            // select: {}
        })
        .exec();

    res.json({
        success: true,
        message: "following users fetched successfully",
        data: user.followers,
    })
};

const unfollowFollowers = async (req, res) => {
    const loggedIn = await User
        .findById(req.user._id)
        .select("followers")
        .exec();
    const toUnfollow = await User
        .findById(req.params.id)
        .select("following")
        .exec();

    const strFollowers = loggedIn.followers.map(f => f.toString());
    const strFollowing = toUnfollow.following.map(f => f.toString());
    if (!strFollowers.includes(toUnfollow._id.toString())) {
        return res.json({
            success: false,
            message: "You already unfollowing this user"
        });
    }

    if (!strFollowing.includes(loggedIn._id.toString())) {
        return res.json({
            success: false,
            message: "You already unfollowing this user"
        });
    }

    loggedIn.followers = loggedIn.followers.filter(f => f._id.toString() !== toUnfollow._id.toString());
    toUnfollow.following = toUnfollow.following.filter(f => f._id.toString() !== loggedIn._id.toString());

    await loggedIn.save();
    await toUnfollow.save();

    res.json({
        success: true,
        message: `unfollow ${toUnfollow._id}`,
    })
};

const unfollowFollowing = async (req, res) => {
    const loggedIn = await User
        .findById(req.user._id)
        .select("following")
        .exec();
    const toUnfollow = await User
        .findById(req.params.id)
        .select("followers")
        .exec();

    const strFollowing = loggedIn.following.map(f => f.toString());
    const strFollower = toUnfollow.followers.map(f => f.toString());
    if (!strFollowing.includes(toUnfollow._id.toString())) {
        return res.json({
            success: false,
            message: "You already unfollowing this user"
        });
    }

    if (!strFollower.includes(loggedIn._id.toString())) {
        return res.json({
            success: false,
            message: "You already unfollowing this user"
        });
    }

    loggedIn.following = loggedIn.following.filter(f => f._id.toString() !== toUnfollow._id.toString());
    toUnfollow.followers = toUnfollow.followers.filter(f => f._id.toString() !== loggedIn._id.toString());

    await loggedIn.save();
    await toUnfollow.save();

    res.json({
        success: true,
        message: `unfollow ${toUnfollow._id}`,
    })
};

module.exports = {
    me,
    follow,
    userProfile,
    following,
    followers,
    unfollowFollowers,
    unfollowFollowing
};
