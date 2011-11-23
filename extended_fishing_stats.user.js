// Extended Fishing Stats
//
// Writen by Domain Name, aka Misplaced Pixels (SigmaJargon@gmail.com)
// Maintainer: Arima Begoun, aka Ar1ma (Begooon@hotmail.com)
// GUID {4fcca21a-07b7-4ac4-a06d-a4a901be2798}
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          Extended Fishing Stats
// @namespace     SigmaJargon.Gaia.Fishing
// @description   Adds information to the Gaia Fishing Stats page.
// @include       http://*.gaiaonline.com/games/fishing/stats.php*
// ==/UserScript==

///////////////////////  STANDARD FUNCTIONS  ///////////////////////

function XPathQuery(Query, Node)
{
	
	return document.evaluate(Query, Node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	
}

function InsertBefore(OldNode, NewNode)
{

	OldNode.parentNode.insertBefore(NewNode, OldNode);

}

function InsertAfter(OldNode, NewNode)
{

	OldNode.parentNode.insertBefore(NewNode, OldNode.nextSibling);

}

function CreateElement(Type, Class, ID, Text)
{

	var NewElement = document.createElement(Type);
	NewElement.className = Class;
	NewElement.id = ID;
	NewElement.innerHTML = Text;	
	return NewElement;

}

function AddGlobalStyle(css)
{

	var head, style;
	head = document.getElementsByTagName('head')[0];

	if (!head)
	{

		return;

	}

	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;

	head.appendChild(style);

}

//This method was created by the fine folks over at http://www.prototypejs.org
//Thank goodness for open source Javascript.  No way I could've figured out the proper 
//replace'ing and regular expressions o,o
function isJSON(json)
{
	var str = json.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
	return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
}

function Round(Number, Degree)
{
	return Math.round(Math.pow(10, Degree)*Number)/Math.pow(10, Degree);
}

function nthAncestor(Element, n)
{
	var Ancestor = Element;
	for (var i = 0; i < n; i++)
	{
		if (Ancestor)
			Ancestor = Ancestor.parentNode;
	}
	return Ancestor;
}

///////////////////////  SPECIFIC FUNCTIONS  ///////////////////////

var Names = new Array();

function SetOverallHeaderWidth(Overall, Width)
{

	var RankingHeader = XPathQuery("th", Overall.snapshotItem(0)).snapshotItem(0);
	var RankingColumSpan = document.createAttribute("colspan");
	RankingColumSpan.value = Width;
	RankingHeader.attributes.setNamedItem(RankingColumSpan);
	
	var InfoHeader = XPathQuery("td", Overall.snapshotItem(1)).snapshotItem(0);
	var InfoColumSpan = document.createAttribute("colspan");
	InfoColumSpan.value = Width;
	InfoHeader.attributes.setNamedItem(InfoColumSpan);

}

function AddOverallHeaders(OverallHeaders)
{
	
	var JunkHeader = CreateElement('td', "OverallHeader", "statheader1", "Junk Estimate");
	JunkHeader.align = "center";
	InsertAfter(OverallHeaders.snapshotItem(1), JunkHeader);

	var TotalScoreHeader = CreateElement('td', "OverallHeader", "statheader1", "Total Score");
	TotalScoreHeader.align = "center";
	InsertAfter(OverallHeaders.snapshotItem(1), TotalScoreHeader);

	var PIHeader = CreateElement('td', "OverallHeader", "statheader1", "Performance Index");
	PIHeader.align = "center";
	InsertAfter(OverallHeaders.snapshotItem(1), PIHeader);

	var DuremPotentialHeader = CreateElement('td', "DuremHeader", "statheader2", "Potential Durem Fish");
	DuremPotentialHeader.align = "center";
	InsertAfter(OverallHeaders.snapshotItem(7), DuremPotentialHeader);
	
}

function GetScoreDiff(Username, Score, Category)
{
	var ScoreDiff = Score - GM_getValue(Username + "  " + Category, 0);
	if (ScoreDiff < 0 || isNaN(ScoreDiff))
		ScoreDiff = 0;
	if (!isNaN(Score))
		GM_setValue(Username + "  " + Category, Score);
	return ScoreDiff;
}

var JunkValue = 3.928382427; //Aberage value of junk.  Estimated by large amounts of player data.
function EstimateJunk(FinalScore, TotalScore, TotalFish)
{
	JunkEstimate =  Math.round((10*FinalScore-JunkValue*TotalScore-2*Math.sqrt(Math.pow(JunkValue, 2)*TotalFish-JunkValue*TotalScore+5*FinalScore)*Math.sqrt(5*FinalScore))/Math.pow(JunkValue, 2));
	if (isNaN(JunkEstimate))
		return 0;
	if (JunkEstimate < 0)
		return Math.round((10*FinalScore-JunkValue*TotalScore+2*Math.sqrt(Math.pow(JunkValue, 2)*TotalFish-JunkValue*TotalScore+5*FinalScore)*Math.sqrt(5*FinalScore))/Math.pow(JunkValue, 2))
	return JunkEstimate;
}

function SubmitScores(Overall)
{
	//Determine current month in PST
	var LocalDate = new Date();
	var pstDate =  new Date(LocalDate.getTime() + (LocalDate.getTimezoneOffset() * 60000) + -8 * 3600000);

	var SplitDateString = pstDate.toDateString().split(' ');
	var DateString = "&nbsp;" + SplitDateString[1] + " " + SplitDateString[3].substring(2);

	var Columns = XPathQuery("td", Overall.snapshotItem(3));
	var Month = Columns.snapshotItem(0).firstChild.innerHTML;
	if (Month == DateString)
	{
		var Username = XPathQuery("//li[@class='avatarName']",document).snapshotItem(0).firstChild.innerHTML;
		var Icon = XPathQuery("//p[@class='imgAvatar']",document).snapshotItem(0).firstChild.firstChild.src.replace('flip.png', '48x48.gif');

		var FinalScore = parseInt(Columns.snapshotItem(1).innerHTML);
		var BasskenFish = parseInt(Columns.snapshotItem(2).innerHTML);
		var BasskenScore = parseInt(Columns.snapshotItem(3).innerHTML);
		var GambinoFish = parseInt(Columns.snapshotItem(4).innerHTML);
		var GambinoScore = parseInt(Columns.snapshotItem(5).innerHTML);
		var DuremFish = parseInt(Columns.snapshotItem(6).innerHTML);
		var DuremScore = parseInt(Columns.snapshotItem(7).innerHTML);

		var TotalScore = BasskenScore + GambinoScore + DuremScore;
		var TotalFish = BasskenFish + GambinoFish + DuremFish;

		var JunkEstimate = EstimateJunk(FinalScore, TotalScore, TotalFish);
		var JunkEstimateScore = Math.floor(JunkValue*JunkEstimate);
		var DuremPotential = 4 * Math.min(BasskenFish, GambinoFish) - BasskenFish - GambinoFish - DuremFish - JunkEstimate;
		
		if (DuremPotential > 0) //Qualifies for Overall
		{
			if (FinalScore != 0)
			{
				SubmitCategory(Username, Icon, 0, FinalScore, TotalFish);
			}
		}
		if (BasskenScore != 0)
		{
			SubmitCategory(Username, Icon, 1, BasskenScore, BasskenFish);
		}
		if (GambinoScore != 0)
		{
			SubmitCategory(Username, Icon, 2, GambinoScore, GambinoFish);
		}
		if (DuremScore != 0)
		{
			SubmitCategory(Username, Icon, 3, DuremScore, DuremFish);
		}
		if (JunkEstimateScore != 0)
		{
			SubmitCategory(Username, Icon, 4, JunkEstimateScore, JunkEstimate);
		}
	}
}

function SubmitCategory(Name, Icon, Category, Score, Fish)
{
	GM_xmlhttpRequest
	({
		method: 'GET',
		url: 'http://sigma.acornscity.com/submit.php?name=' + Name + '&icon=' + escape(Icon) + '&category=' + Category + '&score=' + Score + '&fish=' + Fish
	});
}

function ProcessOverallRows(Overall, RecordScores, IsFirstPlace, FirstPlaceScore, FirstPlaceFish)
{
	for (var i = 3; i < Overall.snapshotLength; i++)
	{
			Overall.snapshotItem(i).style.whiteSpace = 'nowrap';
			var Columns = XPathQuery("td", Overall.snapshotItem(i));
			if (Columns.snapshotLength < 8)
				continue;
			var Username;
			if (RecordScores)
			{
				Username = Columns.snapshotItem(0).childNodes[1].innerHTML;
				Names['Overall'].push(Columns.snapshotItem(0).childNodes[1].firstChild);
			}

			var FinalScore = parseInt(Columns.snapshotItem(1).innerHTML);
			if (isNaN(FinalScore))
			{
				FinalScore = 0;
			}
			if (RecordScores)
			{
				Columns.snapshotItem(1).innerHTML = FinalScore + ' (' + GetScoreDiff(Username, FinalScore, "Overall") + ')';
			}
			
			var BasskenFish = parseInt(Columns.snapshotItem(2).innerHTML);
			var BasskenScore = parseInt(Columns.snapshotItem(3).innerHTML);
			if (isNaN(BasskenScore))
			{
				BasskenFish = 0;
				BasskenScore = 0;
			}
			if (RecordScores)
			{
				Columns.snapshotItem(3).innerHTML = BasskenScore + ' (' + GetScoreDiff(Username, BasskenScore, "Bassken") + ')';
			}

			var GambinoFish = parseInt(Columns.snapshotItem(4).innerHTML);
			var GambinoScore = parseInt(Columns.snapshotItem(5).innerHTML);
			if (isNaN(GambinoScore))
			{
				GambinoFish = 0;
				GambinoScore = 0;
			}
			if (RecordScores)
			{
				Columns.snapshotItem(5).innerHTML = GambinoScore + ' (' + GetScoreDiff(Username, GambinoScore, "Gambino") + ')';
			}
		
			var DuremFish = parseInt(Columns.snapshotItem(6).innerHTML);
			var DuremScore = parseInt(Columns.snapshotItem(7).innerHTML);
			if (isNaN(DuremScore))
			{
				DuremFish = 0;
				DuremScore = 0;
			}
			if (RecordScores)
			{
				Columns.snapshotItem(7).innerHTML = DuremScore + ' (' + GetScoreDiff(Username, DuremScore, "Durem") + ')';
			}

			var OverallClass, BasskenClass, GambinoClass, DuremClass;
			if ((i % 2) == 0)
			{
				
				OverallClass = "OverallEven";
				BasskenClass = "BasskenEven";
				GambinoClass = "GambinoEven";
				DuremClass = "DuremEven";
			
			}
			else
			{

				OverallClass = "OverallOdd";
				BasskenClass = "BasskenOdd";
				GambinoClass = "GambinoOdd";
				DuremClass = "DuremOdd";

			}

			var TotalScore = BasskenScore + GambinoScore + DuremScore;
			var TotalFish = BasskenFish + GambinoFish + DuremFish;
		
			var JunkEstimate;
			var PIEstimate;
			if (IsFirstPlace)
			{
				JunkEstimate = FirstPlaceFish - TotalFish;
				TotalScore = FirstPlaceScore;
				IsFirstPlace = false;
			}
			else
			{
				JunkEstimate = EstimateJunk(FinalScore, TotalScore, TotalFish);
				TotalScore += Math.floor(JunkValue*JunkEstimate);
			}
			
			if (TotalScore == 0)
				PIEstimate = 0;
			else
				PIEstimate = Round(100*FinalScore/TotalScore, 1);

			InsertAfter(Columns.snapshotItem(1), CreateElement('td', OverallClass, "statscore", JunkEstimate));
			InsertAfter(Columns.snapshotItem(1), CreateElement('td', OverallClass, "statscore", TotalScore));
			InsertAfter(Columns.snapshotItem(1), CreateElement('td', OverallClass, "statscore", PIEstimate + "%"));
		
			var DuremPotential = 4 * Math.min(BasskenFish, GambinoFish) - BasskenFish - GambinoFish - DuremFish - JunkEstimate;
			//if (DuremPotential < 0)
			//	DuremPotential = 0;
			InsertAfter(Columns.snapshotItem(7), CreateElement('td', DuremClass, "statscore", DuremPotential));	
	}

}

function ProcessOverall(Context, RecordScores)
{

	Names['Overall'] = new Array();
	var Overall = XPathQuery("td/table/tbody/tr", Context.snapshotItem(1));
	var FirstOverall = XPathQuery("td/table/tbody/tr/td/table/tbody/tr/td/span/text()", Context.snapshotItem(0));
	var FirstPlaceFish = parseInt(FirstOverall.snapshotItem(2).nodeValue);
	var FirstPlaceScore = parseInt(FirstOverall.snapshotItem(3).nodeValue);

	SetOverallHeaderWidth(Overall, 15);

	var OverallHeaders = XPathQuery("td", Overall.snapshotItem(2));
	AddOverallHeaders(OverallHeaders);
	
	ProcessOverallRows(Overall, RecordScores, true, FirstPlaceScore, FirstPlaceFish);

}

function ProcessLake(Name, Lake, LakeEven, LakeOdd)
{
	//GM_log("Processing " + Name);
	Names[Name] = new Array();

	var Header = XPathQuery("td", Lake.snapshotItem(0));
	var HeaderColumSpan = document.createAttribute("colspan");
	HeaderColumSpan.value = 3;
	Header.snapshotItem(0).attributes.setNamedItem(HeaderColumSpan);

	var FirstPlaceColumns = XPathQuery("td/table/tbody/tr/td", Lake.snapshotItem(1));
	var FirstPlace = XPathQuery("span/text()", FirstPlaceColumns.snapshotItem(0));
	var FirstPlaceName = XPathQuery("span/b/text()", FirstPlaceColumns.snapshotItem(0)).snapshotItem(0);
	Names[Name].push(FirstPlaceName);
	FirstPlaceName = FirstPlaceName.nodeValue.substring(2);
	var LastScoreLocation = FirstPlace.snapshotItem(1);
	if(!LastScoreLocation)
	{
		LastScoreLocation = FirstPlace.snapshotItem(0);
	}
	var LastScore = parseInt(LastScoreLocation.nodeValue);
	
	var LastScoreDiff = GetScoreDiff(FirstPlaceName, LastScore, Name);
	LastScoreLocation.nodeValue = ' ' + LastScore + ' (' + LastScoreDiff + ')';

	for (var i = 2; i < Lake.snapshotLength; i++)
	{
		Lake.snapshotItem(i).style.whiteSpace = 'nowrap';
		var CurrentColumn = XPathQuery("td", Lake.snapshotItem(i));
		var CurrentScore = parseInt(CurrentColumn.snapshotItem(1).innerHTML);
		if (CurrentColumn.snapshotItem(0).lastChild.firstChild)
		{
			var CurrentName = CurrentColumn.snapshotItem(0).lastChild.firstChild.nodeValue;
			Names[Name].push(CurrentColumn.snapshotItem(0).lastChild.firstChild);

			var CurrentScoreDiff = GetScoreDiff(CurrentName, CurrentScore, Name);
			CurrentColumn.snapshotItem(1).innerHTML = CurrentScore + ' (' + CurrentScoreDiff + ')';
		}

		var LakeClass;
		if ((i % 2) == 0)
		{
			
			LakeClass = LakeOdd;
			
		}
		else
		{

			LakeClass = LakeEven;

		}

		InsertAfter(CurrentColumn.snapshotItem(1), CreateElement("td", LakeClass, "statnum", LastScore-CurrentScore));
		
		LastScore = CurrentScore;
		
	}
	
	var NewFirstPlaceRow = CreateElement("tr", "", "", "");
	NewFirstPlaceRow.appendChild(CreateElement("td", "", "", FirstPlaceColumns.snapshotItem(0).innerHTML));
	NewFirstPlaceRow.appendChild(CreateElement("td", "", "", FirstPlaceColumns.snapshotItem(1).innerHTML));
	NewFirstPlaceRow.appendChild(CreateElement("td", "DistanceHeader", "", "<b>Diff</b>"));
	
	Lake.snapshotItem(1).parentNode.replaceChild(NewFirstPlaceRow, Lake.snapshotItem(1));

}

function GetUnofficialScoreboard(Context)
{
	GM_xmlhttpRequest(
	{
		method: 'GET',
		url: 'http://sigma.acornscity.com/scoreboard.json',
		onload: function(responseDetails)
		{
			if (isJSON(responseDetails.responseText))
			{
				try
				{
					var jsonResponse = eval('(' + responseDetails.responseText + ')');
					//Iterate over categories
					var Categories = {0:'Overall', 1:'Bassken', 2:'Gambino', 3:'Durem', 4:'Junk'};
					var CategoryNames = {0:'Overall', 1:'Bass\'ken Lake', 2:'Port of Gambino', 3:'Durem Reclamation Facility', 4:'Junk'};
					var Subboards = new Array();
					for (var i = 0; i < 5; i++)
					{
						var SubboardTable = document.createElement('table');
						Subboards[i] = SubboardTable;
						SubboardTable.cellPadding = 2;
						SubboardTable.cellSpacing = 1;
						SubboardTable.border = 0;
						SubboardTable.style.fontSize = '10px';
						if (i==0)
							SubboardTable.style.width = '50%';
						else
							SubboardTable.style.width = '100%';
						
						var SubboardHeaderRow = document.createElement('tr');
						SubboardHeaderRow.className = Categories[i]+"PersonalHeader";
						var SubboardHeaderColumn = document.createElement('td');
						SubboardHeaderColumn.colSpan = 3;
						SubboardHeaderColumn.style.textAlign = "center";
						SubboardHeaderColumn.style.color = "#FFFFFF";
						SubboardHeaderColumn.style.fontWeight = "bold";
						SubboardHeaderColumn.style.paddingBottom = SubboardHeaderColumn.style.paddingTop = '5px';
						SubboardHeaderColumn.innerHTML = CategoryNames[i];
						SubboardHeaderRow.appendChild(SubboardHeaderColumn);
						SubboardTable.appendChild(SubboardHeaderRow);

						var SubboardHeadersRow = document.createElement('tr');
						SubboardHeadersRow.className = Categories[i]+"PersonalHeader";

						var SubboardHeaderNameColumn = document.createElement('td');
						SubboardHeaderNameColumn.style.textAlign = "center";
						SubboardHeaderNameColumn.style.color = "#FFFFFF";
						SubboardHeaderNameColumn.style.fontWeight = "bold";
						SubboardHeaderNameColumn.style.paddingBottom = SubboardHeaderNameColumn.style.paddingTop = '2px';
						SubboardHeaderNameColumn.innerHTML = "Name";
						SubboardHeadersRow.appendChild(SubboardHeaderNameColumn);
						SubboardTable.appendChild(SubboardHeadersRow);

						var SubboardHeaderScoreColumn = document.createElement('td');
						SubboardHeaderScoreColumn.style.textAlign = "center";
						SubboardHeaderScoreColumn.style.color = "#FFFFFF";
						SubboardHeaderScoreColumn.style.fontWeight = "bold";
						SubboardHeaderScoreColumn.style.paddingBottom = SubboardHeaderScoreColumn.style.paddingTop = '2px';
						SubboardHeaderScoreColumn.innerHTML = "Score";
						SubboardHeadersRow.appendChild(SubboardHeaderScoreColumn);

						var SubboardHeaderFishColumn = document.createElement('td');
						SubboardHeaderFishColumn.style.textAlign = "center";
						SubboardHeaderFishColumn.style.color = "#FFFFFF";
						SubboardHeaderFishColumn.style.fontWeight = "bold";
						SubboardHeaderFishColumn.style.paddingBottom = SubboardHeaderFishColumn.style.paddingTop = '2px';
						SubboardHeaderFishColumn.innerHTML = "Fish";
						SubboardHeadersRow.appendChild(SubboardHeaderFishColumn);
						
						for (var j = 0; j < 15; j++) //jsonResponse[i].length
						{
					
							if (j == 0)
							{
								var SubboardRow = document.createElement('tr');
								var MainColumn = document.createElement('td');
								MainColumn.style.verticalAlign = "center";
								if (jsonResponse[i][j])
									MainColumn.innerHTML = "<b>1. " + jsonResponse[i][j].Name + "</b><br><b>Fish Caught: </b>" + jsonResponse[i][j].Fish + "<br><b>Score: </b>" + jsonResponse[i][j].Score;
								else
									MainColumn.innerHTML = "<b>1. </b><br><b>Fish Caught: </b>0<br><b>Score: </b>0";
								var IconColumn = document.createElement('td');
								IconColumn.align = "right";
								if (jsonResponse[i][j])
									IconColumn.innerHTML = "<img src=\"" + jsonResponse[i][j].Icon + "\" border=\"0\" height=\"50\" width=\"50\">";
								else
									IconColumn.innerHTML = ""; //something more useful to do here? ><
								SubboardRow.appendChild(MainColumn);
								SubboardRow.appendChild(document.createElement('td'));
								SubboardRow.appendChild(IconColumn);
								SubboardTable.appendChild(SubboardRow);
							}
							else
							{
								var SubboardRow = document.createElement('tr');
								if (j % 2 == 0)
									SubboardRow.className = Categories[i]+"Even";
								else
									SubboardRow.className = Categories[i]+"Odd";
								var NameColumn = document.createElement('td');
								NameColumn.style.paddingBottom = NameColumn.style.paddingTop = '2px';
								if (jsonResponse[i][j])
									NameColumn.innerHTML = (j+1)+". <b>" + jsonResponse[i][j].Name + "</b>";
								else
									NameColumn.innerHTML = (j+1)+". <b></b>";
								var ScoreColumn = document.createElement('td');
								if (jsonResponse[i][j])
									ScoreColumn.innerHTML = jsonResponse[i][j].Score;
								else
									ScoreColumn.innerHTML = 0;
								var FishColumn = document.createElement('td');
								if (jsonResponse[i][j])
									FishColumn.innerHTML = jsonResponse[i][j].Fish;
								else
									FishColumn.innerHTML = 0;
								SubboardRow.appendChild(NameColumn);
								SubboardRow.appendChild(ScoreColumn);
								SubboardRow.appendChild(FishColumn);
								SubboardTable.appendChild(SubboardRow);
							}
						}
					}

					var InsertPoint = Context.snapshotItem(Context.snapshotLength-1);				
		
					//var ScoreboardsTable = document.createElement('table');

					//ScoreboardsTable.style.fontSize = '10px';
					//ScoreboardsTable.align = "center";

					var FirstRow = document.createElement('tr');
					var OverallColumn = document.createElement('td');
					SetupColumnVisible(OverallColumn, "UnofficialScoreboard");
					OverallColumn.appendChild(Subboards[0]);
					OverallColumn.colSpan = 3;
					OverallColumn.align = "center";
					FirstRow.appendChild(OverallColumn);

					var SecondRow = document.createElement('tr');
					var BasskenColumn = document.createElement('td');
					SetupColumnVisible(BasskenColumn, "UnofficialScoreboard");
					BasskenColumn.appendChild(Subboards[1]);
					SecondRow.appendChild(BasskenColumn);
					var GambinoColumn = document.createElement('td');
					SetupColumnVisible(GambinoColumn, "UnofficialScoreboard");
					GambinoColumn.appendChild(Subboards[2]);
					SecondRow.appendChild(BasskenColumn);
					SecondRow.appendChild(GambinoColumn);

					var ThirdRow = document.createElement('tr');
					var DuremColumn = document.createElement('td');
					SetupColumnVisible(DuremColumn, "UnofficialScoreboard");
					DuremColumn.appendChild(Subboards[3]);
					var JunkColumn = document.createElement('td');
					SetupColumnVisible(JunkColumn, "UnofficialScoreboard");
					JunkColumn.appendChild(Subboards[4]);
					ThirdRow.appendChild(DuremColumn);
					ThirdRow.appendChild(JunkColumn);

					//ScoreboardsTable.appendChild(FirstRow);
					//ScoreboardsTable.appendChild(SecondRow);
					//ScoreboardsTable.appendChild(ThirdRow);

					var OptRow = document.createElement('tr');
					var OptColumn = document.createElement('td');
					SetupColumnVisible(OptColumn, "UnofficialScoreboard");
					OptColumn.colSpan = 3;
					OptColumn.align = "right";
					OptColumn.appendChild(CreateOptButton());
					OptRow.appendChild(OptColumn);

					InsertAfter(InsertPoint, OptRow);
					InsertAfter(InsertPoint, ThirdRow);
					InsertAfter(InsertPoint, SecondRow);
					InsertAfter(InsertPoint, FirstRow);

					var ExpandCollapseRow = document.createElement('tr');
					var ExpandCollapseColumn = document.createElement('td');
					ExpandCollapseColumn.colSpan = 3;
					ExpandCollapseColumn.align = "right";
					ExpandCollapseDiv = document.createElement("div");
					ExpandCollapseDiv.style.border = "2px black solid";
					ExpandCollapseDiv.style.textAlign = "center";
					ExpandCollapseDiv.style.width = "15px";
					var Hidden = GM_getValue("UnofficialScoreboard Hidden", false);
					function ChangeButton()
					{
						if (Hidden)
							ExpandCollapseDiv.innerHTML = "x";
						else
							ExpandCollapseDiv.innerHTML = "+";
						Hidden = !Hidden;
						ToggleColumns("UnofficialScoreboard");
					}
					ExpandCollapseDiv.addEventListener('click', ChangeButton, false);
					if (Hidden)
						ExpandCollapseDiv.innerHTML = "+";
					else
						ExpandCollapseDiv.innerHTML = "x";
					ExpandCollapseColumn.appendChild(ExpandCollapseDiv);
					ExpandCollapseRow.appendChild(ExpandCollapseColumn);
					InsertAfter(InsertPoint, ExpandCollapseRow);
					
					var BannerRow = document.createElement('tr');
					var BannerColumn = document.createElement('td');
					BannerColumn.colSpan = 3;
					BannerColumn.align = "center";
					BannerImg = document.createElement('img');
					BannerImg.src = UnofficialScoreboardBanner;
					BannerColumn.appendChild(BannerImg);
					BannerRow.appendChild(BannerColumn);
					InsertAfter(InsertPoint, BannerRow);

				}
				catch (exception)
				{
					GM_log(exception);toggle
				}
			}
		}
	}
	);
}

function SetupColumnVisible(Column, Id)
{
	Column.id = Id;
	if (GM_getValue(Id + " Hidden", false))
		Column.className = "Hidden";
	else
		Column.className = "Shown";
}

function GetActiveFishers()
{
	//GM_log("Getting active fishers...");
	GM_xmlhttpRequest(
	{
		method: 'GET',
		url: 'http://fish.acornscity.com/export/currentfishers.json',
		onload: function(responseDetails)
		{
			//GM_log("Is JSON?");
			if (isJSON(responseDetails.responseText))
			{
				//GM_log("Yes, it is.");
				try
				{
					//GM_log("Parsing response test...");
					var jsonResponse = eval('(' + responseDetails.responseText + ')');
					var LakeNames = new Array('Overall', 'Bassken', 'Gambino', 'Durem', 'Junk');
					for (var j = 0; j < LakeNames.length; j++)
					{
						LakeName = LakeNames[j];
						if (Names[LakeName])
						{
							//GM_log(LakeName);
							//var usedCount = 0;
							//var Matching = new Object();
							for (var i = 0; i < Names[LakeName].length; i++)
							{
								if (jsonResponse[LakeName])
								{
									var ToCheck = Names[LakeName][i].nodeValue;
									if (ToCheck.substring(0, 3) == "1. ")
										ToCheck = ToCheck.substring(3);
									//GM_log("Checking: " + ToCheck);
									if (jsonResponse[LakeName][ToCheck])
									{	
										//GM_log("Matched " + ToCheck)
										//usedCount++;
										Names[LakeName][i].parentNode.style.color = '#0000EE';

										//Matching[ToCheck] = true;
									}
								}
							}
							//var potentialCount = 0;
							//for (k in jsonResponse[LakeName])
							//{
							//	if (!Matching[k])
							//		GM_log(k + " was unmatched! ><");
							//	potentialCount++;
							//}
							//GM_log(usedCount + " of " + potentialCount);
						}
					}
				}
				catch (exception)
				{
					GM_log(exception);
				}
			}
		}
	}
	);
}

function ModifyLakes(TopIndex, BottomIndex, Context)
{
	var Lakes = XPathQuery("td", Context.snapshotItem(TopIndex));
	SetupColumnVisible(Lakes.snapshotItem(0), "OfficialScoreboard");
	SetupColumnVisible(Lakes.snapshotItem(1), "OfficialScoreboard");
	ProcessLake("Bassken", XPathQuery("table/tbody/tr", Lakes.snapshotItem(0)), "BasskenEven", "BasskenOdd");
	ProcessLake("Gambino", XPathQuery("table/tbody/tr", Lakes.snapshotItem(1)), "GambinoEven", "GambinoOdd");
	Lakes = XPathQuery("td", Context.snapshotItem(BottomIndex));
	SetupColumnVisible(Lakes.snapshotItem(0), "OfficialScoreboard");
	SetupColumnVisible(Lakes.snapshotItem(1), "OfficialScoreboard");
	ProcessLake("Durem", XPathQuery("table/tbody/tr", Lakes.snapshotItem(0)), "DuremEven", "DuremOdd");
	ProcessLake("Junk", XPathQuery("table/tbody/tr", Lakes.snapshotItem(1)), "OverallEven", "OverallOdd");
}

function ModifyPersonalHistory()
{
	var OverallHeader = document.getElementById("statheader");
	Overall = XPathQuery("tr", nthAncestor(OverallHeader, 2));
	if (GM_getValue("OptionalScoreboard", false))
		SubmitScores(Overall);
	OverallHeader.setAttribute("colspan", 15);
	AddOverallHeaders(XPathQuery("td", nthAncestor(OverallHeader, 2).childNodes[6]));
	ProcessOverallRows(Overall, false, false);
	var Link = Overall.snapshotItem(Overall.snapshotLength-1).firstChild
	if (Link.setAttribute)
		Link.setAttribute("colspan", 15);
	
	var Categories = nthAncestor(OverallHeader, 6);
	var Bassken = Categories.childNodes[4];
	var Gambino = Categories.childNodes[10];
	var Durem = Categories.childNodes[16];
	var Junk = Categories.childNodes[22];
	var BasskenFish = PercentageFish(Bassken);
	var GambinoFish = PercentageFish(Gambino);
	var DuremFish = PercentageFish(Durem);
	var JunkFish = PercentageFish(Junk);
	var BasskenStats = ModifyLakeStats(Bassken, "BasskenEven", "BasskenOdd");
	var GambinoStats = ModifyLakeStats(Gambino, "GambinoEven", "GambinoOdd");
	var DuremStats = ModifyLakeStats(Durem, "DuremEven", "DuremOdd");
	var JunkStats = ModifyJunkStats(Junk, "OverallEven", "OverallOdd");
	
	CreateOverallCategory(Categories, BasskenFish, BasskenStats, GambinoFish, GambinoStats, DuremFish, DuremStats, JunkFish, JunkStats);
}

var BasskenSmall = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02G%9C%8F%A9%CB%ED%0F%A3%9CMXA%D5%DD7%0F%0EZ%0Bx%84%A6a%8A_%CA%86e%0Bwo%DC%26t%AD%DDd%A5%CB%8E%8F%83%C8X%9E%19%A7h%DC%20%93%AA%A5k%89%3ABW%CA)%15c%8Db%B3Q%AE%F7%0B%0ES%0A%00%3B";
var BasskenMedium = "data:image/gif,GIF89a%1E%00%1E%00%A2%00%00%00%00%00%FF%FF%FFAA%40A%40%40%40%40%40%FF%FF%FF%00%00%00%00%00%00!%F9%04%01%00%00%05%00%2C%00%00%00%00%1E%00%1E%00%00%03YX%BA%DC%FE0%CAI%AB%5D%E4%C2%8C%09%D7%1D%E7y%60%98%8DcY%A0%2C%E9%7Co%DB%C6%8F%2C%C7%B0b%CF%0D%DA%EF6%9D%CF%04%2C~%8CH%D7*Y%5C%0C%98M%85%00%1A%5DR%83B(%83%B5e%D6%94Y%E4%06g%04%25K%E00%3A%3D%D4%A4~9Kz%A9%AA%DB%EF%A5%04%00%3B";
var BasskenLarge = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02M%9C%8F%A9%CB%ED%0F%A3%1CB%CCW%EBE%B9%F7%ED%85%D9%24%96%16d%9AXZ%3A%EC%AB%1D%F0%7C%D20e%BFx%AE%EE%BC(%FB%01%83%C2%0F%A7%18K%20O%0A%9B%C1%B8%A0%3DG%AB!%91%19%81%1E7S%EC%94%EB%F2%82%95%E3%B2%F9%CC(%00%00%3B";
var BasskenRare = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02N%9C%8F%A9%CB%ED%EF%84%80tHY%D5%DD%3B%1B%0E%5EYHNPY%3Eh%DA%AC.v%BC%B29%BFV%ED%DE8%BB%A3_O%FA%01A%C2%A1%A8h4%E9v%C5%18%B0%89%9C9aK)%82%3A%95%25%B0%D5%D5%82k%FD~C%9E%B2%F9%8C%3E%17%00%00%3B";

var GambinoSmall = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02I%9C%8F%A9%CB%ED%0Fc%13%94%CAY%B3%B8H%FB%2C%7Db%F5%8C%A6c%9E%DD6%A4%E3j%B9%22%1C%CBvk%DF%F9%8D%EFj%EF%9B%19%82%2C%CF%81H%A3%E5%20%BE%0B%CFi9F9%C3)%95a%BD.X%DAI%F7%0B%0E%8B%C7%87%02%00%3B";
var GambinoMedium = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02Q%9C%8F%A9%CB%ED%23%9EL%A2%CE%5Bc%BC.%5B%DEx%1B%B8%88X%E7M)%B2%99%D2jX%E2%88~%D0%9C%BD)%0E%B3%FC%DF%BB%01%876%A2qt%24%FA%92%BF%25%93%E7%7C%BA%A2R%5B%AC%3A%15bW%5B%99u%FB%90%82%92%A4%2B%D7Z.%A5%D7%ECE%01%00%3B";
var GambinoLarge = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02%5C%9C%8F%23%C9%B8%9D%C4%83%8E%BAi%A5%3D%12C%FFu%E0%B5%19%A2%16%96%CA%F9%A0%E6%C8%B0b%04_%B2%BB%96%F7%C9%D5%EB%3E%7BQ%802a%83H%3C%22%81%B1%25%93%E6%BC)%A3E(%95e%BB%B6%3A%3F-%86%DB%A56'Z%A5u%A9%0AKq%3Ai%3A%04~%C3%E5m%BA%CE%BE%F15%0A%00%3B";
var GambinoRare = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02S%9C%8F%A9%CB(%0FE%9B%26ZI%D5%85%99m%DCi%1FxX%DE%88rI%CA%3Ek%3B%8A%F0%B6%CC%9Fl_o%AE%3B%3C%5D%FA%F5*%C2a%D1x%8C%04%93.%22%13%F4lF%5D%D4)fVZ6%9D%A8%86r%C7%F9%9EB%03%D58%24%16%91%9D5%D2%BAS%00%00%3B";

var DuremSmall = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02E%9C%8F%A9%CB%ED%0F%A3%9C%B4%3A%81%85U%B9%E7%ED%85%DA%24%8AdiBh%89%60%DC%9A%0E_%0B%A7%1D%5D%D7G%9E%EF%7C%2F%FB%E9%82%C2%95%AF82%CC%94%C5HS2%B4%B06%AF%245%B1%BCj%B7%DC%AE%97Z%00%00%3B";
var DuremMedium = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02K%9C%8F%A9%CB%ED%EF%84%80O%DAK%D5%DD2%23%0EbQHvL%89%9E(%A9%AE%E1g%B8%E5%D1%C9%F6%60%CBx%BE%EE%FC%FC%0B%0A%87%40%22%CD4L%98%7C%3C%E5%E4%98%F3%C4zR%E6ST%F59%B3%D3'W%E3%FDj%C4%E42%A4%00%00%3B";
var DuremLarge = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02Q%9C%8F%A9%CB%9D%E2%E2%12P2%8A%B3U%B9%D3%7Dxbe%8D%22h%9ER%AA%3Al%DB%BC0i%C8c%88%D8f%1D%EA%F7W%F3%A5%82%C2%DD%A08%3C%22o%C4%A5F%E9%FCH%A3%18%1E%15xl.q%BD-%2F%E7%8D%157%3A%94%0D%D4%7C%60%D1%ECA%01%00%3B";
var DuremRare = "data:image/gif,GIF89a%1E%00%1E%00%91%00%00%00%00%00%FF%FF%FF%40%40%40%FF%FF%FF!%F9%04%01%00%00%03%00%2C%00%00%00%00%1E%00%1E%00%00%02X%9C%8F%23%C9%ED%B7%9E%8A%8E%1A%2B2%D5%15o%9DM%20%C3%5D%DF%08%96H(%A6%A8K.%EEL%C7%F4%9D%DAx%DD%EC%FC%E3%BB%01%83%3F%1Dq%D4%3B%CE%8CJ%95%A9%09%83%40%A3O%E8%D0%DA%99R%B5%3C%AEe%C5%CDj%C5%D3k%CE'%11%25%BA%AC4%98%EA%96%7C%E3%F4t%01%00%3B";


function CreateOverallCategory(Categories, BasskenFish, BasskenStats, GambinoFish, GambinoStats, DuremFish, DuremStats, JunkFish, JunkStats)
{
	var BreakRow = document.createElement("tr");
	var BreakColumn = document.createElement("td");
	BreakColumn.setAttribute("colspan", 7);
	BreakColumn.innerHTML = "<span class=\"norm\">&nbsp;</span>";
	BreakRow.appendChild(BreakColumn);
	
	var OverallHeaderRow = document.createElement("tr");
	var OverallHeaderColumn = document.createElement("td");
	OverallHeaderColumn.className = "OverallPersonalHeader";
	OverallHeaderColumn.setAttribute("colspan", 2);
	OverallHeaderColumn.innerHTML = "<span class=\"norm\" style=\"color: rgb(255, 255, 255);\"><b>&nbsp;ÔøΩ&nbsp;Overall</b></span>"
	OverallHeaderRow.appendChild(OverallHeaderColumn);

	var OverallRow = document.createElement("tr");
	var OverallFirstColumn = document.createElement("td");
	OverallFirstColumn.style.verticalAlign = "top";
	var OverallSecondColumn = document.createElement("td");
	OverallSecondColumn.style.verticalAlign = "top";
	OverallSecondColumn.style.width = "250";
	OverallRow.appendChild(OverallFirstColumn);
	OverallRow.appendChild(OverallSecondColumn);

	var NumTimesFished = BasskenStats.NumTimesFished + GambinoStats.NumTimesFished + DuremStats.NumTimesFished;
	var TotalFish = BasskenStats.TotalFish + GambinoStats.TotalFish + DuremStats.TotalFish + JunkStats.TotalFish;
	var TotalScore = BasskenStats.TotalScore + GambinoStats.TotalScore + DuremStats.TotalScore + JunkStats.TotalScore;
	var TotalTime = IntToTimeString(BasskenStats.TotalTime + GambinoStats.TotalTime + DuremStats.TotalTime);
	var PerformanceIndex = TotalScore/(20*TotalFish);
	var FinalScore = Round(PerformanceIndex*TotalScore, 0);
	PerformanceIndex = Round(100*PerformanceIndex, 1) + "%";

	OverallFishTable = "<table border=\"0\" cellpadding=\"1\" cellspacing=\"1\"><tbody><tr><td width=\"30\"><img src=\""+BasskenSmall+"\" alt=\"Bass'ken Small\" Bass'ken Small\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Bass'ken Small<br><b>Caught:</b> " + BasskenFish[1] + "</div></td><td width=\"30\"><img src=\""+GambinoSmall+"\" alt=\"Gambino Small\" title=\"Gambino Small\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Gambino Small<br><b>Caught:</b> " + GambinoFish[1] + "</div></td><td width=\"30\"><img src=\""+DuremSmall+"\" alt=\"Durem Small\" title=\"Durem Small\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Durem Small<br><b>Caught:</b> " + DuremFish[1] + "</div></td></tr><tr><td width=\"30\"><img src=\""+BasskenMedium+"\" alt=\"Bass'ken Medium\" title=\"Bass'ken Medium\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Bass'ken Medium<br><b>Caught:</b> " + BasskenFish[2] + "</div></td><td width=\"30\"><img src=\""+GambinoMedium+"\" alt=\"Gambino Medium\" title=\"Gambino Medium\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Gambino Medium<br><b>Caught:</b> " + GambinoFish[2] + "</div></td><td width=\"30\"><img src=\""+DuremMedium+"\" alt=\"Durem Medium\" title=\"Durem Medium\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Durem Medium<br><b>Caught:</b> " + DuremFish[2] + "</div></td></tr><tr><td width=\"30\"><img src=\""+BasskenLarge+"\" alt=\"Bass'ken Large\" title=\"Bass'ken Large\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Bass'ken Large<br><b>Caught:</b> " + BasskenFish[3] + "</div></td><td width=\"30\"><img src=\""+GambinoLarge+"\" alt=\"Gambino Large\" title=\"Gambino Large\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Gambino Large<br><b>Caught:</b> " + GambinoFish[3] + "</div></td><td width=\"30\"><img src=\""+DuremLarge+"\" alt=\"Durem Large\" title=\"Durem Large\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Durem Large<br><b>Caught:</b> " + DuremFish[3] + "</div></td></tr><tr><td width=\"30\"><img src=\""+BasskenRare+"\" alt=\"Bass'ken Rare\" title=\"Bass'ken Rare\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Bass'ken Rare<br><b>Caught:</b> " + BasskenFish[4] + "</div></td><td width=\"30\"><img src=\""+GambinoRare+"\" alt=\"Gambino Rare\" title=\"Gambino Rare\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Gambino Rare<br><b>Caught:</b> " + GambinoFish[4] + "</div></td><td width=\"30\"><img src=\""+DuremRare+"\" alt=\"Durem Rare\" title=\"Durem Rare\" height=\"30\" width=\"30\"></td><td nowrap=\"nowrap\" valign=\"top\" width=\"120\"><div id=\"fishname\"><!--<b>Name:</b> -->Durem Rare<br><b>Caught:</b> " + DuremFish[4] + "</div></td></tr></tbody></table>";
	OverallStatTable = "<table border=\"0\" cellpadding=\"3\" cellspacing=\"1\" width=\"100%\"><tbody><tr bgcolor=\"#dddddd\"><td id=\"statname\" align=\"right\" width=\"66%\"><span class=\"postdetails\"><b>Number Times Fished</b></span></td><td id=\"statnum\" width=\"34%\"><span class=\"postdetails\">" + NumTimesFished + "</span></td></tr><tr bgcolor=\"#eeeeee\"><td id=\"statname\" align=\"right\" width=\"66%\"><span class=\"postdetails\"><b>Total Fish</b></span></td><td id=\"statnum\" width=\"34%\"><span class=\"postdetails\">" + TotalFish + "</span></td></tr><tr bgcolor=\"#dddddd\"><td id=\"statname\" align=\"right\" width=\"66%\"><span class=\"postdetails\"><b>Total Score</b></span></td><td id=\"statnum\" width=\"34%\"><span class=\"postdetails\">" + TotalScore + "</span></td></tr><tr bgcolor=\"#eeeeee\"><td id=\"statname\" align=\"right\" width=\"66%\"><span class=\"postdetails\"><b>Performance Index</b></span></td><td id=\"statnum\" width=\"34%\"><span class=\"postdetails\">" + PerformanceIndex + "</span></td></tr><tr bgcolor=\"#dddddd\"><td id=\"statname\" align=\"right\" width=\"66%\"><span class=\"postdetails\"><b>Final Score</b></span></td><td id=\"statnum\" width=\"34%\"><span class=\"postdetails\">" + FinalScore + "</span></td></tr><tr bgcolor=\"#eeeeee\"><td id=\"statname\" align=\"right\" width=\"66%\"><span class=\"postdetails\"><b>Total Time Fishing</b></span></td><td id=\"statnum\" width=\"34%\"><span class=\"postdetails\">" + TotalTime + "</span></td></tr></tbody></table>";

	OverallFirstColumn.innerHTML = OverallFishTable;
	OverallSecondColumn.innerHTML = OverallStatTable;

	var InsertPoint = Categories.childNodes[2];

	InsertBefore(InsertPoint, OverallHeaderRow);
	InsertBefore(InsertPoint, OverallRow);
	InsertBefore(InsertPoint, BreakRow);
}

function ModifyLakeStats(Category, Even, Odd)
{
	var Stats = new Object();
	var StatNames = XPathQuery("td/table/tbody/tr/td[@id='statname']/span/b", Category);
	var StatNums = XPathQuery("td/table/tbody/tr/td[@id='statnum']/span", Category);
	if (StatNames.snapshotLength < 4) //Haven't caught any fish
	{
		StatNums.snapshotItem(0).innerHTML = "0";
		Stats.NumTimesFished = 0;
		Stats.TotalFish = 0;
		Stats.TotalScore = 0;
		Stats.TotalTime = 0;
	}
	else
	{
		Stats.NumTimesFished = parseInt(StatNums.snapshotItem(0).innerHTML);
		Stats.TotalFish = parseInt(StatNums.snapshotItem(1).innerHTML);
		Stats.TotalScore = parseInt(StatNums.snapshotItem(2).innerHTML);
		Stats.TotalTime = TimeStringToInt(StatNums.snapshotItem(3).innerHTML);
	}
	nthAncestor(StatNums.snapshotItem(0), 3).appendChild(CreateStatRow("Junk or Empty", Stats.NumTimesFished*18-Stats.TotalFish, Odd));
	var PI = Round(100*Stats.TotalScore/(20*Stats.TotalFish), 1);
	if (isNaN(PI))
		PI = 0;
	nthAncestor(StatNums.snapshotItem(0), 3).appendChild(CreateStatRow("Performance Index", PI + "%", Even));
	return Stats;
}

function TimeStringToInt(TimeString)
{
	var TotalTime = 0;
	var TimeSplit = TimeString.split(" ");
	for (var i = 0; i < TimeSplit.length; i++)
	{
		if (TimeSplit[i].indexOf('s') > -1)
			TotalTime += parseInt(TimeSplit[i]);
		else if (TimeSplit[i].indexOf('m') > -1)
			TotalTime += 60*parseInt(TimeSplit[i]);
		else if (TimeSplit[i].indexOf('h') > -1)
			TotalTime += 3600*parseInt(TimeSplit[i]);
		else if (TimeSplit[i].indexOf('d') > -1)
			TotalTime += 86400*parseInt(TimeSplit[i]);
	}
	return TotalTime;
}

function IntToTimeString(TotalTime)
{
	var Days = Math.floor(TotalTime/86400);
	TotalTime = TotalTime % 86400;
	var Hours = Math.floor(TotalTime/3600);
	TotalTime = TotalTime % 3600;
	var Minutes = Math.floor(TotalTime/60);
	TotalTime = TotalTime % 60;
	var Seconds = Math.floor(TotalTime);
	
	var TimeString;
	if (Days > 0)
	{
		TimeString = Days + "d " + Hours + "h " + Minutes + "m " + Seconds + "s";
	}
	else if (Hours > 0)
	{
		TimeString = Hours + "h " + Minutes + "m " + Seconds + "s";
	}
	else if (Minutes > 0)
	{
		TimeString = Minutes + "m " + Seconds + "s";
	}
	else
	{
		TimeString = Seconds + "s";
	}
	return TimeString;
}

function ModifyJunkStats(Category, Even, Odd)
{
	var Stats = new Object();
	var StatNames = XPathQuery("td/table/tbody/tr/td[@id='statname']/span/b", Category);
	var StatNums = XPathQuery("td/table/tbody/tr/td[@id='statnum']/span", Category);
	if (StatNames.snapshotLength < 2) //Haven't caught any junk
	{
		Stats.TotalFish = 0;
		Stats.TotalScore = 0;
	}
	else
	{
		Stats.TotalFish = parseInt(StatNums.snapshotItem(0).innerHTML);
		Stats.TotalScore = parseInt(StatNums.snapshotItem(1).innerHTML);
		var AverageValue = Round(Stats.TotalScore/(Stats.TotalFish), 6);
		if (isNaN(AverageValue))
			AverageValue = 0;
		nthAncestor(StatNums.snapshotItem(0), 3).appendChild(CreateStatRow("Average Value", AverageValue, Odd));
	}
	return Stats;
}

function CreateStatRow(Name, Num, Class)
{
	var StatName = CreateElement("td", "", "statname", "<span class=\"postdetails\"><b>" + Name + "</b></span>");
	StatName.style.align = "right";
	StatName.style.width = "66%";
	var StatNum = CreateElement("td", "", "statnum", "<span class=\"postdetails\">" + Num + "</span>");
	StatNum.style.width = "34%";
	var Row = CreateElement("tr", Class, "", "");
	Row.appendChild(StatName);
	Row.appendChild(StatNum);
	return Row;
}

function SetupContext()
{
	var Context = document.getElementById('content');
	Context = XPathQuery("div/table/tbody/tr", Context).snapshotItem(1);
	Context = XPathQuery("td", Context).snapshotItem(1);
	Context = XPathQuery("div", Context).snapshotItem(0);
	Context = XPathQuery("table/tbody/tr", Context);
	return Context;
}

//Type:
//0: Junk
//1: Small
//2: Medium
//3: Large
//4: Rare

var FishValues = new Object();

FishValues["Yellow Guppy"] =		1;
FishValues["Orange Guppy"] =		1;
FishValues["Red Guppy"] =		1;
FishValues["Green Bass"] =		2;
FishValues["Blue Bass"] =		2;
FishValues["Brown Bass"] =		2;
FishValues["Green Striper"] =		3;
FishValues["Blue Striper"] =		3;
FishValues["Gray Striper"] =		3;
FishValues["Mutha Guppa"] =		4;
FishValues["Big Mouth Bass'terd"] =	4;
FishValues["Candy Striper"] =		4;

FishValues["Green Seedkin"] =		1;
FishValues["Blue Seedkin"] =		1;
FishValues["Pink Seedkin"] =		1;
FishValues["Warm Rainbow Trout"] =	2;
FishValues["Cool Rainbow Trout"] =	2;
FishValues["Frozen Rainbow Trout"] =	2;
FishValues["Spicy Tuna"] =		3;
FishValues["Dicy Tuna"] =		3;
FishValues["Icy Tuna"] =		3;
FishValues["Buckin' Bino"] =		4;
FishValues["Tootin' Tino"] =		4;
FishValues["Chargin' Chino"] =		4;

FishValues["White Pebbo Feeder"] =	1;
FishValues["Brown Pebbo Feeder"] =	1;
FishValues["Black Pebbo Feeder"] =	1;
FishValues["Bluestone Biter"] =		2;
FishValues["Black Rocque Biter"] =	2;
FishValues["Pyrite Biter"] =		2;
FishValues["Stone Boldur"] =		3;
FishValues["Sand Boldur"] =		3;
FishValues["Slate Boldur"] =		3;
FishValues["Diamondback Lion"] =	4;
FishValues["Emeraldback Lion"] =	4;
FishValues["Rubyback Lion"] =		4;

FishValues["Big Old Tire"] =		0;
FishValues["Old Boot"] =		0;
FishValues["Old Can"] =			0;

// New Catches after the update

FishValues["Red Bubble-Eye Goldfish"] =		1;
FishValues["Gold Bubble-Eye Goldfish"] =	1;
FishValues["Black Bubble-Eye Goldfish"] =	1;
FishValues["Kohaku Koi"] =			2;
FishValues["Ochiba Koi"] =			2;
FishValues["Yamabuki Koi"] =			2;
FishValues["Russian Catfish"] =			3;
FishValues["Tigerstripe Catfish"] =		3;
FishValues["Witchling Catfish"] =		3;

FishValues["Berry Balloonfish"] =		1;
FishValues["Peach Balloonfish"] =		1;
FishValues["Bubblegum Balloonfish"] =		1;
FishValues["Electric Jelly"] =			2;
FishValues["Sulfuric Jelly"] =			2;
FishValues["Acidic Jelly"] =			2;
FishValues["Blood Ironjaw"] =			3;
FishValues["Hematite Ironjaw"] =		3;
FishValues["Titanium Ironjaw"] =		3;

FishValues["Moss Mutant Crab"] =		1;
FishValues["Rusted Mutant Crab"] =		1;
FishValues["Slate Mutant Crab"] =		1;
FishValues["By-A-Mile Racerfish"] =		2;
FishValues["By-An-Inch Racerfish"] =		2;
FishValues["Ten-Second Racerfish"] =		2;
FishValues["Firemane Hellfish"] =		3;
FishValues["Ethermane Hellfish"] =		3;
FishValues["Ectomane Hellfish"] =		3;

FishValues["Driftwood"] =			0;


function SetupTypeArray()
{
	var Type = new Array();
	Type[0] = Type[1] =  Type[2] =  Type[3] =  Type[4] = 0;
	return Type;
}

function PercentageFish(Category)
{
	var Type = SetupTypeArray();
	var Items = XPathQuery("td/table/tbody/tr/td/div[@id='fishname']", Category);
	var TotalItems = 0;
	var IndividualItems = new Array();
	for (var i = 0; i < Items.snapshotLength; i++)
	{
		IndividualItems[i] = parseInt(Items.snapshotItem(i).lastChild.nodeValue);
		var Value = FishValues[Items.snapshotItem(i).childNodes[1].nodeValue];
		Type[Value] += IndividualItems[i];
		TotalItems += IndividualItems[i];
	}
	for (var i = 0; i < Items.snapshotLength; i++)
	{
		Items.snapshotItem(i).lastChild.nodeValue += " (" + Round(100*IndividualItems[i]/TotalItems, 1) + "%)";
	}
	return Type;
}

var UnofficialScoreboardBanner = "data:image/gif,GIF89a%E9%00P%00%91%00%00%00%00%00%FF%FF%FF%FF%FF%FF%00%00%00!%F9%04%01%00%00%02%00%2C%00%00%00%00%E9%00P%00%00%02%FF%94%8F%A9%CB%ED%0F%A3%9C%B4%3E%80%AD%DE%BC%7B%9E5%E1Gn%D8X%A6*%82%AEf%CB%C2%EE%7C%9C'%8D%83r~%D9%8B%0D%E0%E5%80A%A1%B1%B7%3B*%80%3F%9FRE%7CB%8B%12%A7%94%11Md%AF%9F-%B7s%AB%86%BFZf%D9J%D6%10%A9i%F5%D8an%0B%D6g%F4%9C%DD%C5%E7%BDr%8A%1D%FB%F7u%033%88%F7%E6q%B8%17%94%D8%17%11%B8%F4xUXwW%13Yq%E9%96%C1%D8%08%97y%C7)%B9%D9RH%15%07%F6%E9W%DA%89%F9y%9A6yVi%C0%A7%19j%0B%CA%AAzK%9B*%B4%1A%B38%F2%FA%C2%DB%1A%92%A4%DBdL%CC%05l)%CCf%3C1%BD%1B%ADL%ED%EA%CBS%5B%DB%99%E8%94%8C%5D%A7G%DE%F7%DC%7B%8D%FD%E7S%3D%AE%ED%3ED%EC%7D%CE%8E%5C%3E%0E(%0E*%BE%2F%B2%DF%ADY1E%F8%D0%E5%F3%040%92%40%24%B9%96%81%5Bx%CC%1FBFt%0E%3A%E2%B5%90%DE%C4%80%FF%F6%B6m%C4'%26TE%8BH%40%A6%DB12%E4%1A%3D%CD%20%AA%8C%07%E9%96F%92%C1L%F2%2B%E8E%E4J4%1C)%FA%A3%C7%CC%CA!%974O~t%F8%A6e%96SJ%7Db%14%081%8E%1D%8F%16%2F5%95%3A%2F%E7%98%AB%E54z%CD(t*%CC%83V%3B%DE%BC%C9S%EB%B0%AC%1D%1F%7D%85%CAd%A4K%89%F5%92%F0%09%B3sKJ~%D0%1E%8A%ED%A9%13%F0%A8%A5_%8B%9E%C4%99%D6%D4J%B4%8Be16%A46%E5%DE%9A%91KEi%0C%C9p_%A4k%A5%C9%CDK%AA%F3%DF%C4%7D%8B%60%8Ei%3A%1C%9Dv%A0%87%D2e%15%A8b%D2%BD%AD%83A%E3%7B%3B%AC%E7%D62t%F3%DE%BA%DA%0C%D1u%A3%F1%86fk%F9s%EA%B5%9B%1BR6%EE%175%EB%CA%F7%F2j%A6%5C%86%AF_Nqw%B2%A8Y%03%FC%1C%7D%BE%ABo%87%DEv%F7d%C3%84%07%9B%8C%AA%5E%A1%DB%A0%B3%AD%93W%3C%BC%F4%EBw%DEq%23%FF%B50%17wc%91C%D5a%F1%E4W%15f%F2%ED%07%A0k%FE%F5%12%D1%80%A5%5D'%C6K%C0%05%F6%8B%83b%91%B1%1E%85%B6Y%88%9F%84%D9%A04%9BQ%96%C0%82%60Q%1E1U%A05Nyf%22%84%82%CC%E4a%8B%D2%E1%D0%A1n1%8AH%10%83d%F1%98%1D%0D%FD%A1v%E2%8E6%C9C%E3u6J1%24%91%CE%A9v%24%8E%1D%D6%B8%E4%11%DD%05%B6%5Cs%40%EA0%98%87%FF%F8%F8%C4%956M%07%DE%96%5C%AA%E3%A59%F9%88%09%C1i%A7%85iP%9A%87%AD%A9%1A%88%04F)d%9Cr%A6%C8%E4%80%B4%25)%25%9ArN%C8%9F%9F%C8%81I%02%99%83bW(%98%B1U%B9%87s%8B%C6H%9C%84%18%A2((%92H%9A%19(%A73v%D5%A5%11%90%1E%F5%23%9F%00%E6%19%1D%A2%11%A2%3A*7%80%EA%F3%E5%91%A9L%F6j%3A%ABN%14%A1%A7%9B%8E%05%9674%BE%19KH%92%C6%9AL%AD%D3%E1)%C7%94%9C%FFq%F6J%93%94%B8%B6%8D%7D%F7%95D%14%94%C8%B6%A1%ECs%88%01%EB%ACQ%E7%8D%F8%26%A3%1F%95%85%1E%7BI%BE%25%EDc%84X%E6%E4E%A0%FDg%ABt%BD%9Awm%B23%A1%8B%5E%88%8C%C9%F2(%0A%CD%B6%B7%EE%85%2C%25%D7%9B%B5%BAf%C8%D5%7B%91%19Y%5C%C1%C7%F9%BB%B0%B8%FF%8A%160%C5%AA%3As%17%7C%2C%9A%A7%A6~%F0%CE%A9%9Fz%DA%EE%FB!%A1%1E%3F%96%19%9D%E5%15%9B%B1%7B7%1Ax_%88%16C63%CA%94%82%0CsC%1B'x%ACL%1C%C5KI%CE%F2%CA%1C%0D%5B!%AB%7B3%C3W%86%DC*%C2%DDn%F6%17%D0A%87%DB%D8e%EC%96%1C%9C%7B%40%E5%7B%B5%BA%F5rX%9B%93%A4%0D%5Bf%7FV%8B%A6%DD%D8%5E%CF%0C%D2%B163%AD%99pf1%5D%DD%B8%CB)(%F0%2C%DE%EA%E8%E6%BDYs%A5%A4%DC%06%C7%17%ADr%92%B9%3D%9E%B6%10%1B8%B0%CF%00%1Flo%7D%DD%86%3B%EE%9D4V%E3%8B%A5%AA%86_%0C%5B%D1C%DBU%20%5C%FDfR-%E7%13s%5E%97%E7%CC%06%8A%88%A9V%A2%5Ej%B6%81%C3%3E)%C6%94%D7%8E%3B%85O%E7%CE%FB%EC%90%F7%0E%7C%9F%B4%07O%7C%F1%C6%1F%8F%7C%F2%CA%2F%CF%7C%F3%CE%3F%0F%7D%F4%D2OO%7D%F5%D6_%8F%3D%0D%05%00%00%3B%0C%A7%40%1D%A6%D3%5BF%AB%5C%0F%E7%E6%C4%8A%F3%0D%5C%FD%1E%D8%92%E7%22%09%01%93%9B%02%25%1B%2B%03r%D0%A7%20%1E%89%04%1A%03B%00%00%3B";

var OptIn = "data:image/gif,GIF89ak%00%1C%00%E6%00%00%00%00%00%FF%FF%FF%F5%98%9D%F2m%7D%0F%0F%11%88%8B%97-.2%10%1848S%B17R%AF5O%A8%257u%234o%0B%10%236P%AA2J%9E%1D%2B%5B%16%20D%0D%13(%3CW%B4D%5E%B7Tl%BE%92%A2%D9%B0%BC%E6%C8%D1%F0KMT%A6%AA%B8%1D%2C%5E6R%AD5P%AA%2BA%8A%224n%1D%2C%5D8T%B28T%B17R%AE6Q%AC6Q%AB5P%A93M%A31J%9C0H%99-D%8F%2CB%8C*%3F%85)%3E%83(%3C%80(%3D%80!2i%1F%2Fc3L%A11I%9A%2B%40%87%269x%10%182%3AV%B3%3EY%B5%40%5B%B5F%60%B8Jd%BANg%BBPi%BCRk%BDZr%C1%5Eu%C2by%C4dz%C5h~%C7l%81%C8n%83%C9p%85%CAt%88%CCv%8A%CD%7C%8F%CF%84%96%D3%8A%9B%D5%90%A1%D8%98%A8%DB%9E%AD%DE%A0%AF%DF%A4%B2%E0%A6%B4%E1%AC%B9%E4%B2%BE%E6%B4%C0%E7%BA%C5%EA%BC%C7%EB%C0%CA%EC%C4%CE%EE%CA%D3%F1%CC%D5%F2%D0%D8%F3%D4%DC%F5%DA%E1%F8%E0%E6%FA%E2%E8%FB%C4%C9%DAy%7C%86%05%08%11%10%194%09%0E%1D%05%08%10%CE%D7%F2%D6%DE%F6%DC%E3%F8%DE%E5%F9ilu%D3%D9%EA%B5%BA%C9%3C%3ECZ%5Dd%1E%1F!%01%02%03%FF%FD%13%FF%FE%93%FF%FF%C7%FF%FF%EB%FF%EA%00%FF%CE%00%FF%C9%00%FF%B4%00%FE%9D%00EEE%FF%FF%FF%00%00%00%00%00%00%00%00%00%00%00%00!%F9%04%01%00%00%7B%00%2C%00%00%00%00k%00%1C%00%00%07%FF%80%7B%82%83%84%85%86%87%88%89%8A%8B%8C%8D%8E%8F%90%91%92%93%94%922%0A%25%08!!%15%3F%9E%9F%A0%A1%A2%A3%A4%A5%A6%A4%3B%9B!%24%0E2%95%86%1D!%14GNV%5D_%B8%B9%BA%BB%BC%BD%BE%BF%C0%C1%B9f%17%16C7%AB3%95%09!ET%BCz%D1%D1%C2%D4%D5%D6%D4gO%3E!%22%0F%91%B1AX%D0ztsrrv%D3%D7%EB%C2n%00%00a%ECP%3A!%09%8F%23!L%BD%E4sqqu%00%ED%E4%D1%23lM%987%EF%00%10%08%B3%86%9A%3Bx%BD%1E%C6c%C7E%C8%26%16%8C8%84h%B2%CF%1C%C0%8F%01%07%02%03C%20%A1I%02l%DA%BD%9B%C8.%18%1A%8B%22%16%CD%08q%C4%97%1E9u%00%80%CCY'%1D%B06%EF24%5C%93%E1%5D%9B%2Fa%82%1Axg%40%C3%17%A0%09Y%E6%92%F8%F4%9D%1B%84%00%DA4%04v%86B%08%13%8AF%DC%C8%D2%11%A0N%90%3A%EF%88%EC%B5%E6%1D%81%5D%25%FF%01%184i%92%0D%D4%95%BC%A8%DE5%A9F%98%85M%1F%12%85%00bs%80%80%9D%20%05%0C%20%D8%0B%8C%D1%5DP%C1%24%05%F0%A6%E1%C3%BET'S%FE%A2%F7%5D%DF%02%8F%83i%D9%D4B%B0%11%9B8y%AAN%8B%871%AF%B6%0Awa%9D%0B%F1%8B%86%C7%99%13%BE%E1%8C%17%AA%D3%DBY%85%A5%D9DC0%E1%7D%FFV%9B%ADs%A7%F5%2F%A8B%BF%10%7D%3C%B92o%00%98%3DG%EC%FD%EEwh%60%5B6%B9H%94%00%07%97%7Dv%3E%BE%CByV%ADk%5E%24%E9%BAM%A9%99nJ5Q%F3r%07%E0%3Dx0'%9B%80%90%88%0A!(aSz%881%E7%130%06a%A5%10C%B8L%D6%06TM%E1%C2%C6R%B5%E9%D2%19%7F%B6%7D%E7%0B%1A%3D%84%E0%40%19%8A(%10B%14%E8!%08%D2%1D%02%BD%C7%CEdR%B5%D4%92%17Dl%02%01%23%25L%00E%8Aw%F4%D8c%8B2%E6%02c%902vq%C4%265%00%D0%08%92%0A%CDl1%0E%1EP%E21%90%8BDV%C9N%15%3C%840%C2%06J%3A%B2%80%03%13%24%81%C18%D2XifKS%04%B1%C9%0A%12t%F9%88%180%3C%10%82%0FKHA%D6%99x%AEs%C5%13HxU%C2%0B6%BCSI%031%B8%90%82%26%3B%9C%A2%E8%A2%8C6%EAI%0E%9B%9C%E0%01%03%11%C0!%E8%2B%82%98%04%C7%18c%1C%E0%E9%A7%A0%86*%EA%A8%A4%96j%AA%A9d%C8%87%E9%AA%AC%B6%EA%EA%AB%B0%C6*%EB%AC%B4%D6j%EB%AD%B8%E6%AA%EB%AE%BC%F6jH%20%00%3B";
var OptOut = "data:image/gif,GIF89ak%00%1C%00%F7%00%00%00%00%00%FF%FF%FF%DEXZ%DCXZ%DBY%5B%D9%5B%5D%D6Z%5C%D5%5E%60%A0XY%91VWTKL%0F%0F%11%88%8B%97-.2%10%1848S%B17R%AF5O%A8%257u%234o%0B%10%236P%AA2J%9E%1D%2B%5B%16%20D%0D%13(%3CW%B4D%5E%B7Tl%BE%92%A2%D9%B0%BC%E6%C8%D1%F0KMT%A6%AA%B8%1D%2C%5E6R%AD5P%AA%2BA%8A%224n%1D%2C%5D8T%B28T%B17R%AE6Q%AC6Q%AB5P%A93M%A31J%9C0H%99-D%8F%2CB%8C*%3F%85)%3E%83(%3C%80(%3D%80!2i%1F%2Fc3L%A11I%9A%2B%40%87%269x%10%182%3AV%B3%3EY%B5%40%5B%B5F%60%B8Jd%BANg%BBPi%BCRk%BDZr%C1%5Eu%C2by%C4dz%C5h~%C7l%81%C8n%83%C9p%85%CAt%88%CCv%8A%CD%7C%8F%CF%84%96%D3%8A%9B%D5%90%A1%D8%98%A8%DB%9E%AD%DE%A0%AF%DF%A4%B2%E0%A6%B4%E1%AC%B9%E4%B2%BE%E6%B4%C0%E7%BA%C5%EA%BC%C7%EB%C0%CA%EC%C4%CE%EE%CA%D3%F1%CC%D5%F2%D0%D8%F3%D4%DC%F5%DA%E1%F8%E0%E6%FA%E2%E8%FB%C4%C9%DAy%7C%86%05%08%11%10%194%09%0E%1D%05%08%10%CE%D7%F2%D6%DE%F6%DC%E3%F8%DE%E5%F9ilu%D3%D9%EA%B5%BA%C9%3C%3ECZ%5Dd%1E%1F!%01%02%03%FF%FD%13%FF%FE%93%FF%FF%C7%DA%DA%AD%FF%EA%00%FC%E7%01%C1%B3%17to3%F7%E0%03%F4%DC%04%F2%DA%05%CC%BC%13%FF%CE%00PMA%FF%C9%00%FB%C6%02%F2%C0%05%CF%A7%12YS%3E%FF%B4%00%F8%B0%03LKIMIB%FE%9D%00RK%40%E5mM%E6hN%A2RRaQQZKKNGGJGG%DE%DE%DE%DB%DB%DB%A3%A3%A3%8F%8F%8FvvvNNNJJJIIIEEE%FF%FF%FF%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00%00!%F9%04%01%00%00%A1%00%2C%00%00%00%00k%00%1C%00%00%08%FF%00C%09%1CH%B0%A0%C1%83%08%13*%5C%C8%B0%A1%C3%87%10%23J%9CHQb%8E%08%2C%1E%A0%40%C1%C1%88%C7%8F%20C%8A%1CI%B2%A4I%92B6%A2XQ!GE%83%24PlpR%A5%0B%1938s%EA%DC%C9%B3%A7%CF%9F%40%83%E6l%E3%A1%83%12%1F%2BuT%84%80%82%C9%16%9E%A0%A2F%15J%B5%AAU%AAn%AC%14A%91%C2B%C4%98H%BE%40%05%B5GO%9E%3C%89%A6%5E%5D%CB%F6%EA%95%20(%20%3CT%81bJOP%9F%40i%D2%C3G%CF%A6N%90%40%F5%94%83%C6%0E%80%C3%0B%D0%C8%A1Z%E70%9A%B6%3F%1B%03x%8CsL%92%8D3%18%8E%40A%E5n%DE%00%98%00%F0%01%10%20%40%A3%C0%3B%CF%2C8%CC%1A%F1%1C%A1%92)C%E6%19%5B%E7%9B%CB)%16%EA%40%E1%E4%AE'P%99%02%00%18D%9Ct%00%B59%E9%1C%06%B1X%0E%88%C3t%CC%A0Y%DE%E0p%83%10f%94%B3%96%AD%93p%EB8gp%B2%FF%C69%7D%B2v%C7%3A%DDl%40%D1B%A1%0A%1F%60%EE%EA%01%25%9C8%1F%40%83%00p%02%F5H0N9%88%ED%B4%1A%00%DE%B5%C6%DA%1C%E7M%C6%93%1C%86%19%B8%40x%E3I%E7X%82%DC%99%D1%C1F%26%24%84%C2%11%3E%81%92%07%1F%A0%F81H%1F%7C%08%12%08%88%A0%2C%E2%9F%19g%40%B7%93vg%94g%C7b%92%C5aFm%E5%01%60%87%84%00Dw%E3a6FX%DEc%B5%ED%14%C6F4h%D8D%87%1F%F2%F1%87TP%22%C2%C8%8A%00%02%B0%C0N%0D%16HY%08.%E2%C8%DA%8E%921%80%13%97%3D%9A!%24zE%EA%04%C7F%3Bh%C8%E1%5Dx%80X%C9%24%06%14%40%C0%00%03%5Cr%88%8A%3Ai%C7%9C%19%CE%B9(%23%8D%40%FE%08%80%8D%3C%95%E7c%8Df%1E%86%5Du%0A2%BA%93%18%1B%D5%90%10%04%3F%8Cq%17!%20%DE9%80%00x%0E%60%89%22%FD%E9%A4%9A%81%AE%F1%88%EAkql%B7%60%83%AD%3D%FFh%06%A4%06%3E%D6*z%3AU%B1%D1%09%09%C5%80B%14%1D%12%02J%A8%03%1C%60l%02%85%AC%98%13a%B0%26%B6%18%8Fthw%1DNs%40Z%E1%7F9%1E%1A%9E%19%D5Z%A7%DDc%DD*%98%D3%1BD%A0P%01%1B%0AE%80%02%16%9B%82%12%89%24%08P%A2%80T%8E(K%D5%90%B3%E5%ABS%19Klt%01C%2Chp%C5%5DP%1Ab0!%A5%AE%85%AF%BE%F9%92%E1%C4F%3C%00%D0%D0%0BM%891%D6%22%18%2F%D2%9F%BD%0Cw%5C%15%17C%A0%A0%82%08%12%3B%24A%05%1A%40%F1%C1XRy%EC%B2UZ%20%B1%91%0C%19%94%FCP%1A7X%80B%11Rd%11%DF%CB%40S%E5%85%15O%AC%C7%82%0D%3D%1CV%11%058%D4%00%83FB%9C%24%F5%D4TW%ED%11%10%1B%B9P%C2%04%18%DC%A1%F4K%02%B5v%87%1Aj8%60%F6%D9h%A7%AD%F6%DAl%B7%ED%B6%DBk%A0%0A%F6%DCt%D7m%F7%DDx%E7%AD%F7%DE%7C%F7%0D%ED%F7%DF%80%07.%F8%E0%84%17nP%40%00%3B";

function CreateOptButton()
{
	function OptButtonClicked()
	{
		if (Button.param)
		{
			GM_setValue("OptionalScoreboard", false);
			Button.param = false;
			Button.src = OptIn;
			Button.alt = "Opt-in for the optional scoreboard?";
		}
		else
		{
			GM_setValue("OptionalScoreboard", true);
			Button.param = true;
			Button.src = OptOut;
			Button.alt = "Opt-out for the optional scoreboard?";
		}
	}
	var Button = document.createElement('img');
	Button.id = "OptButton";
	Button.width = '107';
	Button.height = '28';
	Button.style.border = '0';
	Button.style.cursor = 'pointer';
	Button.param = GM_getValue("OptionalScoreboard", false);
	if (Button.param)
	{
		Button.src = OptOut;
		Button.alt = "Opt-out for the optional scoreboard?";
	}
	else
	{
		Button.src = OptIn;
		Button.alt = "Opt-in for the optional scoreboard?";
	}
	Button.addEventListener('click', OptButtonClicked, false);
	return Button;
}

function ToggleColumns(Id)
{
	var Hidden = GM_getValue(Id + " Hidden", false);
	var Columns = XPathQuery("//td[@id='" + Id + "']", document)
	
	for (var j = 0; j < Columns.snapshotLength; j++)
	{
		if (Hidden)
			Columns.snapshotItem(j).className = "Shown";
		else
			Columns.snapshotItem(j).className = "Hidden";
		GM_setValue(Id + " Hidden", !Hidden);
	}
}

function ToggleColumn(Id)
{
	var Hidden = GM_getValue(Id + "  Hidden", false);
	var Column = document.getElementById(Id);
	
	if (Hidden)
		Column.className = "Hidden";
	else
		Column.className = "Shown";
	GM_setValue(Id + " Hidden", !Hidden);
}

function ModifyScores()
{
	if (location.toString().indexOf("mode=all") > -1)
	{
		var Context = SetupContext();
		ProcessOverall(Context, true);
		ModifyLakes(2, 3, Context);
		GetActiveFishers();
	}
	else if (location.toString().indexOf("mode=myhistory") > -1)
	{
		ModifyPersonalHistory();
	}
	else if (location.toString().indexOf("mode") < 0) //no mode - personal stats
	{
		var Context = SetupContext();
		ModifyLakes(1, 2, Context);
		// GetUnofficialScoreboard(Context);
		GetActiveFishers();
		ModifyPersonalHistory();	
	}
}

AddGlobalStyle(".Hidden{display: none;} .BasskenPersonalHeader{background: rgb(49, 111, 71) none repeat scroll 0%; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial; padding-top: 5px; padding-bottom: 5px;} .GambinoPersonalHeader{background: rgb(34, 68, 162) none repeat scroll 0%; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial; padding-top: 5px; padding-bottom: 5px;} .DuremPersonalHeader{background: rgb(91, 65, 58) none repeat scroll 0%; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial; padding-top: 5px; padding-bottom: 5px;} .JunkPersonalHeader, .OverallPersonalHeader{background: rgb(153, 153, 153) none repeat scroll 0%; -moz-background-clip: -moz-initial; -moz-background-origin: -moz-initial; -moz-background-inline-policy: -moz-initial; padding-top: 5px; padding-bottom: 5px;} .DistanceHeader{font-size: 8pt;} .JunkHeader, .OverallHeader{background-color: #999999;} .BasskenHeader{background-color: #316F47;} .GambinoHeader{background-color: #2244A2;} .DuremHeader{background-color: #5b413a;} .JunkEven, .OverallEven{background-color: #EEEEEE;} .BasskenEven{background-color: #ebf9f1;} .GambinoEven{background-color: #ebf3f9;} .DuremEven{background-color: #f9f1eb;} .JunkOdd, .OverallOdd{background-color: #DDDDDD;} .BasskenOdd{background-color: #d7f3e3;} .GambinoOdd{background-color: #d7e6f3;} .DuremOdd{background-color: #f3e5d7;}");
ModifyScores();
