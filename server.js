const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pgp = require('pg-promise')();
const app = express();
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');
app.use(bodyParser.json());
app.use(cors());

const connection = {
    host: 'localhost',
    port: 5432,
    database: 'coloritx',
    user: 'postgres',
    password: '3p1d3m1c'
};

const db = pgp(connection);

//LOGIN

app.post('/register', (req, res) => {
	const { email, password, guest, name } = req.body;
	const uuid = uuidv4();

	if (guest != true) {
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);	
		
		db.any('insert into users(user_id, email, hash, name) values($1, $2, $3, $4) returning *', [uuid, email, hash, name])
		.then(user => { console.log(user[0]); res.json(user[0]) } )
		.catch(err => res.status(400).json('error 601: email is not valid'));
	} else if (guest === true) {
		db.any('insert into users(user_id) values($1) returning *', [uuid])
		.then(user => { res.json(user[0]); console.log(user[0]); } )
		.catch(err => res.status(400).json('error 602: email is not valid'));
	}
})

app.post('/signin', (req, res) => {
	const { email, password } = req.body;

	db.any('select * from users where email = $1', [email])
	.then(user => {	
		if (user.length) {
			db.any('select * from users where user_id = $1', [user[0].user_id])
			.then(crypto => {
				const isValid = bcrypt.compareSync(password, crypto[0].hash);
				if (isValid) {
					return res.json(user[0]);
				} else {
					throw 'password is not valid'
				}
			})
			.catch(err => res.json(err));
		}
		else {
			throw 'email is not registerd'
		}	
	})
	.catch(err => res.json(err))
})

//LISTS MANAGEMENT

app.post('/createtheme', (req, res) => {
	const {user_id, name} = req.body;
	const uuid = uuidv4();

	db.one('insert into themes(theme_id, name, user_id) values($1, $2, $3) returning *', [uuid, name, user_id])
	.then(lists => {
		console.log(lists);
		res.json(lists);
	})
	.catch(err => res.status(400).json('couldnt ADD list' + err))
})

app.post('/readthemes', (req, res) => {
	const {user_id} = req.body;

	db.any('select * from themes where user_id = $1', [user_id])
	.then(lists => {
		console.log(lists);
		res.json(lists);
	})
	.catch(err => res.status(400).json('couldnt FIND list'))
})

app.post('/updatetheme', (req, res) => {
	const {theme_id, deleteTheme, name} = req.body;
	let entries = '';

	db.one('select * from themes where theme_id = $1', [theme_id])
	.then(list => {
		db.one('update themes set name = $1 where theme_id = $2 returning *', [name, theme_id])
		.then(updatedList => {
			res.json(updatedList)
		})
		.catch(err => res.status(400).json('couldnt FIND list 2'))
	})
	.catch(err => res.status(400).json('couldnt FIND list 1'))
})

app.post('/deletetheme', (req, res) => {
	const {theme_id} = req.body;

	db.one('delete from themes where theme_id = $1 returning *', [theme_id])
	.then(lists => {
		console.log('deleted')
		res.json(lists)
	})
	.catch(err => res.status(400).json('couldnt FIND list'))
})

app.post('/readcolors', (req, res) => {
	let {theme_id} = req.body;
	db.any('select * from colors where theme_id = $1', [theme_id])
	.then(list => {
		console.log(list);
		res.json(list);
	})
	.catch(err => res.status(400).json('couldnt FIND list: ' + theme_id))
})

app.post('/readcolor', (req, res) => {
	let {theme_id} = req.body;
	db.any('select * from colors where theme_id = $1', [theme_id])
	.then(list => {
		console.log(list);
		res.json(list);
	})
	.catch(err => res.status(400).json('couldnt FIND list: ' + color_id))
})

app.post('/updatecolor', (req, res) => {
	const {color_id, hex, name} = req.body;

	db.one('select * from colors where color_id = $1', [color_id])
	.then(list => {
		db.one('update colors set hex = $1, name = $2 where color_id = $3 returning *', [hex, name, color_id])
		.then(updatedList => {
			res.json(updatedList)
		})
		.catch(err => res.status(400).json('couldnt FIND list 2'))
	})
	.catch(err => res.status(400).json('couldnt FIND list 1'))
})

app.post('/deletecolor', (req, res) => {
	const {color_id} = req.body;

	db.one('delete from colors where color_id = $1', [color_id])
	.then(list => {
		res.json(list)
	})
	.catch(err => res.status(400).json('couldnt FIND list 1'))
})

app.post('/createcolor', (req, res) => {
	const {theme_id} = req.body;
	const uuid = uuidv4();

	console.log(theme_id);

	db.one('insert into colors(theme_id, color_id) values($1, $2) returning *', [theme_id, uuid])
	.then(lists => {
		console.log(lists);
		console.log('created color');

		res.json(lists);
	})
	.catch(err => res.status(400).json('couldnt ADD list' + err))
})


// 

app.listen(3000, ()=> {
	console.log('app is running on 3000')
})

