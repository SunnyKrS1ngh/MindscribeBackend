const express = require('express');
const post = require('../models/post');
const router = express.Router();
const adminLayout = '../views/layouts/admin';
//const Post =require('../models/Post');
//Routes


//GET home page
router.get('',async (req,res)=>{
    //res.render('index');

    try{
        
        res.render('index')
    }catch(err){
        console.log(err);
    }
})

// GET a post
router.get('/postall/:id',async (req,res)=>{
    //res.render('index');
    try{
        const id = req.params.id;
        const data = await post.findById({_id:id});
        res.render('post',{data});
    }catch(err){
        console.log(err);
    }
})

router.get('/about',(req,res)=>{
    res.render('about');

})





module.exports = router;