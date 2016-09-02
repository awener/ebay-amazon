var ebay = require('./ebay-parallel.js');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
/* test test */
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/views'));

app.get('/search', function(req, res) {
	
	ebay.fetchItems(req.query.username,req.query.date,req.query.sold, function(err, result) {
		if(err) return res.status(500).end(result);
		else {
			res.status(200).json({data: result});
		}
	});
})

app.get('/', function(req, res) {
	res.redirect('/index.html');
});



app.listen(3000);
