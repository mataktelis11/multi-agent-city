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

function checkForm(){
	var dims = parseInt(document.getElementById("typeNumber1").value);
	var _numagents = parseInt(document.getElementById("typeNumber2").value);
	var _numgoals = parseInt(document.getElementById("typeNumber3").value);
	var _numwalls = parseInt(document.getElementById("typeNumber4").value);
	var _numpots = parseInt(document.getElementById("typeNumber5").value);


	var numbers = [dims, _numagents, _numgoals, _numwalls, _numpots];

	for(var i=0; i<numbers.length; i++){
		if(numbers[i]<=0 || isNaN(numbers[i]))
			return "All input parameters must be positive integers";
	}

	return "";
}
