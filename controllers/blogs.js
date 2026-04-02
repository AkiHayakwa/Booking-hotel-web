let blogModel = require("../schemas/Blog");
let blogCommentModel = require("../schemas/BlogComment");

module.exports = {
    // --- Blog ---
    GetAllBlog: async function () {
        return await blogModel.find({ isDeleted: false, isPublished: true })
            .populate('author', 'username fullName avatarUrl')
            .sort({ publishedAt: -1 })
    },
    GetAllBlogAdmin: async function () {
        return await blogModel.find({ isDeleted: false })
            .populate('author', 'username fullName avatarUrl')
            .sort({ createdAt: -1 })
    },
    GetBlogBySlug: async function (slug) {
        try {
            return await blogModel.findOne({ slug: slug, isDeleted: false })
                .populate('author', 'username fullName avatarUrl')
        } catch (error) {
            return false;
        }
    },
    GetBlogById: async function (id) {
        try {
            return await blogModel.findOne({ _id: id, isDeleted: false })
                .populate('author', 'username fullName avatarUrl')
        } catch (error) {
            return false;
        }
    },
    CreateBlog: async function (title, content, thumbnail, category, authorId, tags, isPublished) {
        let newItem = new blogModel({
            title: title,
            content: content,
            thumbnail: thumbnail || "",
            category: category || "news",
            author: authorId,
            tags: tags || [],
            isPublished: isPublished || false,
            publishedAt: isPublished ? new Date() : null
        });
        await newItem.save();
        return newItem;
    },
    UpdateBlog: async function (id, body) {
        try {
            if (body.isPublished === true) {
                body.publishedAt = body.publishedAt || new Date();
            } else if (body.isPublished === false) {
                body.publishedAt = null;
            }
            return await blogModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                body,
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    DeleteBlog: async function (id) {
        try {
            return await blogModel.findOneAndUpdate(
                { _id: id, isDeleted: false },
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    },
    TogglePublish: async function (id) {
        try {
            let blog = await blogModel.findOne({ _id: id, isDeleted: false });
            if (!blog) return false;
            blog.isPublished = !blog.isPublished;
            if (blog.isPublished) {
                blog.publishedAt = new Date();
            } else {
                blog.publishedAt = null;
            }
            await blog.save();
            return blog;
        } catch (error) {
            return false;
        }
    },

    // --- Blog Comment ---
    GetCommentsByBlog: async function (blogId) {
        try {
            return await blogCommentModel.find({ blog: blogId, isDeleted: false })
                .populate('user', 'username fullName avatarUrl')
                .sort({ createdAt: 1 })
        } catch (error) {
            return false;
        }
    },
    CreateComment: async function (blogId, userId, content) {
        let newItem = new blogCommentModel({
            blog: blogId,
            user: userId,
            content: content
        });
        await newItem.save();
        // Tang commentCount
        await blogModel.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });
        return newItem;
    },
    ReplyComment: async function (blogId, userId, content, parentCommentId) {
        let newItem = new blogCommentModel({
            blog: blogId,
            user: userId,
            content: content,
            parentComment: parentCommentId
        });
        await newItem.save();
        await blogModel.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });
        return newItem;
    },
    UpdateComment: async function (commentId, userId, content) {
        try {
            let comment = await blogCommentModel.findOne({ _id: commentId, user: userId, isDeleted: false });
            if (!comment) return false;
            comment.content = content;
            comment.isEdited = true;
            await comment.save();
            return comment;
        } catch (error) {
            return false;
        }
    },
    DeleteComment: async function (commentId, userId, isAdmin) {
        try {
            let query = { _id: commentId, isDeleted: false };
            if (!isAdmin) {
                query.user = userId;
            }
            return await blogCommentModel.findOneAndUpdate(
                query,
                { isDeleted: true },
                { new: true }
            )
        } catch (error) {
            return false;
        }
    }
}
