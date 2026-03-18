var express = require("express");
var router = express.Router();
let blogController = require('../controllers/blogs')
let { CheckLogin, checkRole } = require('../utils/authHandler')
let { CreateBlogValidator, CreateCommentValidator, validatedResult } = require('../utils/validator')

// --- Blog ---
router.get('/', async function (req, res, next) {
    let result = await blogController.GetAllBlog();
    res.send(result)
})
router.post('/', CheckLogin, checkRole('admin', 'staff'), CreateBlogValidator, validatedResult, async function (req, res, next) {
    let { title, content, thumbnail, category, tags } = req.body;
    let result = await blogController.CreateBlog(title, content, thumbnail, category, req.user._id, tags);
    res.send(result)
})
router.get('/:slug', async function (req, res, next) {
    let result = await blogController.GetBlogBySlug(req.params.slug);
    if (!result) {
        res.status(404).send("khong tim thay bai viet")
    } else {
        res.send(result)
    }
})
router.put('/:id', CheckLogin, checkRole('admin', 'staff'), async function (req, res, next) {
    let result = await blogController.UpdateBlog(req.params.id, req.body);
    if (!result) {
        res.status(404).send("khong tim thay bai viet")
    } else {
        res.send(result)
    }
})
router.delete('/:id', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await blogController.DeleteBlog(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay bai viet")
    } else {
        res.send(result)
    }
})
router.patch('/:id/publish', CheckLogin, checkRole('admin'), async function (req, res, next) {
    let result = await blogController.TogglePublish(req.params.id);
    if (!result) {
        res.status(404).send("khong tim thay bai viet")
    } else {
        res.send(result)
    }
})

// --- Blog Comments ---
router.get('/:blogId/comments', async function (req, res, next) {
    let result = await blogController.GetCommentsByBlog(req.params.blogId);
    if (!result) {
        res.status(400).send("loi khi lay binh luan")
    } else {
        res.send(result)
    }
})
router.post('/:blogId/comments', CheckLogin, CreateCommentValidator, validatedResult, async function (req, res, next) {
    let { content } = req.body;
    let result = await blogController.CreateComment(req.params.blogId, req.user._id, content);
    res.send(result)
})
router.post('/:blogId/comments/:commentId/reply', CheckLogin, CreateCommentValidator, validatedResult, async function (req, res, next) {
    let { content } = req.body;
    let result = await blogController.ReplyComment(req.params.blogId, req.user._id, content, req.params.commentId);
    res.send(result)
})
router.put('/:blogId/comments/:commentId', CheckLogin, async function (req, res, next) {
    let { content } = req.body;
    let result = await blogController.UpdateComment(req.params.commentId, req.user._id, content);
    if (!result) {
        res.status(404).send("khong tim thay binh luan hoac ban khong co quyen")
    } else {
        res.send(result)
    }
})
router.delete('/:blogId/comments/:commentId', CheckLogin, async function (req, res, next) {
    let isAdmin = req.user.role.name === 'admin';
    let result = await blogController.DeleteComment(req.params.commentId, req.user._id, isAdmin);
    if (!result) {
        res.status(404).send("khong tim thay binh luan hoac ban khong co quyen")
    } else {
        res.send(result)
    }
})

module.exports = router;
