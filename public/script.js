document.getElementById('addItemSubmit').addEventListener('click',function(event){
	
	var addExercise = document.getElementById("newExercise");

	var req = new XMLHttpRequest();

	var qString = "/insert";
	var parameters = "exercise="+addExercise.elements.exercise.value+
						"&reps="+addExercise.elements.reps.value+
						"&weight="+addExercise.elements.weight.value+
						"&date="+addExercise.elements.date.value;
	console.log(parameters);
	if(addExercise.elements.measurement.checked){
		parameters+="&measurement=1";
	}
	else{
		parameters+="&measurement=0";
	}

	req.open("GET", qString +"?"+parameters);
	req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

	req.addEventListener('load', function(){
		if(req.status >= 200 && req.status < 400){
			var table = document.getElementById("dataTable");

			var row = table.insertRow(-1);

			var exerciseCell = document.createElement('td');
			exerciseCell.textContent = addExercise.elements.exercise.value;
			row.append(exerciseCell);

			var repCell = document.createElement('td');
			repCell.textContent = addExercise.elements.reps.value;
			row.append(repCell);

			var weightCell = document.createElement('td');
			weightCell.textContent = addExercise.elements.weight.value;
			row.append(weightCell);

			var dateCell = document.createElement('td');
			dateCell.textContent = addExercise.elements.date.value;
			row.append(dateCell);

			var measurementCell = document.createElement('td');
			if(addExercise.elements.measurement.checked){
				measurementCell.textContent = "KG"
			}
			else{
				measurementCell.textContent = "LBS"
			}
			row.append(measurementCell);
		}
		else {
	    	console.log('there was an error');
		}
	});

	req.send();
	event.preventDefault();
});