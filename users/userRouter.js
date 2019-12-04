const express = require('express');
const db = require('./userDb');
const dbPost = require('../posts/postDb');

const router = express.Router();

router.use(express.json());


// ------------------------------- GET ------------------------------- //
router.get('/', (req, res) => {
    db.get()
    .then(user => {
        res.status(200).json(user);
    })
    .catch(error => {
        console.log('error on GET /api/users', error);
        res.status(500).json({ error: 'The users information could not be retrieved.' })
    })
});

router.get('/:id', validateUserId, (req, res) => {
    const id = req.params.id;
    db.getById(id) 
    .then(user => {
        res.status(200).json(user);
    })
    .catch(error => {
        console.log('error on GET /api/users/:id', error);
        res.status(500).json({ error: 'The user information could not be retrieved.' })
    })
});

router.get('/:id/posts', validateUserId, (req, res) => {
    const id = req.params.id;
    // db.getById(id) 
    // .then(user => {
    //     if (!user) {
    //         res.status(404).json({ message: 'The user with the specified ID does not exist' })
    //     }
    // })
    // .catch(error => {
    //     console.log('error on GET /api/posts/:id', error);
    //     res.status(500).json({ error: 'The post information could not be retrieved.' })
    // })
    db.getUserPosts(id)
    .then(posts => {
        res.status(200).json(posts);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ error: 'The posts information could not be retrieved.' })
    })  
});

// ------------------------------- POST ------------------------------- //
router.post('/', validateUser, (req, res) => {
    const userData = req.body;
        db.insert(userData)    
        .then(user => {
            res.status(201).json({ success: `user was successfully added`});
        })
        .catch(error => {
            console.log('error on POST /api/users', error);
            res.status(500).json({ error: 'There was an error while saving the user to the database' })
        })
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
    const id = req.params.id;
    req.body.user_id = id;
    const postData = req.body;
        // db.getById(id) 
        // .then(user => {
        //     if (!user) {
        //         res.status(404).json({ message: 'The user with the specified ID does not exist' })
        //     }
        // })
        // .catch(error => {
        //     console.log('error on GET /api/users/:id', error);
        //     res.status(500).json({ error: 'The user information could not be retrieved.' })
        // })
        // if (!postData.text) {
        //     res.status(400).json({ errorMessage: 'Please provide text for the comment.' })
        // } else {
            dbPost.insert(postData)    
            .then(post => {
                res.status(201).json(post);
            })
            .catch(error => {
                console.log('error on POST /api/users/:id/posts', error);
                res.status(500).json({ error: 'There was an error while saving the post to the database' })
            })
        // }
});


// ---------------------------- DELETE ------------------------------- //
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    db.remove(id)
    .then(removed => {
        if (removed) {
            res.status(200).json({ message: 'user removed successfully', removed })   
        } else {
            res.status(404).json({ message: 'The user with the specified ID does not exist.' })
        }
    })
    .catch(error => {
        console.log('error on DELETE /api/users/:id', error);
        res.status(500).json({ error: 'The user could not be removed' })
    })
});


// ------------------------------- PUT ------------------------------- //
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const userData = req.body;
    
    db.getById(id) 
        .then(user => {
            if (!user) {
                res.status(404).json({ message: 'The user with the specified ID does not exist' })
            }
        })
        .catch(error => {
            console.log('error on finding specific ID /api/users/:id', error);
            res.status(500).json({ error: 'The user information could not be retrieved.' })
        }) 

    if (!userData.name) {
        res.status(400).json({ errorMessage: 'Please provide a name for the user.' })
    }  else {
        db.update(id, userData)
        .then(user => {
            res.status(200).json({ message: `user ${id} was updated` });
        })
        .catch(error => {
            console.log('error on PUT /api/users/:id', error);
            res.status(500).json({ error: 'The user information could not be modified.' })
        })
    }
});




// -------------------- Custom Middleware ------------------------ //

function validateUserId(req, res, next) {
  const id = req.params.id;
    db.getById(id) 
    .then(user => {
        if (user) {
            req.user = user;
            next();
        } else {
            res.status(404).json({ message: 'invalid user id' })
        }
    })
    .catch(error => {
          console.log('error on GET /api/users/:id', error);
          res.status(500).json({ error: 'The user information could not be retrieved.' })
      })
    
}

function validateUser(req, res, next) {
    const userData = req.body;
    if (!userData) {
      res.status(400).json({ error: 'missing user data' })
    } else if (!userData.name) {
      res.status(400).json({ error: 'missing required name field' })
    } else {
      next();
    }
}

function validatePost(req, res, next) {
    const postData = req.body;
    if (!postData) {
      res.status(400).json({ message: 'missing post data' })
    } else if (!postData.text) {
      res.status(400).json({ message: 'missing required text field' })
    } else {
      next();
    }
}

module.exports = router;
