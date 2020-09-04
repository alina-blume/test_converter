	// show metadata in console
	function getMetadataForFileList(fileList) {
		for (const file of fileList) {
			// Not supported in Safari for iOS.
			const name = file.name ? file.name : 'NOT SUPPORTED';
			// Not supported in Firefox for Android or Opera for Android.
			const type = file.type ? file.type : 'NOT SUPPORTED';
			// Unknown cross-browser support.
			const size = file.size ? file.size : 'NOT SUPPORTED';
			console.log({file, name, type, size});
		}
	}

	// start calculation after choosing file
 	const inputElement = document.getElementById("input");
    inputElement.addEventListener("change", handleFiles, false);  
	 
	 // alte Funktion
	function handleFiles() {
        const fileList1 = this.files; 
		console.log(fileList1);
        var reader = new FileReader();
		reader.readAsText(fileList1[0], 'utf-8')
		reader.onload = function(evt) {
			if (document.getElementById('Punkt').checked) {
			PunktMittelwert(evt.target.result);
			}
			else if (document.getElementById('Komma').checked) {
			KommaMittelwert(evt.target.result);
			}
			else {
				alert("'Punkt' oder 'Komma' muss ausgewählt sein");
			}
        }

    }  

/*  d3.tsv("Datensatz/Zilly_Harz.txt").then(function(data) {
	KommaMittelwert(data);
});  */


	// Header Strings
	var header = "Dateiname	Labornummer	L*(C)	a*(C)	b*(C)	u*(C)	v*(C)	C*(C)	h(C)	Munsell C Hue	Munsell C Value	Munsell C Chroma	Dominierende Wellenlänge(C)	Sättigung(C)	X(C)	Y(C)	Z(C)	x(C)	y(C)	360nm	370nm	380nm	390nm	400nm	410nm	420nm	430nm	440nm	450nm	460nm	470nm	480nm	490nm	500nm	510nm	520nm	530nm	540nm	550nm	560nm	570nm	580nm	590nm	600nm	610nm	620nm	630nm	640nm	650nm	660nm	670nm	680nm	690nm	700nm	710nm	720nm	730nm	740nm";
	console.log(header.length)
	
	function KommaMittelwert (uploadedData){
		processData(uploadedData);	
	

		function processData(daten) {
			
			var daten = d3.tsvParse(daten);
			var headerNames = d3.keys(daten[0]);
			var numberOfHeaders = headerNames.length;
			var lengthDaten = daten.length;
		
			// extract lines and convert to array
			var dataArray = [];
			for (var i=0; i<lengthDaten; i++){
				dataArray[i] = d3.values(daten[i]);
			}

			// extract sample numbers - keep only unique values
			var sampleNumbers = [];
			for (i=0; i <lengthDaten;i++) { 
				sampleNumbers[i] = dataArray[i][1];
			}
			var sampleNumbersUnique = _.uniq(sampleNumbers);
	
			// convert array back to tsv for later filtering
			var dataArrayString = "";
			for (var i = 0; i <lengthDaten; i++) { 
				dataArrayString += dataArray[i].join("	") + "\n";
			}  
			var combinedString = header + "\n" + dataArrayString;
			var combinedTSV= d3.tsvParse(combinedString);
			
			var calculatedOutput =[];
			
			// looping through whole file & calculation averages
			for (var n=0; n<sampleNumbersUnique.length; n++){	
				var filteredValues = [];
				var filteredLines=[];
				
				var colour = [];
				var colourLength;
				
				// create array of lines where sample numbers are the same
				filteredLines=_.filter(combinedTSV, { 'Labornummer': sampleNumbersUnique[n] });
				
				// convert to array
				for (var o=0; o<filteredLines.length; o++){
					filteredValues[o] = d3.values(filteredLines[o]);
				}
			
				// converting strings to numbers
				for (var i = 0; i <filteredValues.length; i++) { 
					for (var j = 2; j < numberOfHeaders; j++) { 
						if (j!=9){
							filteredValues[i][j] = parseFloat(filteredValues[i][j]);
						}
					} 
				}  
				
				// create array with colours
				for (var p = 0; p <filteredValues.length; p++) { 
					colour[p] = filteredValues[p][9];
				}  
				
				var uniqColourLength = _.uniq(colour).length;
				var Anzahl;
				var Zahl;
				var singleColour;

					
				// iterate over elements
				for (var z = 2; z < numberOfHeaders; z++) {
					Anzahl = 1;	
					Zahl = 0;
				
					if (typeof(filteredValues[0][z]) === "number"){	
						Zahl = filteredValues[0][z]; 
					}
					

					
					// compare line 1 with following lines
					for (y=1; y < filteredValues.length; y++) {
						
						// if sample numbers are not the same 
						if (filteredValues[0][1] !== filteredValues[y][1]){
							break;
						// if sample numbers are the same & both element entries are values
						} else if (filteredValues[0][1] === filteredValues[y][1] && typeof(filteredValues[0][z]) === "number" && typeof(filteredValues[y][z]) === "number") {
							Anzahl++;
							Zahl += filteredValues[y][z];
						// if sample numbers are the same & one element entry is a value
						} else if (filteredValues[0][1] === filteredValues[y][1] && typeof(filteredValues[0][z]) !== "number" && typeof(filteredValues[y][z]) === "number"){
							Zahl += filteredValues[y][z];
						// if sample numbers are the same & one element entry is a value
						} else if (filteredValues[0][1] === filteredValues[y][1] && typeof(filteredValues[0][z]) === "number" && typeof(filteredValues[y][z]) !== "number"){
							break;
						// if sample numbers are the same & non of the element entries is a value
						} else if (filteredValues[0][1] === filteredValues[y][1] && typeof(filteredValues[0][z]) !== "number" && typeof(filteredValues[y][z]) !== "number"){
							break;
						}
						

					// do math 
					if (Zahl !== 0 && typeof(filteredValues[0][z] === "number")){	
						filteredValues[0][z] = Zahl/Anzahl; 
					} else if (Zahl === 0 && typeof(filteredValues[0][z] === "number")) {
						filteredValues[0][z] = "Not available"; // wenn was komisch in Zahlen
					} 
					
									
				// colour					
					if (Zahl<3){
					singleColour = colour[0];
					} else if (Zahl === uniqColourLength) {
					singleColour = colour[0];
					} else {
					singleColour = returnMostOccurring(colour);
					}
				
					filteredValues[0][9]=singleColour[0];
					}
				}
				
			// push line with calculated value to new array
			calculatedOutput.push(filteredValues[0]);	
		
			}
			
			// only keep 4 decimal places unless even number, then 0 & . to ,
			for (var i = 0; i <calculatedOutput.length; i++) { 
				for (var j = 2; j < numberOfHeaders; j++) { 
					if (typeof(calculatedOutput[i][j]) === "number"){
						calculatedOutput[i][j] = calculatedOutput[i][j].toFixed(2);
					}
					if (calculatedOutput[i][j].includes(".00") === true){
						calculatedOutput[i][j] = calculatedOutput[i][j].replace(".00", "");
					}
					if (calculatedOutput[i][j].includes(".") === true){
						calculatedOutput[i][j] = calculatedOutput[i][j].replace(".", ",");
					}
								
				} 
			}     
	

			// array to string 
			var calculatedOutputString= "";
			for (var i = 0; i <calculatedOutput.length; i++) { 
				calculatedOutputString += (calculatedOutput[i].join("	") + "\n");
			}  
			
			// join headers and data
			var finalOutput = header+ "\n" + calculatedOutputString; 
	
			// save as local txt
			var file = new File([finalOutput], "TEST_Komma.txt", {type: "text/plain;charset=utf-8"});
			saveAs(file); 
		}  
 

	function returnMostOccurring(arr) {
		const obj = {};
		arr.forEach(item => {
			if(!obj[item]) obj[item] = 1;
			else obj[item]++;
			})
		const res =  Object.entries(obj).sort((a,b) => b[1]-a[1]);
		return res.shift();
	}
	
   	
}	

