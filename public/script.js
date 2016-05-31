// add an event listener to the insert button
document.getElementById('addItemSubmit').addEventListener('click',function(event){
	
	// get the form id
	var addExercise = document.getElementById("newExercise");

	// create a request so that we can add the element to the server
	var req = new XMLHttpRequest();

	// create and append the request parameters
	var qString = "/insert";
	var parameters = "exercise="+addExercise.elements.exercise.value+
						"&reps="+addExercise.elements.reps.value+
						"&weight="+addExercise.elements.weight.value+
						"&date="+addExercise.elements.date.value;
	// console.log(parameters);
	if(addExercise.elements.measurement.checked){
		parameters+="&measurement=1";
	}
	else{
		parameters+="&measurement=0";
	}

	// open the request
	req.open("GET", qString +"?"+parameters, true);
	req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

	// set up an event listener for when the request returns
	req.addEventListener('load', function(){
		if(req.status >= 200 && req.status < 400){

			// get the new id of the inserted element
			var response = JSON.parse(req.responseText);
			var id = response.inserted;

			// get the table
			var table = document.getElementById("dataTable");

			// insert a row into the table at the end
			var row = table.insertRow(-1);

			// create a cell for the name of the exercise
			var exerciseCell = document.createElement('td');
			exerciseCell.textContent = addExercise.elements.exercise.value;
			row.appendChild(exerciseCell);

			// create a cell for the number of reps
			var repCell = document.createElement('td');
			repCell.textContent = addExercise.elements.reps.value;
			row.appendChild(repCell);

			// create a cell for the weight
			var weightCell = document.createElement('td');
			weightCell.textContent = addExercise.elements.weight.value;
			row.appendChild(weightCell);

			// if they checked the LBS checkbox, then set the text content to LBS
			// otherwise set it to KG, then create the cell
			var measurementCell = document.createElement('td');
			if(addExercise.elements.measurement.checked){
				measurementCell.textContent = "LBS"
			}
			else{
				measurementCell.textContent = "KG"
			}
			row.appendChild(measurementCell);

			// create a cell for the date
			var dateCell = document.createElement('td');
			dateCell.textContent = addExercise.elements.date.value;
			row.appendChild(dateCell);

			// These are a bit more involved. 
			// since we are redirecting to another page, 
			// add a link and then inside add a button so that the 
			// button will cause the redirect
			// to the update page with the id as a parameter
			var updateCell = document.createElement('td');
			var updateLink = document.createElement('a');
			updateLink.setAttribute('href','/update?id='+id);
			var updateButton = document.createElement('input');
			updateButton.setAttribute('type','button');
			updateButton.setAttribute('value','Update');
			updateLink.appendChild(updateButton);
			updateCell.appendChild(updateLink);
			row.appendChild(updateCell);

			// we want a delete button that calls the deleteRow function
			// so create a cell that contains two inputs, a hidden one with id
			// delete+{{this.id}} and one that calls the deleteRow funciton with
			// {{this.id}}
			var deleteCell = document.createElement('td');
			var deleteButton = document.createElement('input');
			deleteButton.setAttribute('type','button');
			deleteButton.setAttribute('name','delete');
			deleteButton.setAttribute('value','Delete');
			deleteButton.setAttribute('onClick', 'deleteRow("dataTable",'+id+')');
			var deleteHidden = document.createElement('input');
			deleteHidden.setAttribute('type','hidden');
			deleteHidden.setAttribute('id', 'delete'+id);
			deleteCell.appendChild(deleteButton);
			deleteCell.appendChild(deleteHidden);
			row.appendChild(deleteCell);


		}
		else {
	    	console.log('there was an error');
		}
	});
	
	// send request
	req.send(qString +"?"+parameters);
	event.preventDefault();
});

function deleteRow(tableId, id){
	// get the table and row count
	var table = document.getElementById(tableId);
	var rowCount = table.rows.length;

	// create a matching id for the hidden id
	var deleteString = "delete"+id;

	// loop through the rows (not including the header) to find the 
	// row with the delete cell that has a hidden input that contains
	// the id="delete{{this.id}}"
	for(var i = 1; i < rowCount; i++){
		var row = table.rows[i];
		var dataCells = row.getElementsByTagName("td");
		// console.log(dataCells);
		var deleteCell = dataCells[dataCells.length -1];
		// console.log(deleteCell);
		if(deleteCell.children[1].id === deleteString){
			// delete that row
			table.deleteRow(i);
		}

	}

	// setup and send a delete request to the server so it can delete the entry
	// from the database
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