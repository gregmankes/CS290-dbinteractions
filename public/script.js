document.getElementById('addItemSubmit').addEventListener('click',function(event){
	event.preventDefault();

	var addExercise = document.getElementById("newExercise");

	var req = new XMLHttpRequest();

	var qString = "/insert";
	var parameters = "exercise="+addExercise.elements.exercise.value+
						"&reps="+addExercise.elements.reps.value+
						"&weight="+addExercise.elements.weight.value+
						"&date="+addExercise.elements.date.value+
	if(addExercise.elements.measurement.checked){
		parameters+="&measurement=1";
	}
	else{
		parameters+="&measurement=0";
	}

	req.open("GET", qString +"?"+parameters);
	req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');

	
});