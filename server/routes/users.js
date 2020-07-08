const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Product } = require("../models/Product");

const { auth } = require("../middleware/auth");
const { Payment } = require("../models/Payment");

const async = require('async');

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history
    });
});

router.post("/register", (req, res) => {

    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found"
            });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "Wrong password" });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie("w_authExp", user.tokenExp);
                res
                    .cookie("w_auth", user.token)
                    .status(200)
                    .json({
                        loginSuccess: true, userId: user._id
                    });
            });
        });
    });
});

router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

router.post("/addToCart", auth, (req, res) => {
    
    User.find({ _id: req.user._id },
     (err, userInfo) => {

        let duplicate = false;

        userInfo.cart.forEach((cartInfo) => {
            if (cartInfo.id === req.query.productId){
                duplicate = true;
            }

        })

        if(duplicate) {
            User.findOneAndUpdate(
                { _id: req.user._id, "cart.id": req.query.productId },
                { $inc: {"cart.$.quantity": 1} },
                {new: true },
                () => {
                    if(err) return res.json({ success:false, err});
                    res.status(200).json(useInfo.cart)
                }
            )
        } else {
            User.findOneAndUpdate(
             { _id: req.user._id },
             {
                $push: {
                    cart: {
                        id: req.query.productId,
                        quantity: 1,
                        date: Date.now()
                    }
                }
             },
             { new: true },
             (err, userInfo) => {
                if (err) return res.json({ success: false, err })
                    res.status(200).json(userInfo.cart)
                 }
                ) 
            }
        });
     
})

router.get('/removeFromCart', auth, (req,res) => {
    User.findOneAndUpdate(
        {_id: req.user._id},
        {
            "$pull":
                { "cart": { "id": req.query._id } }
        },
        { new: true },
        (err, userInfo) => {
            let cart = userInfo.cart;
            let array = cart.map(item => {
                return item.id
            })

            Product.find({ '_id': { $in: array }})
            .populate('writer')
            .exec((err, cartDetail) => {
                return res.status(200).json({
                    cartDetail,
                    cart
                })
            })
        }
    )
})

router.get('/userCartInfo', auth, (req, res)=> {
    User.findOne(
    {_id: req.user.id},
    (err, userInfo) => {
        let cart = userInfo.cart;
        let array = cart.map(item => {
            return item.id
        })

        Product.find({ '_id': { $in: array } })
            .populate('writer')
            .exec((err, cartDetail) => {
                if (err) return res.status(400).send(err);
                return res.status(200).json({ success: true, cartDetail, cart })
            })
    }
    )
})

router.post('/successBuy', auth, (req, res) => {
    let history = [];
    let transactionData = {};

    //1. Put brief PaymentInformation inside User Collection
    req.body.cartDetail.forEach((item) => {
        history.push({
            dateOfPurchase: Date.now(),
            name: item.title,
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            paymentId: req.body.paymentData.paymentID
        })
    })
    
    //2. Put Payment Information that comes from Paypal into Payment Collection
    transactionData.user = {
        id:req.user.id,
        name: req.user.name,
        lastname: req.user.lastname,
        email:req.user.email
    }

    transactionData.data = req.body.paymentData;
    transactionData.product = history

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: {history: history }, $set: {cart: [] } },
        { new: true },
        (err, user) => {
            if (err) return res.json({ success: false, err });

            const payment = new Payment(transactionData)
            payment.save((err, doc) =>{
                if(err) return res.json({success: false, err });
            });

            let products = [];
            doc.product.forEach(item=>{
                products.push({ id: item.id, quantity: item.quantity })
            })

            async.eachSeries(products, (item, callback) => {
                Product.update(
                  { _id: item.id },
                  {
                    $inc: {
                        "sold": item.quantity
                    }
                  },
                  {new: false},
                  callback
                    )
                }, (err) => {
                    if (err) return res.json({ success: false, err})
                        res.status(200).json({
                            success: true,
                            cart: user.cart,
                            cartDetail: []
                        })
                })
        }
    )

    
})

router.get('/getHistory', auth, (req, res) => {
    User.findOne(
    {_id: req.user.id },
    (err, doc) => {
        let history = doc.history;
        if(err) return res.status(400).send(err)
            return res.status(200).json({ success: true, history })
    }
    )
})

module.exports = router;