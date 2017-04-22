var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();

var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());


app.get('/', function(req, res) {
	res.send('Todo API root!');
});

app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completed') && queryParams.completed ==='true'){
		filteredTodos = _.where(filteredTodos,{completed: true});
	}else if(queryParams.hasOwnProperty('completed') && queryParams.completed ==='false'){
		filteredTodos = _.where(filteredTodos,{completed: false});
	}

	if(queryParams.hasOwnProperty('q') && queryParams.q.length >0){
		filteredTodos = _.filter(filteredTodos, function(todos){
			return todos.description.indexOf(queryParams.q)>-1;
		})
	}
	res.json(filteredTodos);
});


app.post('/todos', function(req, res) {
	var body = _.pick(req.body,'description','completed');


	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	body.description = body.description.trim();
	body.id = todoNextId;
	todoNextId++;
	todos.push(body);
	res.json(body);
	
});

app.get('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoID
	});
	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

app.delete('/todos/:id', function(req,res){
	var todoID = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos,{
		id: todoID
	});
	if(!matchedTodo){
		res.status(404).json({"error": "no todo with that id exists"});
	}else{
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}
});

app.put('/todos/:id',function(req, res){
	var todoID = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos,{
		id: todoID
	});
	var body = _.pick(req.body,'description','completed');
	var validAttributes = {};

	if(!matchedTodo){
		res.status(404).send();
	}

	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	}else if(body.hasOwnProperty('completed')){
		return res.status(400).send();
	}

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttributes.description = body.completed;
	}else if(body.hasOwnProperty('description')){
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
	
});

app.listen(PORT, function() {
	console.log('Express listening on port: ' + PORT);
})