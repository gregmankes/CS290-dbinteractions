var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var session = require('express-session');
var bodyParser = require('body-parser');
app.use(express.static('public'));

var mysql = require('mysql');
var pool = mysql.createPool({
    host  : 'localhost',
    user  : 'student',
    password: 'default',
    database: 'student',
    dateStrings: 'true'
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

app.get('/', function(req, res, next){
    var context = {};
    pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
        next(err);
        return;
    }
    var list = [];

    for(var row in rows){
        var toPush = {'name': rows[row].name, 'reps': rows[row].reps, 'weight': rows[row].weight, 'date':rows[row].date, 'id':rows[row].id};
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
    })
});

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
            context.results = "Table reset";
            res.render('home',context);
        })
    });
});

app.get('/insert',function(req,res,next){
  var context = {};
  pool.query("INSERT INTO `workouts` (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)", [req.query.exercise, req.query.reps, req.query.weight, req.query.date, req.query.measurement], function(err, result){
    if(err){
      next(err);
      return;
    } 

    context.inserted = result.insertId;
    res.send(JSON.stringify(context));
  });
});

app.get('/delete', function(req, res, next) {
    var context = {};
    pool.query("DELETE FROM `workouts` WHERE id = ?", [req.query.id], function(err, result) {
        if(err){
            next(err);
            return;
        }
        pool.query('SELECT * FROM `workouts`', function(err, rows, fields){
            if(err){
                next(err);
                return;
            } 
        context.results = JSON.stringify(rows);
        res.render('home',context);
        });   
    });
});

app.get('/update',function(req, res, next){
    var context = {};
    pool.query('SELECT * FROM `workouts` WHERE id=?',[req.query.id], function(err, rows, fields){
        if(err){
            next(err);
            return;
        }
        var list = [];

        for(var row in rows){
            var toPush = {'name': rows[row].name, 'reps': rows[row].reps, 'weight': rows[row].weight, 'date':rows[row].date, 'id':rows[row].id};
            if(rows[row].lbs){
                toPush.lbs = "LBS";
            }
            else{
                toPush.lbs = "KG";
            }
            list.push(toPush);
        }

        context.results = list[0];
        res.render('update', context);
    });
});

app.get('/updateBack', function(req, res, next){
    var context = {};
    pool.query("SELECT * FROM `workouts` WHERE id=?", [req.query.id], function(err, result){
        if(err){
            next(err);
            return;
        }
        if(result.length == 1){
            var curVals = result[0];
            mysql.pool.query('UPDATE `workouts` SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?', 
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
