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
        const id = req.params.id;
        const data = await post.findById({_id:id});
        res.render('post',{data,layout:adminLayout});
    }catch(err){
        console.log(err);
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
        res.render('admin/login',{layout:adminLayout});
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
        if(!User){
            return res.status(401).json({message:'username not found'});
        }
        
        if(password!=User.password){
            return res.status(401).json({message:'Password incorrect'});
        }
        const token = jwt.sign({userId:User._id},jwtsecret);
        res.cookie('token',token,{httpOnly:true});


        res.redirect('/dashboard');
    }catch(err){
        console.log(err);
    }
});


//GET admin dashboard
router.get('/dashboard',authMiddleware, async (req,res)=>{
    //res.render('index');

    try{
        const data = await post.find();
        res.render('admin/dashboard',{data,layout:adminLayout});
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

//redirect to login page
router.get('/dashboard',async (req,res)=>{
    //res.render('index');

    res.redirect('/admin/dashboard');
})

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
        try {
            const newPost = new post({
                title: req.body.title,
                body: req.body.body
            });
            await post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.log(error);
        }
    }catch(error){
        console.log(error);
    }
});

//GET edit-post
router.get('/edit_post/:id',authMiddleware,async (req,res)=>{
    //res.render('index');
    
    try {
        const id = req.params.id;
        const data = await post.findById({_id:id});
        res.render('admin/edit_post',{data,layout:adminLayout});
    } catch (error) {
        console.log(error);
    }

    
})

//PUT edit-post
router.put('/edit_post/:id',authMiddleware,async (req,res)=>{
    //res.render('index');
    
    try {
        await post.findByIdAndUpdate(req.params.id,{
            title:req.body.title,
            body:req.body.body,
            updatedAt: Date.now()
        });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }

    
})

//DELETE post
router.delete('/delete_post/:id',authMiddleware,async (req,res)=>{
    //res.render('index');
    
    try {
        await post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
    
})

router.get('/logout',authMiddleware,async (req,res)=>{
    //res.render('index');

    res.clearCookie('token');
    res.redirect('/admin');
})


module.exports = router;