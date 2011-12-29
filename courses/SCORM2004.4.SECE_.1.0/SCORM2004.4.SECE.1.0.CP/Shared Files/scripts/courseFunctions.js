// JavaScript Document
/*******************************************************************************
ADL SCORM 2004 4th Edition SECE

 

The ADL SCORM 2004 4th Ed. SECE is licensed under

Creative Commons Attribution-Noncommercial-Share Alike 3.0 United States.

 

The Advanced Distributed Learning Initiative allows you to:

  *  Share - to copy, distribute and transmit the work.

  *  Remix - to adapt the work. 

 

Under the following conditions:

  *  Attribution. You must attribute the work in the manner specified by the author or licensor (but not in any way that suggests that they endorse you or your use of the work).

  *  Noncommercial. You may not use this work for commercial purposes. 

  *  Share Alike. If you alter, transform, or build upon this work, you may distribute the resulting work only under the same or similar license to this one. 

 

For any reuse or distribution, you must make clear to others the license terms of this work. 

Any of the above conditions can be waived if you get permission from the ADL Initiative. 

Nothing in this license impairs or restricts the author's moral rights.
*******************************************************************************/

// Global variables

// Keep track of location in content by div number
var CurrentPage;

/*******************************************************************************
**
** This function asks the LMS if there exists a previous SCO or Asset to go to.
** If a SCO or Asset exists, then the previous button is displayed.
**
** Inputs:  None
**
** Return:  String - "true" if the previous button should be displayed
**                   "false" if failed.
**
*******************************************************************************/
function RenderPreviousButton() {
	var value = retrieveDataValue("adl.nav.request_valid.previous");
	return value;
}

/*******************************************************************************
**
** This function asks the LMS if there exists a next SCO or Asset to continue
** to.  If a SCO or Asset exists, then the continue button is displayed.
**
** Inputs:  None
**
** Return:  String - "true" if the continue button should be displayed
**                   "false" if failed.
**
*******************************************************************************/
function RenderContinueButton() {
	var value = retrieveDataValue("adl.nav.request_valid.continue");
	return value;
}

/*******************************************************************************
**
** This function is used to go to a previous SCO
**
*******************************************************************************/
function PreviousSCO() {
	// we request the previous SCO from the LMS
	storeDataValue( "adl.nav.request", "previous" );
	// we terminate this SCO's communication with the LMS
	terminateCommunication();
}

/*******************************************************************************
**
** This function is used to go to a next SCO
**
*******************************************************************************/
function ContinueSCO() {
	// we request the previous SCO from the LMS
	storeDataValue( "adl.nav.request", "continue" );
	// we terminate this SCO's communication with the LMS
	terminateCommunication();
}

/*******************************************************************************
**
** This function is used to tell the LMS to initiate the communication session
** using the APIWrapper.js file as a pass through.
**
** Inputs:  None
**
** Return:  String - "true" if the initialization was successful, or
**          "false" if the initialization failed.
**
*******************************************************************************/
function Initialize() {
	// make initialize call
	initializeCommunication();

	// set completion status to incomplete
	SetIncomplete();

	// set exit to suspended
	storeDataValue( "cmi.exit","suspend" );

	// check for resumed entry state
	var entryMode = retrieveDataValue( "cmi.entry" );

	// set a local variable to page 1
	var location = 1;

	// check whether resuming SCO
	if (entryMode == "resume") {
		// check if a prior location was set
		location = retrieveDataValue( "cmi.location" );

		// get the Error code from the last call
		var errorCode = retrieveLastErrorCode();

		// if not set or at the last page, go to first page
		if (errorCode == "403"  || location == TotalPages()) {
			location = 1;
		}
	}
	// present page to learner
	DisplayPage( location );
}

/*******************************************************************************
**
** This function is used to get the total number of a
**
** Inputs:  None
**
** Return:  String - total number of divs with the class name "page"
**
*******************************************************************************/
function TotalPages(){
	// initial setup of variables
	var pages = 0
	var divs = document.getElementsByTagName("div");

	for ( var i = 0; i < divs.length; i++ )	{
			if (divs[i].className == "page"){
				pages++;
		}

	}
	return pages;
}


/*******************************************************************************
**
** Makes the appropriate calls for a normal exit calling Terminate
**
** Inputs:  None
**
** Return:  None
**
*******************************************************************************/
function Terminate() {
	terminateCommunication();
}

