const {body} = require("express-validator");

const like = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId).exec();
    if (!post) {
        return res.json({
            success: false,
            message: "Post not found"
        });
    }

    let postLike = await Like.findOneAndUpdate(
        {
            post: postId,
            user: userId
        },
        {
            $inc: {
                pressed: 1
            }
        },
        {
            new: true,
            upsert: true
        }
    ).exec();

    if (postLike.liked) {
        post.likes.push(postLike._id);
    } else {
        post.likes = post.likes
            .filter(id => id.toString() !== postLike._id.toString());
    }
    await post.save();

    res.json({
        success: true,
        message: "Posts liked successfully",
        data: {
            liked: postLike.liked,
            likes: post.likes.length
        }
    });
};

const search = async (req, res) => {
    const limit = req.body.limit || 1;
    const seen = req.body.seen || [];
    const me = await User.findById(req.user._id).exec();

    let posts = await Post
        .find({
            _id: {$nin: seen},
            active: true,
            user: {$ne: me._id}
        })
        .select({
            createdAt: 1,
            description: 1,
            scope:1,
            tags: 1,
            videoUrl: 1,
            likes: 1,
            shares: 1,
            comments: 1
        })
        .populate([
            {
                path: "user",
                select: {
                    name: 1,
                    photo: 1
                }
            },
            {path: "likes"}
        ])
        .limit(limit)
        .exec();

    posts = posts.map(p => {
        p = p.toObject();

        const myFollowing = me.following.map(f => f.toString());
        p.user.following = myFollowing.includes(p.user._id.toString());
        p.liked = p.likes.some(l => l.user.toString() === me._id.toString());

        p.likes = p.likes.length;
        p.shares = p.shares.length;
        p.comments = p.comments.length;
        return p;
    });

    res.json({
        success: true,
        message: "Posts fetched successfully",
        data: posts
    });
};

const create = async (req, res) => {
    const user = await User.findById(req.user._id).exec();

    const postData = {
        ...req.body,
        user: user._id
    };
    const post = new Post(postData);
    await post.save();

    if (!Array.isArray(user.posts)) {
        user.posts = [];
    }
    user.posts.push(post._id);
    await user.save();

    res.json({
        success: true,
        message: "Your post just created"
    });
};

const getComments = async (req, res) => {
    const comments = await Comment
        .find({
            post: req.params.id
        })
        .populate({
            path: "user"
        })
        .sort({
            createdAt: -1
        })
        .exec();

    res.json({
        success: true,
        data: comments,
        message: "Post comments"
    });
};

const addComment = async (req, res) => {
    const post = await Post.findById(req.body.post).exec();
    const doc = new Comment({
        ...req.body,
        user: req.user._id
    });
    await doc.save();

    post.comments.push(doc._id);
    await post.save();

    res.json({
        success: true,
        data: doc,
        message: "Comment created"
    });
};

module.exports = {
    like,
    search,
    create,
    getComments,
    addComment
};
