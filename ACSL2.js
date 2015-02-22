/**
 * New node file
 */
fs = require('fs');//file system


//LISP syntax:
defaultListDeclare = "'";


/*
//input reading:
fs.readFile('input.txt', 'utf8', function (err, data) {
	  if (err) throw err;
	  entriesArray = data.split("\n");
	  for(j = 0; j < entriesArray.length; j++)
		  {
		  entry = entriesArray[j];
		  console.log(run(entry, j));
		  }
	  
	});
*/

//Calculation:
/**
 * run receives the input strings from the filesystem reader, and delegates them to 5 other methods
 *  (according to the line number the string is in the file) to deal with them and produce an output.
 */
function run (string, operationNumber)
{
	
	//Ensure string is LISP list and remove '
	//NOTE: In javascript, saying "if(string.length)" will check whether string.length is NOT 0. If 0 will be treated
	//as FALSE, else TRUE. (AKA There is no need to say string.length>0). This applies for all other arguments to an if 
	//statement - 'nil' / 'null' / '0' will all be FALSE, everything else is TRUE.
	
	if(string.length && string.substring(0,1)===defaultListDeclare)
		{
		string = string.substring(1, string.length);
		}

	switch(operationNumber)
	{
	case 0:
		return inverseList(string);
	case 1:
		return condenceSimple(string);
	case 2:
		return condenceComplex(string);
	case 3:
		return deleteN(string);
	case 4:
		return splitList(string);
	}
	return "ERROR with: " + string + "on line #" + (operationNumber+1);//operationNumber starts at 0, line # at 1.
	
}

function inverseList(string)
{
	string = string.replace("(", "");
	string = string.replace(")", "");
	
	atoms = string.split(" ");//All atoms have spaces between them, use this to split into array
	retVal = defaultListDeclare + "(";
	for(i = atoms.length -1 ; i >= 0; i--)
		{
		atom = atoms[i];
		retVal+=(atom+(i==0?"":" "));
		}
	retVal += ")";
	
	return retVal;
}

function condenceSimple(string)
{
	string = string.replace("(", "");
	string = string.replace(")", "");
	
	atoms = string.split(" ");//All atoms have spaces between them, use this to split into array
	
	retVal = defaultListDeclare+"(";
	
	counter = 0;
	currentLetter = "";
	for(i = 0; i < atoms.length; i++)
		{
		letter = atoms[i];
		if(counter==0)
			{
			counter++;
			currentLetter = letter;
			continue;
			}
		
		if(letter === currentLetter)
			{
			counter++;
			}
		else
			{
			retVal += "(" + counter + " " + currentLetter + ") ";
			counter = 1;
			currentLetter = letter;
			}
		}
	if(counter)//means we had a string of letters at end that was not yet added
		{
		retVal += "(" + counter + " " + currentLetter + ")";
		}
	
	retVal += ")";
	
	return retVal;
	
}

function condenceComplex(string)
{
	string = string.replace("(", "");
	string = string.replace(")", "");
	
	atoms = string.split(" ");//All atoms have spaces between them, use this to split into array
	
	retVal = defaultListDeclare+"(";
	
	counter = 0;
	currentLetter = "";
	for(i = 0; i < atoms.length; i++)
		{
		letter = atoms[i];
		if(counter==0)
			{
			counter++;
			currentLetter = letter;
			continue;
			}
		
		if(letter === currentLetter)
			{
			counter++;
			}
		else
			{
			retVal += (counter==1)?currentLetter + " " : "(" + counter + " " + currentLetter + ") ";
			counter = 1;
			currentLetter = letter;
			}
		}
	if(counter)//means we had a string of letters at end that was not yet added
		{
		retVal += (counter==1)?currentLetter : "(" + counter + " " + currentLetter + ")";
		}
	
	retVal += ")";
	
	return retVal;
}

function deleteN(string)
{
	elements = (splitComplex(string));
	N = parseInt (elements[elements.length-1]);
	for(i = N-1; i < elements.length; i+=N)
		{
		elements.splice(i, 1);//removes element at index i
		i--;//element was removed
		}
	
	
	retVal = defaultListDeclare + "(";
	for(i = 0; i < elements.length; i++)
		{
		retVal+= elements[i] + ((i===(elements.length-1)) ? "" : " ");
		}
	
	retVal += ")";
	return retVal;
}

/**
 * Note: It is ambiguos from the instructions whether we are gauranteed that all elements in the given list (except 
 * for the last element) are lists. I am assuming this as otherwise there would be multiple ways to answer the problem.
 */
function splitList(string)
{
	elements = (splitComplex(string));
	N = parseInt (elements[elements.length-1]);
	
	retVal = defaultListDeclare + "(";
	for(i = 0; i < elements.length && i < N; i++)
		{
		retVal += elements[i] + ((i===(elements.length-1)||i===N-1) ? "" : " ");
		}
	retVal += ") " + defaultListDeclare + "(";//Note: instructions unclear as to whether to add " " after list end. I chose to add as the example output "looks" as if there is a space there.
	
	for(i = N; i < elements.length; i++)
		{
		retVal += elements[i] + ((i===(elements.length-1)||i===N-1) ? "" : " ");
		}
	retVal+=")";
	
	return retVal;
	
}


//helper methods:
/**
 * parses elements from string (string can include both lists and atoms)
 * string MUST include outer parentheses
 */
function splitComplex(string)
{
	string = string.substring(1, string.length-1);
	
	elements = [];
	lastOpenParIndex = -1;
	
	charArray = string.split("");
	for(i = 0; i < charArray.length; i ++)
		{
		char = charArray[i];
		if(char===" ")
			continue;//skip spaces
		
		if(char==="(")
			{
			lastOpenParIndex = i;
			}
		else if(char===")")
			{
			elements.push(string.substring(lastOpenParIndex, i+1));
			lastOpenParIndex = -1;
			}
		else
			{
			if(lastOpenParIndex!==-1)
				continue;
			else
				{
				elements.push(char);
				}
			}
		}
	return elements;
}



exports.run = run;