function PunktMittelwert (uploadedData){
		processData(uploadedData);	
	

		function processData(daten) {
			var daten = d3.tsvParse(daten);
			var headerNames = d3.keys(daten[0]);
			var numberOfHeaders = headerNames.length;
			var lengthDaten = daten.length;
		
			// extract lines and convert to array
			var dataArray = [];
			for (var i=0; i<lengthDaten; i++){
				dataArray[i] = d3.values(daten[i]);
			}

			// extract sample numbers - keep only unique values
			var sampleNumbers = [];
			for (i=0; i <lengthDaten;i++) { 
				sampleNumbers[i] = dataArray[i][1];
			}
			var sampleNumbersUnique = _.uniq(sampleNumbers);
	
			// convert array back to tsv for later filtering
			var dataArrayString = "";
			for (var i = 0; i <lengthDaten; i++) { 
				dataArrayString += dataArray[i].join("	") + "\n";
			}  
			var combinedString = header + "\n" + dataArrayString;
			var combinedTSV= d3.tsvParse(combinedString);
			
			var calculatedOutput =[];
			
			// looping through whole file & calculation averages
			for (var n=0; n<sampleNumbersUnique.length; n++){	
				var filteredValues = [];
				var filteredLines=[];
				
				var colour = [];
				var colourLength;
				
				// create array of lines where sample numbers are the same
				filteredLines=_.filter(combinedTSV, { 'Labornummer': sampleNumbersUnique[n] });
				
				// convert to array
				for (var o=0; o<filteredLines.length; o++){
					filteredValues[o] = d3.values(filteredLines[o]);
				}
			
				// converting strings to numbers
				for (var i = 0; i <filteredValues.length; i++) { 
					for (var j = 2; j < numberOfHeaders; j++) { 
						if (j!=9){
							filteredValues[i][j] = parseFloat(filteredValues[i][j]);
						}
					} 
				}  
				
				// create array with colours
				for (var p = 0; p <filteredValues.length; p++) { 
					colour[p] = filteredValues[p][9];
				}  
				
				var uniqColourLength = _.uniq(colour).length;
				var Anzahl;
				var Zahl;
				var singleColour;

					
				// iterate over elements
				for (var z = 2; z < numberOfHeaders; z++) {
					Anzahl = 1;	
					Zahl = 0;
				
					if (typeof(filteredValues[0][z]) === "number"){	
						Zahl = filteredValues[0][z]; 
					}
									
					// compare line 1 with following lines
					for (y=1; y < filteredValues.length; y++) {
						
						// if sample numbers are not the same 
						if (filteredValues[0][1] !== filteredValues[y][1]){
							break;
						// if sample numbers are the same & both element entries are values
						} else if (filteredValues[0][1] === filteredValues[y][1] && typeof(filteredValues[0][z]) === "number" && typeof(filteredValues[y][z]) === "number") {
							Anzahl++;
							Zahl += filteredValues[y][z];
						// if sample numbers are the same & one element entry is a value
						} else if (filteredValues[0][1] === filteredValues[y][1] && typeof(filteredValues[0][z]) !== "number" && typeof(filteredValues[y][z]) === "number"){
							Zahl += filteredValues[y][z];
						// if sample numbers are the same & one element entry is a value
						} else if (filteredValues[0][1] === filteredValues[y][1] && typeof(filteredValues[0][z]) === "number" && typeof(filteredValues[y][z]) !== "number"){
							break;
						// if sample numbers are the same & non of the element entries is a value
						} else if (filteredValues[0][1] === filteredValues[y][1] && typeof(filteredValues[0][z]) !== "number" && typeof(filteredValues[y][z]) !== "number"){
							break;
						}
						

					// do math 
					if (Zahl !== 0 && typeof(filteredValues[0][z] === "number")){	
						filteredValues[0][z] = Zahl/Anzahl; 
					} else if (Zahl === 0 && typeof(filteredValues[0][z] === "number")) {
						filteredValues[0][z] = "Not available"; // wenn was komisch in Zahlen
					} 
					
									
				// colour					
					if (Zahl<3){
					singleColour = colour[0];
					} else if (Zahl === uniqColourLength) {
					singleColour = colour[0];
					} else {
					singleColour = returnMostOccurring(colour);
					}
				
					filteredValues[0][9]=singleColour[0];
					}
				}
				
			// push line with calculated value to new array
			calculatedOutput.push(filteredValues[0]);	
		
			}
			
			// only keep 4 decimal places unless even number, then 0 & . to ,
			for (var i = 0; i <calculatedOutput.length; i++) { 
				for (var j = 2; j < numberOfHeaders; j++) { 
					if (typeof(calculatedOutput[i][j]) === "number"){
						calculatedOutput[i][j] = calculatedOutput[i][j].toFixed(2);
					}
					if (calculatedOutput[i][j].includes(".00") === true){
						calculatedOutput[i][j] = calculatedOutput[i][j].replace(".00", "");
					}								
				} 
			}     
	

			// array to string 
			var calculatedOutputString= "";
			for (var i = 0; i <calculatedOutput.length; i++) { 
				calculatedOutputString += (calculatedOutput[i].join("	") + "\n");
			}  

			// join headers and data
			var finalOutput = header+ "\n" + calculatedOutputString; 
	
			// save as local txt
			var file = new File([finalOutput], "TEST_Punkt.txt", {type: "text/plain;charset=utf-8"});
			saveAs(file); 
		}  
 

	function returnMostOccurring(arr) {
		const obj = {};
		arr.forEach(item => {
			if(!obj[item]) obj[item] = 1;
			else obj[item]++;
			})
		const res =  Object.entries(obj).sort((a,b) => b[1]-a[1]);
		return res.shift();
	}
	
   	
}	 