/*******************************************************************************
**
** Sets the SCO completion status to incomplete.
**
** Inputs:  None
**
** Return:  None
**
*******************************************************************************/
function SetIncomplete (){
	retrieveDataValue( "cmi.completion_status" );
	if (status != "completed"){
		storeDataValue( "cmi.completion_status", "incomplete" );
	}
}

/*******************************************************************************
**
** Sets the SCO completion status to complete.
**
** Inputs:  None
**
** Return:  None
**
*******************************************************************************/
function SetComplete (){
	storeDataValue( "cmi.completion_status", "completed" );
}

/*******************************************************************************
**
** Shows and hides divs to create the appearance of paging through a sco.
**
** Inputs:  Int (or a String formatted as an Int) - div to display
**
** Return:  None
**
*******************************************************************************/
function DisplayPage( pn )
{
	pageNumber = parseInt(pn);


	// catch out of range pages

	if (pageNumber <1 || pageNumber > TotalPages()){
		pageNumber = 1;
	}

	//check and stop flash

	if (SwfLoaded(document["swf" + CurrentPage ])) {
	    document["swf" + CurrentPage ].GotoFrame(1);
	}

	// set location value for bookmark
	storeDataValue( "cmi.location", pageNumber ) ;

	var divs = document.getElementsByTagName("div");

	for ( var i = 0; i < divs.length; i++ )	{
		var div = divs[i];
		var id = div.id;
		var className = div.className;

		if ( className == "page" ){
			if ( id == "p" + pageNumber ){
				// show requested page
				div.style.visibility = "visible";
			}
			else {
				// hide other pages
				div.style.visibility = "hidden";
			}
		}

	}

	// set completion status to completed when the user hits the last page
	// check whether to display continue button at end of sco for navigation to next sco
	if ( pageNumber == TotalPages() ) {

		SetComplete();

		if ( RenderContinueButton() != "true") {
			document.getElementById("nextBtn").style.visibility = "hidden";
		}
	}
	else{
		document.getElementById("nextBtn").style.visibility = "visible";
	}

	// check whether to display previous button at beginning of sco for navigation to previous sco
	if ( pageNumber == 1 ) {
		if ( RenderPreviousButton() != "true") {
			document.getElementById("previousBtn").style.visibility = "hidden";
		}
	}
	else{
		document.getElementById("previousBtn").style.visibility = "visible";
	}

	// check and start flash
	if (SwfLoaded(document["swf" + pageNumber])) {
	    document["swf" + pageNumber].Play();
 	}

	// set global page
	CurrentPage = pageNumber;

}


/*******************************************************************************
**
** Navigation button continue function. Handles page to page and sco to sco navigation.
** (Buttons are hidden when sco to sco navigtion is not allowed.)
**
** Inputs:  None
**
** Return:  None
**
*******************************************************************************/
function NextPage() {
	if (CurrentPage+1 <= TotalPages()){
		DisplayPage( CurrentPage + 1 )
	}
	else{
		ContinueSCO();
	}
}

/*******************************************************************************
**
** Navigation button previous function. Handles page to page and sco to sco navigation.
** (Buttons are hidden when sco to sco navigtion is not allowed.)
**
** Inputs:  None
**
** Return:  None
**
*******************************************************************************/
function PreviousPage() {
	if (CurrentPage-1 >= 1){
		DisplayPage( CurrentPage - 1 )
	}
	else{
		PreviousSCO();
	}
}

/*******************************************************************************
**
** Checks if Flash object is finished loading.
**
** Inputs:  Object - DOM Reference
**
** Return:  Boolean
**
*******************************************************************************/
function SwfLoaded (swfRef) {
  if (typeof(swfRef) != "undefined") {
    return swfRef.PercentLoaded() == 100;
  } else {
    return false;
  }
}

/*******************************************************************************
**
** Hides and shows a div on a page.
** Used in the Tracking Model SCO for addtional information about keywords.
**
** Inputs:  Object - DOM Reference
**
** Return:  Void
**
*******************************************************************************/
function SwitchMenu(divId)
{
var element = document.getElementById(divId);
	if(element.style.display != "block"){
		element.style.display = "block";
	}
	else{
		element.style.display = "none";
	}
}