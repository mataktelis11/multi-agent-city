// sources: 
// https://www.geeksforgeeks.org/how-to-export-html-table-to-csv-using-javascript/
// https://plantpot.works/4954#:~:text=You%20can%20get%20the%20number,rows

function tableToCSV(tableId) {

    var csv_data = [];

    var table = document.getElementById(tableId)

    for (var row of table.rows) {
        var csvrow = [];
        for(var cell of row.cells){
           //console.log(cell.innerText);
           csvrow.push(cell.innerHTML);
        }
        csv_data.push(csvrow.join(","));
    }
    csv_data = csv_data.join('\n');
    return csv_data;
}

function downloadCSVFile(csv_data) {

	// Create CSV file object and feed csv_data into it
	CSVFile = new Blob([csv_data], { type: "text/csv" });

	// Create to temporary link to initiate download process
	var temp_link = document.createElement('a');

	// Download csv file
	temp_link.download = "raw.csv";
	var url = window.URL.createObjectURL(CSVFile);
	temp_link.href = url;

	// This link should not be displayed
	temp_link.style.display = "none";
	document.body.appendChild(temp_link);

	// Automatically click the link to trigger download
	temp_link.click();
	document.body.removeChild(temp_link);
}

function uniteMemories(memory1, memory2){
	var result = [];
	for(var i=0; i<memory1.length; i++){
		var row = [];
		for(var j=0; j<memory1[i].length; j++){
			row.push(memory1[i][j]||memory2[i][j])
		}
		result.push(row)
	}
	return result;
}

function checkForm() {
	var dims = parseInt(document.getElementById("typeNumber1").value);
	var _numagents = parseInt(document.getElementById("typeNumber2").value);
	var _numgoals = parseInt(document.getElementById("typeNumber3").value);
	var _numwalls = parseInt(document.getElementById("typeNumber4").value);
	var _numpots = parseInt(document.getElementById("typeNumber5").value);
	var _numtokens = parseInt(document.getElementById("typeNumber6").value);
	var _agentbaseEnergy = parseInt(document.getElementById("typeNumber7").value);
	var _mapprice = parseInt(document.getElementById("typeNumber8").value);
	var _potprice = parseInt(document.getElementById("typeNumber9").value);
	var _potenergy = parseInt(document.getElementById("typeNumber10").value);
	var _delay = parseInt(document.getElementById("typeNumber11").value);


	var numbers = [dims, _numagents, _numgoals, _numwalls, _numpots,
					_numtokens, _agentbaseEnergy, _mapprice, _potprice,
					_potenergy, _delay];

	for(var i=0; i<numbers.length; i++){

		if(isNaN(numbers[i]))
			continue;

		if(numbers[i]<=0)
			return "All input parameters must be positive integers.";
	}

	if(dims*dims < _numagents + _numgoals + _numwalls + _numpots + _numtokens)
		return "Map dimensions are too small to fit all the entities."

	return "";
}
