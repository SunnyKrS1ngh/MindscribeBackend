const express = require('express');
const post = require('../models/post');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const user = require('../models/user');

const adminLayout = '../views/layouts/admin';
const jwtsecret = process.env.JWT_SECRET;


//check login
const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:'no token found'});
    }
    try{
        const decoded = jwt.verify(token,jwtsecret);
        req.userId = decoded.userId;
        req.username = decoded.username;
        next();
    }catch(error){
        res.status(401).json({message:'some error occured with decoding'});
    }
}
//redirect to login page
router.get('/admin/login',async (req,res)=>{
    //res.render('index');
    console.log('get is working');
    res.redirect('/admin');
})

// GET a post
router.get('/postpriv/:id',async (req,res)=>{
    //res.render('index');
    try{
        console.log('post request receieved');
        const id = req.params.id;
        const data = await post.findById({_id:id});

        // Check if a document was deleted
        if (!data) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.status(200).json({ post: data });

        //res.render('post',{data,layout:adminLayout});
    }catch(err){
        console.log(err);
        res.status(500).json({ message: 'Failed to delete post', err });
    }
})

//GET admin page
router.get('/admin',async (req,res)=>{
    //res.render('index');

    try{
        const token = req.cookies.token;
    if(token){
        res.redirect('/dashboard');
    }    
        //res.render('admin/login',{layout:adminLayout});
        res.status(500).json({ message: 'Not logged in' });
    }catch(err){
        console.log(err);
    }
});



//POST login page
router.post('/admin',async (req,res)=>{
  

    try{
        const {username,password} = req.body;
        //console.log(username,password);
        const User = await user.findOne({username});
        console.log(username);
        console.log(password);
        console.log(User);
        if(!User){
            return res.status(401).json({message:'username not found'});
        }
        
        if(password!=User.password){
            return res.status(401).json({message:'Password incorrect'});
        }
        const token = jwt.sign({userId:User._id,username: User.username},jwtsecret);
        res.cookie('token',token,{httpOnly:true});
        console.log('response sent from backend')

        console.log('Login successful for user:', username);
        // Send back a success response
        return res.status(200).json({ message: 'Login successful', user: { username: User.username } });

        //res.redirect(`/dashboard?username=${username}`);
    }catch(err){
        console.log(err);
    }
});


//GET admin dashboard
router.get('/dashboard',authMiddleware, async (req,res)=>{
    //res.render('index');

    try{
        const username = req.username;
        console.log('kdjfos ad jfjij');
        const mydata = await post.find({author:username});
        const pubdata = await post.find({private:false});
        console.log(mydata);
        res.json({my:mydata,pub:pubdata});
        //res.render('admin/dashboard',{mydata,pubdata,username,layout:adminLayout});
    }catch(error){
        res.json({message:'failed to retrieve posts'});
    }

    //res.render('admin/dashboard');
})

//GET register page
router.get('/admin/register',async (req,res)=>{
    //res.render('index');

    try{
        
        res.render('admin/register',{layout:adminLayout});
    }catch(err){
        console.log(err);
    }
});



// POST , admin-register
router.post('/register',async (req,res)=>{
    //res.render('index');
    //console.log('reached !');
    try{
        //console.log('reached try');
        const {username,password} = req.body;
        //const hashedPassword = await bcrypt.hash(password,100);

        try {
            console.log('user created');
            const User = await user.create({username,password});
            res.status(201).json({message:'user created'});
        } catch (error) {
            console.log('some erro occured');
            if(error.code===11000){
                res.status(409).json({message:'user already in use'});
            }
            res.status(500).json({message:'internal server error'});
        }
    }catch(err){
        console.log(err);
    }
});



//GET add-post
router.get('/add_post',authMiddleware,async (req,res)=>{
    //res.render('index');

    res.render('admin/add_post',{layout:adminLayout});
})

//POST add-post
router.post('/add_post',authMiddleware,async (req,res)=>{
    //res.render('index');

    try{
        console.log(req.body);
        const username = req.username;
        const isPrivate = req.body.private === true;
        try {
            const newPost = new post({
                title: req.body.title,
                body: req.body.body,
                author:req.username,
                private:isPrivate
            });
            await post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
    }catch(error){
        console.log(error);
    }
    //console.log(req.username);
});

//GET edit-post
router.get('/edit_post/:id',authMiddleware,async (req,res)=>{
    //res.render('index');
    
    try {
        const id = req.params.id;
        const data = await post.findById({_id:id});
        //res.render('admin/edit_post',{data,layout:adminLayout});
    } catch (error) {
        console.log(error);
    }

    
})

//PUT edit-post

router.put('/edit_post/:id', authMiddleware, async (req, res) => {
    try {
        // Attempt to find and update the post
        const updatedPost = await post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        }, { new: true }); // { new: true } returns the updated document

        // Check if the post was found and updated
        console.log(updatedPost);
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Respond with the updated post
        res.status(200).json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating post' });
    }
});


// DELETE post
router.delete('/delete_post/:id', authMiddleware, async (req, res) => {
    try {
        console.log(req.params.id);
        const result = await post.deleteOne({ _id: req.params.id });
        
        // Check if a document was deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error); // Log error for server-side debugging
        res.status(500).json({ message: 'Failed to delete post', error });
    }
});

router.get('/logout', authMiddleware, async (req, res) => {
    try {
        // Clear the authentication cookie
        res.clearCookie('token');

        // Optionally, destroy the session if using express-session
        // req.session.destroy(err => {
        //     if (err) {
        //         return res.status(500).json({ message: 'Could not log out' });
        //     }
        // });

        // Send a success response or redirect as needed
        res.status(200).json({ message: 'Logged out successfully' });
        // or you can redirect to a specific page
        // res.redirect('/admin');
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



module.exports = router;