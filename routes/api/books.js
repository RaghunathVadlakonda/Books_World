const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Book = require('../../models/Book');
const User = require('../../models/User');
const config = require('config');
const {check, validationResult} = require('express-validator');
const { query } = require('express');


// @route           POST api/books
// @Description     Add Book
// @Access          Private route
router.post('/', [ auth, 
[
    check('title', 'Title is required').not().isEmpty(),
    check('publication', 'Publication is required').not().isEmpty(),
    check('author', 'Author is required').not().isEmpty(),

]
],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() })
    }

    try {

        // Fetch user from DB
        const user = await User.findById(req.user.id).select('-password');

        // const { title, publication, author, cost } = req.body;

        const newBook = new Book({
            title: req.body.title,
            publication: req.body.publication,
            author: req.body.author,
            cost: req.body.cost,
            user: req.user.id
        });

        const book = await newBook.save();
        res.json(book);
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});


// @route           GET api/books
// @Description     Get All books
// @Access          Private route
router.get('/', async(req, res) => {
    try {
        // Fetching the all books from DB.
        const books = await Book.find().sort({date: -1});
        res.json(books); 
        // console.log("Success done");
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json('Server Error');
    }
});



// @route           GET api/books/:author
// @Description     Get book based on author name
// @Access          Private route
router.get('/:author', async(req, res) => {
    try {
        // Fetching the books from DB using author name.
        let regex = new RegExp(req.params.author, 'i');

        const book = await Book.find({author: regex});

        // Handling the error if book not available.
        if(!book) {
            return res.status(404).json({msg: 'Books Not Found.'});
        }
        res.json(book); 
        
    } catch (err) {
        console.error(err.message);
        // Handling error if wrong in id.
        if(err.name == 'CastError'){
            return res.status(404).json({msg: 'Book Not Found.'});
        }
        res.status(500).json('Server Error');
    }
});


// @route           GET api/books/
// @Description     Get book based
// @Access          Private route
// db.collection.find({price: {$gte: 500, $lte: 1000}}).sort({price:1})
router.get('/cost', async(req, res) => {

    try {
        let { minCost, maxCost } = req.query;

        if(minCost === '' || maxCost === '') {
            return res.status(400).json({
                msg: 'Please ensure you pick MinCost and MaxCost.'
            })
        };
        console.log({ minCost, maxCost});

        const book = await Book.find({cost: {$gte: 500, $lt: 1000 }}).sort({cost: 'asc'});
        console.log("=====> ", book)
        
        if(!book) {
            return res.status(404).json({msg: 'Books Not Found.'});
        }
        res.json(book); 
        
    } catch (err) {
        console.error(err.message);
        // Handling error if wrong in id.
        if(err.name == 'CastError'){
            return res.status(404).json({msg: 'Book Not Found.'});
        }
        res.status(500).json('Server Error');
    }
});


// @route           GET api/books/:id
// @Description     Get book based on id
// @Access          Private route
router.get('/:id', async(req, res) => {
    try {
        // Fetching the book from DB using book id.
        const book = await Book.findById(req.params.id);

        // Handling the error if book not available.
        if(!book) {
            return res.status(404).json({msg: 'Books Not Found.'});
        }
        res.json(book); 
        
    } catch (err) {
        console.error(err.message);
        // Handling error if wrong in id.
        if(err.name == 'CastError'){
            return res.status(404).json({msg: 'Book Not Found.'});
        }
        res.status(500).json('Server Error');
    }
});


// @route           PUT api/books
// @Description     update Book
// @Access          Private route
router.put('/:id',  [ auth, 
    [
        // check('title', 'Title is required').not().isEmpty(),
        // check('publication', 'publication is required').not().isEmpty()
        check('cost', 'cost is required').not().isEmpty()
    
    ]
    ],
        async(req, res) => {
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array() })
        }
    
        const { cost } = req.body;
    
        const newBook = { cost }; 
    
        try {
            // Fetch the book with Id
            const book = await Book.findById(req.params.id);
    
            // Handling the error if book is not available.
            if(!book) {
                res.status(404).json({msg: 'Book Not Found!'});
            }
    
            // Handling the error is not AUTHORIZED user.
            if(book.user.toString() !== req.user.id) {
                return res.status(401).json({msg: 'User Not Authorized.'});
            }
    
            await book.updateOne(newBook);
            res.json({msg: 'Successfully updated book.'});
    
        } catch (err) {
            console.error(err.message);
            // Handling error if wrong in id.
            if(err.name == 'CastError'){
                return res.status(404).json({msg: 'Book Not Found.'});
            }
            res.status(500).json('Server Error');
    }
});


// @route           DELETE api/books
// @Description     delete Book
// @Access          Private route
router.delete('/:id', auth, async(req, res) => {

    try {
        // Fetch the book with Id
        const book = await Book.findById(req.params.id);

        // Handling the error if book is not available.
        if(!book) {
            res.status(404).json({msg: 'Book Not Found!'});
        }

        // Handling the error is not AUTHORIZED user.
        if(book.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User Not Authorized.'});
        }

        await book.remove();
        res.json({msg: 'Successfully deleted book.'});

    } catch (err) {
        console.error(err.message);
        // Handling error if wrong in id.
        if(err.name == 'CastError'){
            return res.status(404).json({msg: 'Book Not Found.'});
        }
        res.status(500).json('Server Error');
    }
});

module.exports = router;