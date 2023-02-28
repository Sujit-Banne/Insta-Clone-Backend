const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
dotenv.config({ path: '../env' })
const jwt_sec = process.env.JWT_SECRET;
const requireLogin = require('../middleware/requireLogin');


//get resource only when user login (matching token)
router.get('/protected', requireLogin, (req, res) => {
    res.send('hello')
})

//signup
router.post('/Signup', (req, res) => {
    const { name, email, password } = req.body
    if (!email || !password || !name) {
        return res.status(400).json({
            error: "please add all the fields"
        })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                return res.status(400).json({
                    error: "user already exists with that email"
                })
            }
            //hashing password
            bcrypt.hash(password, 12)
                .then(hashedpassword => {
                    const user = new User({
                        email,
                        password: hashedpassword,
                        name
                    })
                    user.save()
                        .then(user => {
                            res.json({ message: "saved successfully" })
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({ error: "Internal server error" });
                        })
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal server error" });
        })
})

//signin
router.post('/Signin', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(400).json({ error: "Please add email or password" })
    }
    User.findOne({ email: email })
        .then((savedUser) => {
            if (!savedUser) {
                return res.status(401).json({ errr: "Invalid Email Or Password" })
            }
            //to compare password
            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        // res.json({ message: "successfully Signed in" })
                        //sign method to generate token on basis of user id
                        const token = jwt.sign({ _id: savedUser._id }, jwt_sec)
                        const { _id, name, email } = savedUser
                        return res.json({ token, user: { _id, name, email } })
                    } else {
                        return res.status(422).json({ error: "Invalid add email or password" })
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: "Internal server error" });
                })
        })
})

module.exports = router