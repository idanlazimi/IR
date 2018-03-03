//maybe_now copy
var start = function () {
	var documentArray = [], filePathInput, fileName, lines, nameDoc, nameAuthor, arrayName = [], arrayAuthor = [], file, string, stopListArray = [];
	var idCounter = 1
	//localStorage.setItem("idCounter", idCounter);
	var arraySummery = [], countDocResult = 0, counterAddDoc = 0, arrayDownloadName = [], uniqueWords = [], idCounter, flagShow = 0;
	var paraShow = document.getElementById('allDocument');
	var wrapper = document.getElementById('page-wrapper');
	var fileDisplayArea1 = document.getElementById('fileDisplayArea');
	window.onload = function () {
		initDatabase();
		var fileInput = document.getElementById('fileInput'), buzzWord = document.getElementById('searchLine');
		var search = document.getElementById('searchButton');
		fileInput.addEventListener('change', function (e) {
			file = fileInput.files[0];
			var textType = /text.*/;
			if (file.type.match(textType)) {
				var reader = new FileReader();
				reader.onload = function (e) {
					string = reader.result;
					filePathInput = $("#fileInput").val();
					fileName = filePathInput.substring(12);
					//get the stop list from file
					if (fileName == "StopList.txt") {
						lines = string.split(',');
						stopListArray = lines;
						downloadFile(fileName, string)
					}
					if (fileName != "StopList.txt") {
						lines = string.split('\n');
						nameDoc = lines[0].substring(1);
						nameAuthor = lines[1].substring(1);
						//add name of doc to name array
						arrayName.push(nameDoc);
						//add author of doc to author array
						arrayAuthor.push(nameAuthor);
						//add description to description array
						//arraySummery.push(lines[3] + "\n" + lines[4] + "\n" + lines[5] + "\n");
						arrayDownloadName.push(fileName);
						//add the document to array
						documentArray.push(string);
						//add to the list Attached documents
						var divAdd = document.getElementById('documentAdded'), nameItem = nameDoc, addedDoc, nameDocument;
						addedDoc = document.createElement("LI");
						nameDocument = document.createTextNode((counterAddDoc + 1) + ". " + nameItem + " ");
						var buttonDelete = document.createElement("input");
						buttonDelete.type = "button";
						buttonDelete.value = "delete";
						buttonDelete.setAttribute("id", counterAddDoc + 1);
						//delete the document from Db
						buttonDelete.onclick = function () {
							getRowDelete1 = function (val) {
								myDatabase.transaction(function (transaction) {
									transaction.executeSql('DELETE FROM Document WHERE idDoc = ?;', [val], printRowDocDetails, errorHandler);
									transaction.executeSql('DELETE FROM IndexFile WHERE idDoc = ?;', [val], printRowDocDetails, errorHandler);
								});
							};
							var printRowDocDetails = function (transaction, results) {
							};
							getRowDelete1(this.id);
							this.style.visibility = "hidden";
							addedDoc.style.visibility = "hidden";
						};
						addedDoc.appendChild(nameDocument);
						addedDoc.appendChild(buttonDelete);
						divAdd.appendChild(addedDoc);
						counterAddDoc++;
					}
				}
				reader.readAsText(file);
			} else {
				fileDisplayArea.innerText = "File not supported!";
			}
		});
		//split the words
		function splitToWord(str) {
			stringWithoutDelimiter = str.replace(/\s\s+/g, ' ');
			var words = stringWithoutDelimiter.split(/[.,():;""# ]+/);
			return words;
		}
		//get array and return the array with the words without duplicate
		function uniqueWordFunc(str) {
			for (var i = 0, j = str.length; i < j; i++) {
				if (str[i][0] != null) {
					if (str[i][0] == str[i][0].toUpperCase()) {
						str[i] = str[i].toLowerCase();
					}
				}
			}
			$.each(str, function (i, el) {
				if ($.inArray(el, uniqueWords) === -1) uniqueWords.push(el);
			});
			return uniqueWords;
		}
		//the hit per word
		function performances(words) {
			var performances = {};
			for (var i = 0, j = words.length; i < j; i++) {
				performances[words[i]] = (performances[words[i]] || 0) + 1;
			}
			return performances;
		}
		function downloadFile(nameF, stringDoc) {
			//download the file to storage
			var element = document.createElement('a');
			element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(stringDoc));
			element.setAttribute('download', nameF);
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
		}

		function deleteFile(file_name) {
			$.ajax({
				url: 'delete.php',
				data: ('C:\\Users\\Dell\\Desktop\\maybe_now\\information%20retrieval\\source\\' + file_name),
				method: 'GET',
				success: function (response) {
					if (response === 'deleted') {
						alert('Deleted !!');
					}
				}
			});
		}
		function moveFile(srcFile, dest) {

			var object = new ActiveXObject("Scripting.FileSystemObject");
			var file = object.GetFile(srcFile);
			file.Move(dest);
			document.write("File is moved successfully");

		}
		//display admin options
		document.getElementById("admin").addEventListener("click", function () {
			var user1 = "admin";
			var username = prompt('Enter Username:');
			if (username == user1) {
				var pass1 = "admin";
				password = prompt('Enter Password:');
				if (password == pass1) {
					document.getElementById("addOneFile").style.display = "table-cell";

					document.getElementById("deleteDB").style.display = "inline-block";
					document.getElementById("fileInput").style.display = "inline-block";
					//alert("correct!")
				}
				else {
					alert("wrong password!")
				}
			}
			else {
				alert("wrong user name!")
			}
		});
		//help button
		document.getElementById("help").addEventListener("click", function () {
			$('#page-wrapper').append('<div id="liteboxInfo"> <button id="exitInfoDetails" href="#">X</button> <pre id = "helpPre"><h4>About</h4>On page refresh - Sign in as admin and click "delete DB" button.<br> sign in again to upload stopList files by clicking "choose file" and then "upload file".<br>After stopList is uploaded, start uploading files in the same way.<br>Search Options::<br> - single_word<br> - word1 || word2 (word1 OR word2) <br> - word1 && word2 (word1 AND word2))<br> - !word (not operator) <br> - (w1 && w2) || w3 <br>w1 ||(w2 || w3)<br> - ! (w1 && w2)<br></pre> </div>');
			$('#liteboxInfo').fadeIn();
			$('#exitInfoDetails').click(function () {
				$('#liteboxInfo').fadeOut(function () {
					$(this).remove();
				});
			});
		});
		//add one documents to Db
		document.getElementById("addOneFile").addEventListener("click", function () {
			//splite the string  to word
			var words = splitToWord(string);
			//var idCounter = localStorage.getItem("idCounter");
			//array with unique word not duplicate
			var uniqueArr = uniqueWordFunc(words);
			//the number of performances
			var perf = performances(words);
			for (j = 0; j < uniqueArr.length; j++) {
				if (perf[uniqueArr[j]] != null && uniqueArr[j] != '') {
					addIndexFile(idCounter, uniqueArr[j], perf[uniqueArr[j]]);
				}
			}
			addDocument(idCounter, nameDoc, nameAuthor, ("file:///C:/Users/Dell/Downloads/" + fileName));
			sortAll();
			downloadFile(fileName, string);
			var loc = window.location.pathname;
			var dir = loc.substring(0, loc.lastIndexOf('/'));
			//alert("C:\\Users\\Dell\\Desktop\\maybe_now\\information%20retrieval\\source\\" + fileName);
			//moveFile("C:\\Users\\Dell\\Desktop\\maybe_now\\information%20retrieval\\source\\" + fileName, "C:\\Users\\Dell\\Desktop\\maybe_now\\information%20retrieval\\storage\\");
			deleteFile(fileName);
			idCounter++;
			//localStorage.setItem("idCounter",idCounter);
		});
		//delete the data in DB
		document.getElementById("deleteDB").addEventListener("click", function () {
			dropTables();
		});
		//the search button action
		document.getElementById("searchButton").addEventListener("click", function () {
			deleteTheResults();
			var wordSearch, numberDoc = [], wordBuzz = [], checkWord = [], arrQueue = [], wordBuzzNew = [], flagBrackets = 0;
			wordSearch = buzzWord.value;
			var flagCheckStopList = checkIfInStopList(wordSearch);
			wordSearch = wordSearch.replace(/"/g, '');
			checkWord = wordSearch.split(/[&&||! ]+/);
			if (flagCheckStopList == 1) {
				printNoResults();
			}
			if (flagCheckStopList == 0) {
				if (wordSearch.includes("&&") && (checkWord.length == 2) && (!wordSearch.includes("!"))) {
					andQuery();
				}
				if (wordSearch.includes("||") && (checkWord.length == 2) && (!wordSearch.includes("!"))) {
					orQuery();
				}
				if (wordSearch.includes("!") && checkWord[0] == '' && (checkWord.length == 2)) {
					notQuery();
				}
				if (((wordSearch.includes("&&") && wordSearch.includes("||")) ||
					(wordSearch.includes("&&") && wordSearch.includes("&&")) ||
					(wordSearch.includes("||") && wordSearch.includes("||"))) && (checkWord.length > 2)) {
					//check the location of brackets
					wordBuzzNew = wordSearch.split(/[)&&||!( ]+/);
					if (wordBuzzNew[0] == '') {
						flagBrackets = 1;
					}
					if (wordBuzzNew[3] == '') {
						flagBrackets = 2;
					}
					//for decide the order of the operator
					for (var j = 0; j < wordSearch.length; j++) {
						if (wordSearch[j] == '&') {
							arrQueue.push(wordSearch[j]);
						}
						if (wordSearch[j] == '|') {
							arrQueue.push(wordSearch[j]);
						}
						if (wordSearch[j] == '!') {
							arrQueue.push(wordSearch[j]);
						}
					}
					if (flagBrackets == 1) {
						bracketsQueryFour(wordBuzzNew[1], wordBuzzNew[2], wordBuzzNew[3], arrQueue[0], arrQueue[2], flagBrackets);
					}
					if (flagBrackets == 2) {
						bracketsQueryFour(wordBuzzNew[0], wordBuzzNew[1], wordBuzzNew[2], arrQueue[0], arrQueue[2], flagBrackets);
					}
				}
				if ((wordSearch.includes("!") && wordSearch.includes("||"))
					|| (wordSearch.includes("!") && wordSearch.includes("&&"))) {
					if (arrQueue[0] == '!') {
						if (arrQueue[2] == '|') {
							orQuery();
						}
					}
					if (arrQueue[0] == '!') {
						if (arrQueue[2] == '&') {
							andQuery();
						}
					}
				}	//one word search
				else if (checkWord[1] == null) {
					wordBuzz[0] = wordSearch;
					oneWordQuery(wordSearch);
				}
			}
			//check if the input from user is one of the word  of stop list 
			function checkIfInStopList(wordSrc) {
				var wordsApostrophes = [], wordWithoutApoArr = [], flagStopList = 0;
				wordsApostrophes = wordSrc.split(/[&&()!|| ]+/);
				var stopList = stopListArray;
				for (var i = 0; i < wordsApostrophes.length; i++) {
					if (!(wordsApostrophes[i].includes('"')) && wordsApostrophes[i] != '') {
						wordWithoutApoArr.push(wordsApostrophes[i]);
					}
				}
				for (var j = 0; j < wordWithoutApoArr.length; j++) {
					for (var k = 0; k < stopList.length; k++) {
						if (wordWithoutApoArr[j] == stopList[k]) {
							var reg = new RegExp(stopList[k], "g");
							wordSearch = wordSearch.replace(reg, " ");
							flagStopList = 1;
						}
					}
				}
				return flagStopList;
			}
			//function that return array without duplicate array
			var noDuplicate = function (numbers) {
				var uniqueNumbers = [];
				$.each(numbers, function (i, el) {
					if ($.inArray(el, uniqueNumbers) === -1) uniqueNumbers.push(el);
				});
				return uniqueNumbers;
			}
			//all the option that have  two operator (without NOT operator)
			function bracketsQueryFour(word1, word2, word3, opr1, opr2, flagBrackets) {
				if (opr1 == '&' && opr2 == '|') {
					if (flagBrackets == 1) {
						andFirstBracketFirst(word1, word2, word3);
					}
					if (flagBrackets == 2) {
						andFirstBraketsSecond(word1, word2, word3);
					}
				}
				if (opr1 == '|' && opr2 == '&') {
					if (flagBrackets == 1) {
						andFirstBraketsSecond(word3, word1, word2);
					}
					if (flagBrackets == 2) {
						andFirstBracketFirst(word2, word3, word1);
					}
				}
				if (opr1 == '&' && opr2 == '&') {
					if (flagBrackets == 1 || flagBrackets == 2) {
						sameOperator(word1, word2, word3, 1);
					}
				}
				if (opr1 == '|' && opr2 == '|') {
					if (flagBrackets == 1 || flagBrackets == 2) {
						sameOperator(word1, word2, word3, 2);
					}
				}
			}
			//treat the option that have the same operator for example (word1 && word2) && word3 
			function sameOperator(word1, word2, word3, flag) {
				myDatabase.transaction(function (tx) {
					var newBuzzWord = [];
					newBuzzWord = wordSearch.split(/[&&()|| ]+/);
					if (flagBrackets == 1) {
						for (var i = 1; i < newBuzzWord.length; i++) {
							wordBuzz[i - 1] = newBuzzWord[i];
						}
					}
					if (flagBrackets == 2) {
						for (var i = 0; i < 3; i++) {
							wordBuzz[i] = newBuzzWord[i];
						}
					}
					tx.executeSql('SELECT * FROM IndexFile WHERE word = ? OR word = ? ', [word1, word2], function (tx, results) {
						if (results.rows.length == 0 || results == null || results.rows == null) {
							printNoResults();
						}
						if (results != null && results.rows != null) {
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								numberDoc[i] = row['idDoc'];
							}
							var numberDocNew = [];
							if (flag == 1) {
								numberDocNew = findDuplicate(numberDoc);
							}
							if (flag == 2) {
								numberDocNew = noDuplicate(numberDoc);
							}
							var getSameOp = function (val) {
								myDatabase.transaction(function (transaction) {
									transaction.executeSql('SELECT * FROM IndexFile WHERE word = ?;', [val], printSameOp, errorHandler);
								});
							};
							var printSameOp = function (transaction, resu) {
								var numberFromQuery = [], uniqueNumbers = [];;
								for (var i = 0; i < resu.rows.length; i++) {
									var rowDocument = resu.rows.item(i);
									numberFromQuery.push(rowDocument['idDoc']);
								}
								for (var j = 0; j < numberDocNew.length; j++) {
									numberFromQuery.push(numberDocNew[j]);
								}
								if (flag == 1) {
									uniqueNumbers = findDuplicate(numberFromQuery);
								}
								if (flag == 2) {
									uniqueNumbers = noDuplicate(numberFromQuery);
								}
								if (uniqueNumbers[0] == null) {
									printNoResults();
								}
								for (var k = 0; k < uniqueNumbers.length; k++) {
									getAndRow(uniqueNumbers[k]);
								}
							};
							getSameOp(word3);
						}
						else {
							alert("null");
						}
					}, null);
				});
			}
			//AND first
			function andFirstBracketFirst(word1, word2, word3) {
				myDatabase.transaction(function (tx) {
					var newBuzzWord = [];
					newBuzzWord = wordSearch.split(/[&&()|| ]+/);
					if (flagBrackets == 1) {
						for (var i = 1; i < newBuzzWord.length; i++) {
							wordBuzz[i - 1] = newBuzzWord[i];
						}
					}
					if (flagBrackets == 2) {
						for (var i = 0; i < 3; i++) {
							wordBuzz[i] = newBuzzWord[i];
						}
					}
					tx.executeSql('SELECT * FROM IndexFile WHERE word = ? OR word = ? ', [word1, word2], function (tx, results) {
						if (results.rows.length == 0 || results == null || results.rows == null) {
							printNoResults();
						}
						if (results != null && results.rows != null) {
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								numberDoc[i] = row['idDoc'];
							}
							var numberDocNew = [];
							numberDocNew = findDuplicate(numberDoc);
							var getFirstFirst = function (val) {
								myDatabase.transaction(function (transaction) {
									transaction.executeSql('SELECT * FROM IndexFile WHERE word = ?;', [val], printFirstFirst, errorHandler);
								});
							};
							var printFirstFirst = function (transaction, resu) {
								var numberFromQuery = [], uniqueNumbers = [];
								for (var i = 0; i < resu.rows.length; i++) {
									var rowDocument = resu.rows.item(i);
									numberFromQuery.push(rowDocument['idDoc']);
								}
								for (var j = 0; j < numberDocNew.length; j++) {
									numberFromQuery.push(numberDocNew[j]);
								}
								uniqueNumbers = noDuplicate(numberFromQuery);
								for (var k = 0; k < uniqueNumbers.length; k++) {
									getAndRow(uniqueNumbers[k]);
								}
							};
							getFirstFirst(word3);
						}
						else {
							alert("null");
						}
					}, null);
				});
			}
			//or first
			function andFirstBraketsSecond(word1, word2, word3) {
				myDatabase.transaction(function (tx) {
					var newBuzzWord = [];
					newBuzzWord = wordSearch.split(/[&&()|| ]+/);
					if (flagBrackets == 2) {
						for (var i = 0; i < 3; i++) {
							wordBuzz[i] = newBuzzWord[i];
						}
					}
					if (flagBrackets == 1) {
						for (var i = 1; i < newBuzzWord.length; i++) {
							wordBuzz[i - 1] = newBuzzWord[i];
						}
					}
					tx.executeSql('SELECT * FROM IndexFile WHERE word = ? OR word = ? ', [word2, word3], function (tx, results) {
						if (results.rows.length == 0) {
							printNoResults();
						}
						if (results != null && results.rows != null) {
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								numberDoc[i] = row['idDoc'];
							}
							var numberDocNew = [];
							numberDocNew = noDuplicate(numberDoc);
							var getFirstSecond = function (val) {
								myDatabase.transaction(function (transaction) {
									transaction.executeSql('SELECT * FROM IndexFile WHERE word = ?;', [val], printFirstSecond, errorHandler);
								});
							};
							var printFirstSecond = function (transaction, resu) {
								var numberFromQuery = [], uniqueNumbers = [];
								for (var i = 0; i < resu.rows.length; i++) {
									var rowDocument = resu.rows.item(i);
									numberFromQuery.push(rowDocument['idDoc']);
								}
								for (var j = 0; j < numberDocNew.length; j++) {
									numberFromQuery.push(numberDocNew[j]);
								}
								uniqueNumbers = findDuplicate(numberFromQuery);
								for (var k = 0; k < uniqueNumbers.length; k++) {
									getAndRow(uniqueNumbers[k]);
								}
							};
							getFirstSecond(word1);
						}
						else {
							alert("null");
						}
					}, null);
				});
			}
			//one word searching
			function oneWordQuery(wordBuzz) {
				myDatabase.transaction(function (tx) {
					tx.executeSql('SELECT * FROM IndexFile WHERE word = ?;', [wordBuzz], function (tx, results) {
						if (results.rows.length == 0) {
							printNoResults();
						}
						if (results != null && results.rows != null) {
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								numberDoc[i] = row['idDoc'];
							}
							for (var k = 0; k < numberDoc.length; k++) {
								getAndRow(numberDoc[k]);
							}
						}
						else {
							alert("nulll");
						}
					}, null);
				});
			}
			//or operator
			function orQuery() {
				myDatabase.transaction(function (tx) {
					var firstParse = [];
					firstParse = wordSearch.split(/[||)(! ]+/);
					if (arrQueue[0] != '!') {
						wordBuzz = firstParse;
					}
					if (arrQueue[2] == '|' && arrQueue[0] == '!') {
						wordBuzz[0] = firstParse[1];
						wordBuzz[1] = firstParse[2];
					}
					tx.executeSql('SELECT * FROM IndexFile WHERE ( word = ? OR word = ? ) ', [firstParse[0], firstParse[1]], function (tx, results) {
						if (results != null && results.rows != null) {
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								numberDoc[i] = row['idDoc'];
							}
							var numberDocNew = [];
							numberDocNew = noDuplicate(numberDoc);
							if (numberDocNew[0] == null) {
								printNoResults();
							}
							if (arrQueue[2] == '|' && arrQueue[0] == '!') {
								printNot(numberDocNew);
							}
							else {
								for (var k = 0; k < numberDocNew.length; k++) {
									getAndRow(numberDocNew[k]);
								}
							}
						}
						else {
							alert("null");
						}
					}, null);
				});
			}
			//not operator
			function notQuery() {
				myDatabase.transaction(function (tx) {
					for (var i = 1; i < checkWord.length; i++) {
						wordBuzz[i - 1] = checkWord[i];
					}
					tx.executeSql('SELECT * FROM IndexFile WHERE  word = ? ', [wordBuzz[0]], function (tx, results) {
						if (results.rows.length == 0) {
							printNoResults();
						}
						if (results != null && results.rows != null) {
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								numberDoc[i] = row['idDoc'];
							}
							printNot(numberDoc);
						}
						else {
							alert("null");
						}
					}, null);
				});
			}
			var printNot = function (numberDoc) {
				var getNotRow = function () {
					myDatabase.transaction(function (transaction) {
						transaction.executeSql('SELECT * FROM Document', [], printNotDetails, errorHandler);
					});
				};
				var printNotDetails = function (transaction, resultsData) {
					var newNotArray = [], finalNotArray = [];
					for (var i = 0; i < resultsData.rows.length; i++) {
						var rowDocNot = resultsData.rows.item(i);
						newNotArray.push(rowDocNot['idDoc']);
					}
					finalNotArray = checkThediferentTwoArr(newNotArray, numberDoc);
					for (var j = 0; j < finalNotArray.length; j++) {
						getAndRow(finalNotArray[j]);
					}
				};
				getNotRow();
			}
			//check which number is not in the second array
			var checkThediferentTwoArr = function (arr1, arr2) {
				var resultNotArray = [], flagAppear = 0;
				for (var j = 0; j < arr1.length; j++) {
					for (var k = 0; k < arr2.length; k++) {
						if (arr1[j] == arr2[k]) {
							flagAppear = 1;
						}
					}
					if (flagAppear == 0) {
						resultNotArray.push(arr1[j]);
					}
					if (flagAppear == 1) {
						flagAppear = 0;
					}
				}
				return resultNotArray;
			}
			//find the duplicate value in array    
			function findDuplicate(numberDoc) {
				var sorted_arr = numberDoc.slice().sort(), results = [];
				for (var i = 0; i < numberDoc.length - 1; i++) {
					if (sorted_arr[i + 1] == sorted_arr[i]) {
						results.push(sorted_arr[i]);
					}
				}
				return results;
			}
			//and operator   
			function andQuery() {
				myDatabase.transaction(function (tx) {
					var firstParse = [];
					firstParse = wordSearch.split(/[&&)(! ]+/);
					if (arrQueue[0] != '!') {
						wordBuzz = firstParse;
					}
					if (arrQueue[2] == '&' && arrQueue[0] == '!') {
						wordBuzz[0] = firstParse[1];
						wordBuzz[1] = firstParse[2];
					}
					tx.executeSql('SELECT * FROM IndexFile WHERE ( word = ? OR word = ? ) ', [wordBuzz[0], wordBuzz[1]], function (tx, results) {
						if (results != null && results.rows != null) {
							for (var i = 0; i < results.rows.length; i++) {
								var row = results.rows.item(i);
								numberDoc[i] = row['idDoc'];
							}
							var numberDocNew = [];
							numberDocNew = findDuplicate(numberDoc);
							if (numberDocNew[0] == null) {
								printNoResults();
							}
							if (arrQueue[2] == '&' && arrQueue[0] == '!') {
								printNot(numberDocNew);
							}
							else {
								for (var k = 0; k < numberDocNew.length; k++) {
									getAndRow(numberDocNew[k]);
								}
							}
						}
						else {
							alert("null");
						}
					}, null);
				});
			}
			//print the  result of the querys
			var getAndRow = function (val) {
				myDatabase.transaction(function (transaction) {
					transaction.executeSql('SELECT * FROM Document WHERE idDoc = ?;', [val], printAndDetails, errorHandler);
				});
			};
			var printAndDetails = function (transaction, results) {
				for (var i = 0; i < results.rows.length; i++) {
					var rowDoc = results.rows.item(i);
					printLinks(rowDoc['idDoc'], rowDoc['name'], rowDoc['author'], rowDoc['link']);     /*rowDoc['summery'],*/
				}
			};
			//print the result to ui
			function printLinks(idDoc, name, author, link) {

				var fileDisplayArea2 = document.createElement('PRE');
				fileDisplayArea2.setAttribute("id", "fileDisplayArea");
				//link to document
				var a = document.createElement('a');
				var linkText = document.createTextNode("\n" + "Link To Document" + "\n" + "\n");
				a.href = link;
				a.target = "_blank";
				a.setAttribute("id", countDocResult);
				//attach to element
				a.appendChild(linkText);
				//create element for name of the doc
				var nameB = document.createElement("B");
				var title = document.createTextNode(name + "\n");
				//create element for author of the doc
				var authorB = document.createElement("B");
				var authorText = document.createTextNode(author + "\n");
				//summery of the doc and attach it to paragraph
				//var details = document.createTextNode(summery);
				//create button
				var button = document.createElement("input");
				button.type = "button";
				button.value = "Display";
				button.setAttribute("id", countDocResult);
				button.onclick = function () {
					if (flagShow == 1) {
						$("#docPre").remove();
						flagShow = 0;
					}
					if (flagShow == 0) {
						var newIdDoc = idDoc - 1;
						var idBtn = this.id;
						var showDocument = document.createElement('PRE');
						showDocument.setAttribute("id", "docPre");
						var allDoc = document.createTextNode(documentArray[newIdDoc]);
						// alert("array size: " + documentArray.length);
						// alert("iddoc " + newIdDoc);
						// alert(documentArray[newIdDoc]);
						showDocument.appendChild(allDoc);
						
						paraShow.appendChild(showDocument);
						var srcString = $("#allDocument").html();
						for (var index = 0; index < wordBuzz.length; index++) {
							var term = wordBuzz[index];
							if (term != " ") {
								term = term.replace(/\s\s+/g, "(<[^>]+>)*$1(<[^>]+>)*");
								var pattern = new RegExp("(" + term + ")", "gi");
								srcString = srcString.replace(pattern, "<mark>$1</mark>");
								srcString = srcString.replace(/(<mark>[^<>]*)((<[^>]+>)+)([^<>]*<\/mark>)/, "$1</mark>$2<mark>$4");
								$("#allDocument").html(srcString);
							}
						}
						//alert();
						//print the document
						printDocument($(allDocument).html());
						flagShow = 1;
					}
				};
				nameB.appendChild(title);
				fileDisplayArea2.appendChild(nameB);
				authorB.appendChild(authorText);
				fileDisplayArea2.appendChild(authorB);
				//fileDisplayArea2.appendChild(details);
				fileDisplayArea2.appendChild(button);
				fileDisplayArea2.appendChild(a);
				wrapper.appendChild(fileDisplayArea2);
				countDocResult++;
				window.onload = function () {
					document.getElementById(this.id).onclick = function () { }
				};
			}
		});
		//print that there is no results
		function printNoResults() {
			var fileDisplayArea3 = document.createElement('PRE');
			var noResult = document.createElement("B");
			var title = document.createTextNode("There are no results." + "\n");
			noResult.appendChild(title);
			fileDisplayArea3.appendChild(noResult);
			wrapper.appendChild(fileDisplayArea3);
		}
		function printDocument(st) {
			var mywindow = window.open('', 'my div', 'height=500,width=800');
			mywindow.document.write('<html><head><title>Information retrieval project</title>');
			mywindow.document.write('</head><body >');
			mywindow.document.write('<pre>');
			//alert(st);
			mywindow.document.write(st);
			mywindow.document.write('</pre>');
			mywindow.document.write('</body></html>');
			mywindow.document.close();
			mywindow.focus();
			mywindow.print();
			mywindow.close();
		}
		//delete the results in the ui
		function deleteTheResults() {
			$("#fileDisplayArea").remove();
			$("#docPre").remove();
			$("#fileDisplayArea").remove();
			$("b").remove();
			$("a").remove();
			$("pre").remove();
			countDocResult = 0;
		}
		function initDatabase() {
			try {
				if (!window.openDatabase) {
					alert('Databases are not supported in this browser.');
				} else {
					var shortName = 'myDatabase';
					var version = '1.0';
					var displayName = 'myDatabase Database';
					var maxSize = 100000; //  bytes
					myDatabase = openDatabase(shortName, version, displayName, maxSize);
					createTables();
				}
			} catch (e) {
				if (e == 2) {
					// Version number mismatch.
					console.log("Invalid database version.");
				} else {
					console.log("Unknown error " + e + ".");
				}
				return;
			}
		}
		function createTables() {
			myDatabase.transaction(
				function (transaction) {
					transaction.executeSql('CREATE TABLE IF NOT EXISTS IndexFile(idDoc INTEGER NOT NULL,word TEXT NOT NULL,hits INTEGER NOT NULL);', [], this.nullDataHandler, this.errorHandler);
					transaction.executeSql('CREATE TABLE IF NOT EXISTS Document(idDoc INTEGER NOT NULL,name TEXT NOT NULL,author TEXT NOT NULL,link TEXT NOT NULL);', [], this.nullDataHandler, this.errorHandler);
					//alert('after create tables');
				}
			);
		}
		function addIndexFile(idDoc, word, hits) {
			myDatabase.transaction(
				function (transaction) {
					transaction.executeSql('INSERT INTO IndexFile (idDoc, word, hits) VALUES (?, ?, ?)', [idDoc, word, hits]);
				}
			);
		}
		function addDocument(idDoc, name, author, link) {
			myDatabase.transaction(
				function (transaction) {
					transaction.executeSql('INSERT INTO Document (idDoc, name, author, link) VALUES (?, ?, ?, ?)', [idDoc, name, author, link]);
				}
			);
		}
		function sortAll() {
			myDatabase.transaction(
				function (transaction) {
					transaction.executeSql('CREATE TABLE IF NOT EXISTS IndexFile2(idDoc INTEGER NOT NULL,word TEXT NOT NULL,hits INTEGER NOT NULL);', [], this.nullDataHandler, this.errorHandler);
					transaction.executeSql("INSERT INTO IndexFile2 (idDoc, word, hits) SELECT * FROM IndexFile ORDER BY lower(word);", [], this.nullDataHandler, this.errorHandler);
					transaction.executeSql("DROP TABLE IndexFile;", [], this.nullDataHandler, this.errorHandler);
					//alert('after sort');
					sortAll2();
				}
			);
		}
		function sortAll2() {
			myDatabase.transaction(
				function (transaction) {
					transaction.executeSql('CREATE TABLE IndexFile(idDoc INTEGER NOT NULL,word TEXT NOT NULL,hits INTEGER NOT NULL);', [], this.nullDataHandler, this.errorHandler);
					transaction.executeSql("INSERT INTO IndexFile (idDoc, word, hits) SELECT * FROM IndexFile2 ORDER BY lower(word);", [], this.nullDataHandler, this.errorHandler);
					transaction.executeSql("DROP TABLE IndexFile2;", [], this.nullDataHandler, this.errorHandler);
					//alert('after sort 2');
				}
			);
		}
		function dropTables() {
			myDatabase.transaction(
				function (transaction) {
					transaction.executeSql("DROP TABLE IndexFile;", [], this.nullDataHandler, this.errorHandler);
					transaction.executeSql("DROP TABLE Document;", [], this.nullDataHandler, this.errorHandler);
				}
			);
			location.reload();
		}
		function errorHandler(transaction, error) {
			console.log('Oops. Error was ' + error.message + ' (Code ' + error.code + ')');
			return true;
		}


	}
};

