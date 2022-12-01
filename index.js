const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()
app.use(cors())
app.use(express.json())
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const verifytoken = (req, res, next)=>{
    const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).send({
                message: 'unauthorized access',
            })
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded){
            if(err){
                return res.status(403).send({
                    message: 'Forbidden access',
                })
  
            }
            req.decoded = decoded;
            next();
        })
  
  }
  const verifyAdmin = async (req, res, next) =>{
    const decodedEmail = req.decoded.email;
    const query = { email: decodedEmail };
    const user = await allUser.findOne(query);

    if (user?.specialty !== 'ADMIN') {
        return res.status(403).send({ message: 'forbidden access' })
    }
    next();
}

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_KEY}@cluster0.cvtbcrw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, { connectTimeoutMS: 30000 }, { keepAlive: 1 });

async function dbConnect (){
    try{
        await client.connect();
        console.log('Database connected')

    }
    catch (error){
        console.log(error);
    }
}
dbConnect();
const allUser = client.db('moto-rev').collection('users')
const allProduct = client.db('moto-rev').collection('products')
const allOders = client.db('moto-rev').collection('orders')
const allCategory = client.db('moto-rev').collection('categories')
const allPayment = client.db('moto-rev').collection('payments')
const allReport= client.db('moto-rev').collection('reports')
const allAds= client.db('moto-rev').collection('ads')


