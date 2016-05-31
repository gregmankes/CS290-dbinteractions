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

	req.open("GET", qString +"?"+parameters, true);
	req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

	req.addEventListener('load', function(){
		if(req.status >= 200 && req.status < 400){
			var response = JSON.parse(req.responseText);
			var id = response.inserted;

			var table = document.getElementById("dataTable");

			var row = table.insertRow(-1);

			var exerciseCell = document.createElement('td');
			exerciseCell.textContent = addExercise.elements.exercise.value;
			row.appendChild(exerciseCell);

			var repCell = document.createElement('td');
			repCell.textContent = addExercise.elements.reps.value;
			row.appendChild(repCell);

			var weightCell = document.createElement('td');
			weightCell.textContent = addExercise.elements.weight.value;
			row.appendChild(weightCell);

			var dateCell = document.createElement('td');
			dateCell.textContent = addExercise.elements.date.value;
			row.appendChild(dateCell);

			var measurementCell = document.createElement('td');
			if(addExercise.elements.measurement.checked){
				measurementCell.textContent = "LBS"
			}
			else{
				measurementCell.textContent = "KG"
			}
			row.appendChild(measurementCell);

			var updateCell = document.createElement('td');
			var updateLink = document.createElement('a');
			updateLink.setAttribute('href','/update?id='+id);
			var updateButton = document.createElement('input');
			updateButton.setAttribute('type','button');
			updateButton.setAttribute('value','Update');
			updateLink.appendChild(updateButton);
			updateCell.appendChild(updateLink);
			row.appendChild(updateCell);

		}
		else {
	    	console.log('there was an error');
		}
	});

	req.send(qString +"?"+parameters);
	event.preventDefault();
});

function deleteRow(tableId, id){
	var table = document.getElementById(tableId);
	var rowCount = table.rows.length;

	var deleteString = "delete"+id;
	for(var i = 1; i < rowCount; i++){
		var row = table.rows[i];
		var dataCells = row.getElementsByTagName("td");
		console.log(dataCells);
		var deleteCell = dataCells[dataCells.length -1];
		console.log(deleteCell);
		if(deleteCell.children[1].id === deleteString){
			table.deleteRow(i);
		}

	}

	var req = new XMLHttpRequest();
	var qString = "/delete";

	req.open("GET", qString+"?id="+id, true);

	req.addEventListener("load",function(){
		if(req.status >= 200 && req.status < 400){
	    console.log('delete request sent');
		} else {
		    console.log('there was an error');
		}
	});

	req.send(qString+"?id="+id );

}