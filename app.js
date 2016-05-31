// set up express
var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('express-session');
var bodyParser = require('body-parser');
app.use(express.static('public'));

// set up mysql database
var mysql = require('mysql');
var pool = mysql.createPool({
    host  : 'localhost',
    user  : 'student',
    password: 'default',
    database: 'student',
    dateStrings: 'true'
});

// set up handlebars and the port
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

// root page
app.get('/', function(req, res, next){
    var context = {};
    // get all the elements in the database
    pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
        next(err);
        return;
    }
    var list = [];
    // for each element in the database, we add it to a list so that we can format
    // the object to have LBS/KG instead of 1 and 0
    for(var row in rows){
        var toPush = {'name': rows[row].name, 
                    'reps': rows[row].reps, 
                    'weight': rows[row].weight, 
                    'date':rows[row].date, 
                    'id':rows[row].id};
        if(rows[row].lbs){
            toPush.lbs = "LBS";
        }
        else{
            toPush.lbs = "KG";
        }
        list.push(toPush);
    }
    // send the list into the context and render
    context.results = list;
    res.render('home', context);
    })
});

// reset table function given by teacher
app.get('/reset-table',function(req,res,next){
    var context = {};
    pool.query("DROP TABLE IF EXISTS workouts", function(err){
        var createString = "CREATE TABLE workouts("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "name VARCHAR(255) NOT NULL,"+
        "reps INT,"+
        "weight INT,"+
        "date DATE,"+
        "lbs BOOLEAN)";
        pool.query(createString, function(err){
            context.reset = "Table reset";
            res.render('home',context);
        })
    });
});

// insert get handler
app.get('/insert',function(req,res,next){
  var context = {};
  // insert the values from the request into the database
  pool.query("INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)", 
    [req.query.exercise, 
    req.query.reps, 
    req.query.weight, 
    req.query.date, 
    req.query.measurement], 
    function(err, result){
        if(err){
          next(err);
          return;
        } 
        // we then send back the inserted id so that we can use it for update and delete
        context.inserted = result.insertId;
        res.send(JSON.stringify(context));
  });
});

// The delete get handler
app.get('/delete', function(req, res, next) {
    var context = {};
    // delete the element from the database
    pool.query("DELETE FROM `workouts` WHERE id = ?", 
        [req.query.id], 
        function(err, result) {
            if(err){
                next(err);
                return;
            }
    });
});

// the first update handler
app.get('/update',function(req, res, next){
    var context = {};
    // Select the row from the database with the request's id
    pool.query('SELECT * FROM `workouts` WHERE id=?',
        [req.query.id], 
        function(err, rows, fields){
            if(err){
                next(err);
                return;
            }
            var list = [];

            // make a list of JSON objects (we only need the first one)
            // that is based on the row with the specifed id
            for(var row in rows){
                var toPush = {'name': rows[row].name, 
                            'reps': rows[row].reps, 
                            'weight': rows[row].weight, 
                            'date':rows[row].date, 
                            'lbs':rows[row].lbs,
                            'id':rows[row].id};

                list.push(toPush);
            }
        // send that object to the update.handlebars page
        context.results = list[0];
        res.render('update', context);
    });
});

// the handler for when the user is finished updating the entry
app.get('/updateBack', function(req, res, next){
    var context = {};

    // we want the user to be able to leave some values alone
    // so we set it up so that if the user changes the value,
    // we use it. Otherwise, we leave the value to its previous value
    pool.query("SELECT * FROM `workouts` WHERE id=?", 
        [req.query.id], 
        function(err, result){
            if(err){
                next(err);
                return;
            }
            if(result.length == 1){
                // get the current values from the database
                var curVals = result[0];

                // set up the checkbox for the table
                if(req.query.measurement === "on"){
                    req.query.measurement = "1";
                }
                else{
                    req.query.measurement = "0";
                }

                // make the query to the database so that we update the values in the database only if
                // the values were changed. Otherwise, leave them to their previous values
                pool.query('UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?', 
                [req.query.exercise || curVals.name, 
                req.query.reps || curVals.reps, 
                req.query.weight || curVals.weight, 
                req.query.date || curVals.date, 
                req.query.measurement, 
                req.query.id],
                function(err, result){
                    if(err){
                        next(err);
                        return;
                    }

                    // select all of the values in the database and send them to be rendered
                    pool.query('SELECT * FROM `workouts`', function(err, rows, fields){
                        if(err){
                            next(err);
                            return;
                        }
                        var list = [];

                        for(var row in rows){
                            var toPush = {'name': rows[row].name, 
                            'reps': rows[row].reps,
                            'weight': rows[row].weight, 
                            'date':rows[row].date, 
                            'id':rows[row].id};

                            if(rows[row].lbs){
                                toPush.lbs = "LBS";
                            }
                            else{
                                toPush.lbs = "KG";
                            }
                            list.push(toPush);
                        }

                        context.results = list;
                        res.render('home', context);
                    });
                });
            }
    });
});

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
