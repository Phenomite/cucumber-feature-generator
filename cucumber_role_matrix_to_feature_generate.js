if (typeof require !== 'undefined') xlsx = require('node-xlsx');
const fs = require("fs");

if (process.argv.length <= 2) {
	console.log(`To Execute Creation of Feature Files, use 2 arguments\nLike this:\n\tnode ${__filename.split("\\")[-1]} Matrix.xlsx folder-to-place-features-in`);
	console.log("\nTODO: Export xlsx file from cucumberJS JSON report file using the same arguments to copy input sheet format.\n");
	process.exit();
}

//######################################################
//Edit this Gherkin template where needed
// - This will apply to all Feature files generated.
//######################################################
const featureName = "Feature: Test User Roles for %\n\n";
const backgroundClause = "\tScenario: Log into Portal\n\t\tGiven User logs in with role \"%\"\n\n"
const scenarioName = "\tScenario: Access rights to %\n";
const whenClause = "\t\tWhen User attempts to access \"%\"\n";
const andWhenClause = "\t\tAnd attempts to access \"%\"\n";
const thenClause = "\t\tThen User % able to %\n";
const andThenClause = "\t\tAnd User % able to %\n";
//######################################################


// Open the specified spreadsheet name from argument (must be in same folder as this script)
let spreadsheetBuffer
try {
	spreadsheetBuffer = xlsx.parse(fs.readFileSync(`${__dirname}\\` + process.argv[2])); //should handle xls/csv
} catch (exceptionMessage) {
	console.log(exceptionMessage.toString())
	process.exit();
}
var sheetRows = [];

// Looping through all sheets (should work with csv as well?)
for (var i = 0; i < spreadsheetBuffer.length; i++) {
	var sheet = spreadsheetBuffer[i];
	//loop through all rows in the sheet
	for (var j = 0; j < sheet['data'].length; j++) {
		//add the row to the rows array
		sheetRows.push(sheet['data'][j]);
	}
}

// Initial loop to get all possible actions for ACSP screens/functionality present in the matrix
var allActionsPerMatrixColumn = [];
for (var col = 0; col < sheetRows[0].length; col++) {
	if (col != 0) { // Avoid role names column
		let columnValues = [];
		for (var row = 0; row < sheetRows.length; row++) {
			if (row != 0) { // Count only actions
				if (sheetRows[row][col] != null) {
					// Spread possible mixed actions on a single cell
					columnValues.push(...sheetRows[row][col].split(","));
				}
			}
		}
		let uniqColumnValues = [...new Set(columnValues)];
		allActionsPerMatrixColumn.push(uniqColumnValues);
	}
}
console.log("DEBUG: All possible actions per screen array:");
console.log(allActionsPerMatrixColumn);


// Iterate feature files (one per row)
for (var row = 0; row < sheetRows.length; row++) {
	// Check that we arent on the first column (holds roles)
	if (row != 0) {
		let fileNameToUse = sheetRows[row][0] + "-role.feature"
		console.log("Generating :: " + sheetRows[row][0][0].toUpperCase() + sheetRows[row][0].slice(1));
		var featureText = ""; // This will house the full feature text (1 large block)
		var scenarioText = ""; // This will house newline separated scenarios (1..n)
		// Append "Feature:" Gherkin (the title)
		featureText += featureName.replace("%", sheetRows[row][0][0].toUpperCase() + sheetRows[row][0].slice(1));
		// Append "Background" Gherkin
		featureText += backgroundClause.replace("%", sheetRows[row][0].toLowerCase())


		// Iterate scenarios (one per column, or "functionality")
		for (var col = 0; col < sheetRows[0].length; col++) {
			// Check that we arent on the first column (Which should be the word "ROLE")
			if (col != 0) {
				//let rowScenarioName = "";
				scenarioText += scenarioName.replace("%", sheetRows[0][col]);
				console.log("Adding scenario to feature text");
				scenarioText += whenClause.replace("%", sheetRows[0][col]); //broken regex to split first capital .split(/([^CR](?=[A-Z]))/).join(" ")

				// Iterate over all present actions the user could perform
				// Uses allActionsPerMatrixColumn to see what actions should and shouldnt be possible for this role
				for (var actionCounter = 0; actionCounter < allActionsPerMatrixColumn[col - 1].length; actionCounter++) {
					let currentAction = allActionsPerMatrixColumn[col - 1][actionCounter].toString().trim();
					console.log(currentAction.toString());
					if (sheetRows[row][col] != null && sheetRows[row][col].split(",").includes(currentAction)) {
						// Detect if this isnt the first one and use correct Gherkin grammar!
						if (actionCounter == 0) {
							scenarioText += thenClause.replace("%", "should be").replace("%", currentAction);
						} else {
							scenarioText += andThenClause.replace("%", "should be").replace("%", currentAction);
						}
					} else {
						if (actionCounter == 0) {
							scenarioText += thenClause.replace("%", "should not be").replace("%", currentAction);
						} else {
							scenarioText += andThenClause.replace("%", "should not be").replace("%", currentAction);
						}
					}
				}
			}
		}
		// Append final combined scenario text (list of scenarios)
		featureText += scenarioText;
		console.log(fileNameToUse + " being created in directory: " + process.argv[3]);
		fs.writeFile(`${__dirname}\\` + process.argv[3] + "\\" + fileNameToUse, featureText, function (err) {
			if (err) {
				return console.log(err);
			}
		});
	}
}