app.put('/users', async(req, res)=>{
    try{
        const {name,email,specialty} = req.body;
        
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
            $set: {
                name:name,
                email:email,
                specialty:specialty
            }
        }
        const result = await allUser.updateOne(filter, updateDoc, options);
        if(result){
            res.send({
                success:true,
                message:'User Active Successfull'
            })
        }
        
        


    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.get('/users',async(req,res)=>{
    try{
        const cursor = allUser.find({specialty: 'SELLER'})
        const users = await cursor.toArray()
        if(users){
            res.send({
                success:true,
                data:users
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }

})
app.get('/allbuyer',async(req, res)=>{
    try{
        const cursor = allUser.find({specialty: 'BUYER'})
        const users = await cursor.toArray()
        if(users){
            res.send({
                success:true,
                data:users
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }

})
app.get('/categories', async(req, res)=>{
    try{
        const cursor = allCategory.find({})
        const categories = await cursor.toArray()
        if(categories){
            res.send({
                success:true,
                message:'Successfully Got Data',
                data:categories
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.get('/jwt', async(req,res)=>{
    try{
        const email = req.query.email;
        
        const query = {email:email};    
        const user = await allUser.findOne(query)
        
        if(user){
            const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1d'})
        res.send({
            success:true,
            accessToken:token
        })

        }
        else{

            res.status(403).json({accessToken: ''})
        }
        

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.get('/users/admin/:email', async (req, res) =>{
    try{
        const email = req.params.email;
        const query = { email }
        const user = await allUser.findOne(query);
        res.send({ isAdmin: user?.specialty === 'ADMIN' });

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.get('/users/seller/:email', async (req, res) =>{
    try{
        const email = req.params.email;
        const query = { email }
        const user = await allUser.findOne(query);
        res.send({ isSeller: user?.specialty === 'SELLER' });

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.get('/users/buyer/:email', async (req, res) =>{
    try{
        const email = req.params.email;
        const query = { email }
        const user = await allUser.findOne(query);
        res.send({ isBuyer: user?.specialty === 'BUYER' });

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.post('/products', verifytoken, async (req, res) => {
    try{
        const product = req.body;
        const result = await allProduct.insertOne(product);
    if(result){
        res.send({
            success:true,
            message:'Add Product Successfull'
        })

    }
    

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
    
});
app.get('/products/:email', async(req,res)=>{
    try{
        const email = req.params.email
        const quary = allProduct.find({seller_email:email})
        const result = await quary.toArray()
        
        if(result){
            res.send({
                success:true,
                data:result
            })
        }


    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.delete('/products/:id', verifytoken, async (req, res) => {
    try{
        const id = req.params.id;
       
    const filter = {_id:ObjectId(id)};
   
    const result = await allProduct.deleteOne(filter);
    
    if(result){
        res.send({
            success:true,
            data:result
        })
    }
    

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
    
})
app.get('/category/:name',async(req,res)=>{
    try{
        const nameProduct = req.params.name;
        const cursor = allProduct.find({})
        const findAll = await cursor.toArray();
        const filterData = findAll.filter(p => p.category === nameProduct) 
        if(filterData){
            res.send({
                success:true,
                data:filterData
            })
        }


    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.get('/viewProduct/:id',async(req, res)=>{
    try{
        const productId = req.params.id;
        const filter = {_id:ObjectId(productId)};
        const filterData = await allProduct.findOne(filter)
        
        if(filterData){
            res.send({
                success:true,
                data:filterData
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.post('/orders',async(req,res)=>{
    try{
        const order = req.body;
        const result = await allOders.insertOne(order)
        if(result){
            res.send({
                success:true,
                message:'Add Order Successfully',
                
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.get('/orders/:email',async(req,res)=>{
    try{
        const email = req.params.email;
        const query=  allOders.find({email:email})
        const result = await query.toArray()
        if(result){
            res.send({
                success:true,
                data:result
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.delete('/orders/:id', verifytoken, async (req, res) => {
    try{
        const id = req.params.id;
       
    const filter = {_id:ObjectId(id)};
    
    const result = await allOders.deleteOne(filter);
    console.log(result);
    if(result){
        res.send({
            success:true,
            data:result
        })
    }
    

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
    
})
app.get('/findorder/:id',async(req,res)=>{
    try{
        const pId = req.params.id
        
        const query=  allOders.find({_id:ObjectId(pId)})
        const result = await query.toArray()
        if(result){
            res.send({
                success:true,
                data:result
            })

        }


    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })

    }
})
app.post('/create-payment-intent', verifytoken, async (req, res) => {
    const booking = req.body;
    
    const resalePrice =  booking.resalePrice;
    
    const amount = parseInt(resalePrice) * 100;
    console.log(typeof( amount), amount)
    if(amount){
        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'usd',
            amount: amount,
            "payment_method_types": [
                "card"
            ]
        });
        res.send({
            clientSecret: paymentIntent.client_secret,
        });

    }
    else{
        return
    }

    
});
app.post('/payments', async (req, res) =>{
    const payment = req.body;
    const result = await allPayment.insertOne(payment);
    const id = payment.bookingId
    const filter = {_id: ObjectId(id)}
    const updatedDoc = {
        $set: {
            paid: true,
            transactionId: payment.transactionId
        }
    }
    const updatedResult = await allOders.updateOne(filter, updatedDoc)
    res.send(result);
})
app.put('/users/admin/:id', verifytoken, verifyAdmin, async(req, res)=>{
    try{
        const decodedEmail = req.decoded.email;
        const quary = {email: decodedEmail};
        const user = await allUser.findOne(quary);

        if(user?.specialty !== 'ADMIN'){
            return res.status(403).send({message: 'forbidden access'})
        }
        const id = req.params.id;
        const filter = {_id:ObjectId(id)}
        const options = {upsert: true};
        const updateDoc = {
            $set:{
                role:'VERIFIED'
            }
        }
        const result = await allUser.updateOne(filter,updateDoc,options)
        if(result){
            res.send({
                success:true,
                message:'Make Verified Successfull',
                data:result
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.delete('/users/:id', verifytoken, async (req, res) => {
    try{
        const id = req.params.id;
       
    const filter = {_id:ObjectId(id)};
    
    const result = await allUser.deleteOne(filter);
    console.log(result);
    if(result){
        res.send({
            success:true,
            data:result
        })
    }
    

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
    
})
app.post('/report',verifytoken,async(req,res)=>{
    try{
        const product = req.body;
        const result = await allReport.insertOne(product)
        if(result){
            res.send({
                success:true,
                message:'Report Product Successfull'
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.get('/report',verifytoken, async(req,res)=>{
    try{
        const cursor = allReport.find({})
        const result = await cursor.toArray()
        if(result){
            res.send({
                success:true,
                data:result
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.delete('/report/:id', verifytoken,async(req,res)=>{
    try{
        const id = req.params.id;
       
        const filter = {_id:id};
        
        const result = await allReport.deleteOne(filter);
        console.log(result);
        if(result){
            res.send({
                success:true,
                data:result
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.post('/ads',async(req,res)=>{
    try{
        const product = req.body;
        
        const result = await allAds.insertOne(product)
        if(result){
            res.send({
                success:true,
                message:'Ads Added Successfull'
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.get('/ads',async(req,res)=>{
    try{
        const ads = allAds.find({}).sort({_id:-1})
        const result = await ads.toArray();
        if(result){
            res.send({
                success:true,
                data:result
            })
        }

    }
    catch(error){
        res.send({
            success:false,

        })
    }
})
app.get('/verifired/:email',async(req,res)=>{
    try{
        const email = req.params.email
        
        const filter = await allUser.findOne({email:email})
        console.log(filter);
        if(filter.role === 'VERIFIED'){
            res.send({
                success:true,
                data:filter
            })
        }
        else{
            return;
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.patch('/unsold/:id', async(req, res)=>{
    
    try{
        const id = req.params.id;
      
      
      const result = await allProduct.updateOne ({_id:ObjectId(id)}, {$set: {
        quantity:0
      }})
      
      if(result.modifiedCount){
        res.send({
          success:true,
          message:"Successfully Update"
        })
      }
  
    }
    catch(error){
      res.send({
        success:false,
        error:error.message
      })
    }
  })

app.get('/allProducts',async(req,res)=>{
    try{
        const cursor = allProduct.find({})
        const result = await cursor.toArray();
        if(result){
            res.send({
                success:true,
                data:result
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})
app.delete('/ads/:id',async(req,res)=>{
    try{
        const id = req.params.id;
        console.log(id)
        const filter = {product_id:id}
        const result = await allAds.deleteOne(filter)
        if(result){
            res.send({
                success:true,
                message:"Ads Delete successfully"
            })
        }

    }
    catch(error){
        res.send({
            success:false,
            error:error.message
        })
    }
})  

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})