$(document).ready(function() {
	var sub = $("#sub"),
		faculty = $( "#faculty" ),
		fellow = $( "#fellow" ),
		rn1 = $( "#rn1" ),
		rn2 = $( "#rn2" ),
		tech1 = $("#tech1"),
		tech2 = $("#tech2"),
		allFields = $( [] ).add( faculty ).add( fellow ).add( rn1 ).add( rn2 ).add( tech1 ).add( tech2 ),
		tips = $( ".validateTips" );
	var roles = ["Faculty", "Fellow", "RN1", "RN2", "Tech1", "Tech2"];
	var clickedSquare;
    var displayTime = moment();

	if(document.getElementById("calendar") != null) {
		document.getElementById("calendar").innerHTML = makeCalendar();
	}
	if(document.getElementById("dayView") != null) {
		document.getElementById("dayView").innerHTML = makeDayView();
	}
        
        function getSchedule(endpoint, day, month, year) {
            var schedule;
            var data;
            if(day == null) {
                data = {
                    "month": month,
                    "year": year
                };
            }
            else {
                data = {
                    "day": day,
                    "month": month,
                    "year": year
                };
            }
            $.ajax({
                url:endpoint,
                async:false,
                dataType:'json',
                data: data,
                success: function(json) {
                    schedule = json.results;
                }
            });
            return schedule;
        }
	
	function makeDayView() {
		var schedule = getSchedule("/calendar/jsonDaySchedule", 
                        displayTime.date(), displayTime.month() + 1, displayTime.year());
		var substitutions = getSchedule("/calendar/jsonSubSchedule", 
                        displayTime.date(), displayTime.month() + 1, displayTime.year());
		
		var dayView = "<table align='center'>";
		
		//header
		dayView += "<tr><td class='header' colspan='7' id='header'>";
		dayView += displayTime.format("dddd, MMMM Do[,] YYYY");
		dayView += "</td></tr>";
		
		//labels
		dayView += "<tr><td class='timelabel'></td>";
		for(role = 0; role < roles.length; role++) {
			dayView += "<th class='rolelabel'>" + roles[role] + "</th>";
		}
		dayView += "</tr>";
		
		//primary person for this day for each role
		dayView += "<tr><td class='timelabel'>Primary</td>";
		for(role = 0; role < roles.length; role++) {
			dayView += "<td class='primary' id='primary'>";
			if(schedule.length >= 1) {
				dayView +=  schedule[0][role+1];
			}
			dayView += "</td>";
		}
		dayView += "</tr>";
		
		var id = moment([displayTime.year(), displayTime.month(), displayTime.date(), 17]);
		
		//times of the day
		for(n = 1; n < 14; n++) {
			dayView += makeSubRow(id, 'inside top', substitutions);
			dayView += makeSubRow(id, 'inside bottom', substitutions);
		}
		
		dayView += "</table>";
		return dayView;
	}

	function makeSubRow(id, tdClass, substitutions) {
		var row = "<tr><td class='timelabel'>" + id.format("h[:]mm") + "</td>";
		for(role = 0; role < roles.length; role++) {
			row += "<td class='" + tdClass + "' id='" + id.format() + "'>";
			for(sub = 0; sub < substitutions.length; sub++) {
				var startTime = moment(substitutions[sub][1]).format();
				var endTime = moment(substitutions[sub][2]).format();
				var subRole = substitutions[sub][3];
				if((id.isSame(startTime) || id.isAfter(startTime)) && (id.isSame(startTime) || id.isBefore(endTime)) && subRole == roles[role]) {
					row += substitutions[sub][4];
				}
			}
			row +=  "</td>";
		}
		row += "</tr>";
		id.add(30, 'm');
		return row;
	}

	function makeCalendar() {
		var schedule = getSchedule("/calendar/jsonMonthSchedule", 
                        null, displayTime.month() + 1, displayTime.year());
		var calendarText = "<table align='center'><br>";
		
		//header
		calendarText += "<tr><td class='header' colspan='7' id='header'>";
		calendarText += displayTime.format("MMMM YYYY");
		calendarText += "</td></tr>";

		//list weekdays
		calendarText += "<tr>";
		var weekday = displayTime.weekday();
		for(i = 0; i < 7; i++) {
			calendarText += "<td class='weekday'>";
			calendarText += displayTime.weekday(i).format("dddd");
			calendarText += "</td>";
		}
		displayTime.weekday(weekday); //revert
		calendarText += "</tr>";

		//days of the month
		var daysInThis = displayTime.daysInMonth();
		var daysInLast = displayTime.subtract(1, "M").daysInMonth();
		displayTime.add(1, "M"); //revert
		var date = displayTime.date();
		var firstDay = displayTime.date(1).day();
		displayTime.date(date);
		var idx = 1;
		
		while (idx <= firstDay + daysInThis) {
			calendarText += "<tr>";
			for(i=0; i < 7; i++) {
				
				var currentDay;
				var id;				

				if(idx <= firstDay) {
					currentDay = daysInLast - firstDay + idx;
					
					if(displayTime.month() == 0) {
						id = moment(currentDay + " 12 " + (displayTime.year() - 1), "DD MM YYYY").format("YYYY[-]MM[-]DD");
					}
					else {
						id = moment(currentDay + " " + displayTime.month() + " " + displayTime.year(), "DD MM YYYY").format("YYYY[-]MM[-]DD");
					}
					calendarText += "<td class='disabledDay' id=\"" + id + "\">";
					calendarText += currentDay;
				}
				else if(idx <= firstDay + daysInThis) {
					currentDay = idx - firstDay;
					id = moment(currentDay + " " + (displayTime.month() + 1) + " " + displayTime.year(), "DD MM YYYY").format("YYYY[-]MM[-]DD");
					calendarText += "<td class='day' id=\"" + id + "\">";
					calendarText += currentDay;
					for(j = 0; j < schedule.length; j++) {
						if(currentDay == schedule[j][0].split("-")[2]) {
							for(role = 0; role < 6; role++){
								calendarText += "<br>" + schedule[j][role+1];
							}
						}
					}
				}
				else {
					currentDay = idx - firstDay - daysInThis;
					if(displayTime.month() == 11) {
						id = moment(currentDay + " 1 " + (displayTime.year() + 1), "DD MM YYYY").format("YYYY[-]MM[-]DD");
					}
					else {
						id = moment(currentDay + " " + (displayTime.month() + 2) + " " + displayTime.year(), "DD MM YYYY").format("YYYY[-]MM[-]DD");
					}
					calendarText += "<td class='disabledDay' id=\"" + id + "\">";
					calendarText += currentDay;
				}
				calendarText += "</td>";
				idx += 1;
			}
			calendarText += "</tr>";
		}
		calendarText += "</table>";
		return calendarText;
	}
	
	$("#last-month").click(handleIndexClick(-1, "M", "calendar", makeCalendar));

	$("#next-month").click(handleIndexClick(1, "M", "calendar", makeCalendar));
	
	$("#yesterday").click(handleIndexClick(-1, "d", "dayView", makeDayView));

	$("#tomorrow").click(handleIndexClick(1, "d", "dayView", makeDayView));
        
        function handleIndexClick(change, thingToChange, elementId, creationMethod) {
            return function() {
                displayTime.add(change, thingToChange);
                document.getElementById(elementId).innerHTML = creationMethod();
            };
        }

	//FORMS

	function updateTips( t ) {
	  tips
		.text( t )
		.addClass( "ui-state-highlight" );
	  setTimeout(function() {
		tips.removeClass( "ui-state-highlight", 1500 );
	  }, 500 );
	}

	function checkLength( o, name, max ) {
	  if ( o.val().length === 0 ) {
		o.addClass( "ui-state-error" );
		updateTips( "" + name + " is a required field.");
		return false;
	  } 
	  else if ( o.val().length > max) {
		o.addClass( "ui-state-error" );
		updateTips( "" + name + " must be less than " + max + " characters.");
	  }
	  else {
		return true;
	  }
	}

	function checkRegexp( o, regexp, n ) {
	  if ( !( regexp.test( o.val() ) ) ) {
		o.addClass( "ui-state-error" );
		updateTips( n );
		return false;
	  } else {
		return true;
          }
        }
        
        function AJAXJSONPost(url, data) {
            $.ajax({
		async: true,
                url: url,
                type: "POST",
                contentType:"application/json",
                dataType:"json",
                data:JSON.stringify(data)
            });
        }
        
	function alertOnCall() {
		var alert_data = {
			"eta":$('#eta').val(),
			"location":$('#location').val(),
			"type":$('#type').val(),
			"msg":$('#msg').val()
		};
                AJAXJSONPost("/backend/on_call", alert_data);
		$alertDialog.dialog( "close" );
	}
	
	function addSub(role) {
		var valid = true;
		allFields.removeClass( "ui-state-error" );
		
		var start = $('#start' + role).val();
		var duration = parseInt($('#duration').val());
		
		if(valid) {
			var sub_data = {
				"start":start,
				"end":moment(start).add(duration, 'h').format(),
				"role":$('#role' + role).val(),
				"sub":$('#sub').val()
			};
                        AJAXJSONPost("/calendar/addSub", sub_data);
			document.getElementById("dayView").innerHTML = makeDayView();
		}
	}

	function addFull() {
		var valid = true;
		allFields.removeClass( "ui-state-error" );
		
		if(valid) {
			var oncall_data = {
				"date":$('#date').val(),
				"faculty":$('#faculty').val(), 
				"fellow":$('#fellow').val(), 
				"rn1":$('#rn1').val(), 
				"rn2":$('#rn2').val(),
				"tech1":$('#tech1').val(), 
				"tech2":$('#tech2').val() 
			};
                        AJAXJSONPost("/calendar/addCall", oncall_data);
			$fullDialog.dialog( "close" );
			document.getElementById("calendar").innerHTML = makeCalendar();
		}
	}
	
	var $fullDialog = $( "#full-form" ).dialog({
	  autoOpen: false,
	  height: 350,
	  width: 350,
	  modal: true,
	  buttons: {
		"Create event": addFull,
		Cancel: function() {
		  $fullDialog.dialog( "close" );
		}
	  },
	  close: function() {
		fullForm[ 0 ].reset();
		allFields.removeClass( "ui-state-error" );
	  }
	});
	
	var $alertDialog = $( "#alert-form" ).dialog({
	  autoOpen: false,
	  height: 350,
	  width: 350,
	  modal: true,
	  buttons: {
		"Send SMS": alertOnCall,
		Cancel: function() {
		  $alertDialog.dialog( "close" );
		}
	  },
	  close: function() {
		alertForm[ 0 ].reset();
		allFields.removeClass( "ui-state-error" );
	  }
	});

	var $facultyDialog = $( "#Faculty-sub-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Create event": function() {
				addSub("Faculty");
			  	$facultyDialog.dialog( "close" );
			},
			Cancel: function() {
			  $facultyDialog.dialog( "close" );
			}
		},
		close: function() {
			facultyForm[ 0 ].reset();
			allFields.removeClass( "ui-state-error" );
		}
	});

	var facultyForm = $facultyDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	var $fellowDialog = $( "#Fellow-sub-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Create event": function() {
				addSub("Fellow");
			  	$fellowDialog.dialog( "close" );
			},
			Cancel: function() {
			  $fellowDialog.dialog( "close" );
			}
		},
		close: function() {
			fellowForm[ 0 ].reset();
			allFields.removeClass( "ui-state-error" );
		}
	});

	var fellowForm = $fellowDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	var $rn1Dialog = $( "#RN1-sub-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Create event": function() {
				addSub("RN1");
			  	$rn1Dialog.dialog( "close" );
			},
			Cancel: function() {
			  $rn1Dialog.dialog( "close" );
			}
		},
		close: function() {
			rn1Form[ 0 ].reset();
			allFields.removeClass( "ui-state-error" );
		}
	});

	var rn1Form = $rn1Dialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	var $rn2Dialog = $( "#RN2-sub-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Create event": function() {
				addSub("RN2");
			  	$rn2Dialog.dialog( "close" );
			},
			Cancel: function() {
			  $rn2Dialog.dialog( "close" );
			}
		},
		close: function() {
			rn2Form[ 0 ].reset();
			allFields.removeClass( "ui-state-error" );
		}
	});

	var rn2Form = $rn2Dialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	var $tech1Dialog = $( "#Tech1-sub-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Create event": function() {
				addSub("Tech1");
			  	$tech1Dialog.dialog( "close" );
			},
			Cancel: function() {
			  $tech1Dialog.dialog( "close" );
			}
		},
		close: function() {
			tech1Form[ 0 ].reset();
			allFields.removeClass( "ui-state-error" );
		}
	});

	var tech1Form = $tech1Dialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	var $tech2Dialog = $( "#Tech2-sub-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"Create event": function() {
				addSub("Tech2");
			  	$tech2Dialog.dialog( "close" );
			},
			Cancel: function() {
			  $tech2Dialog.dialog( "close" );
			}
		},
		close: function() {
			tech2Form[ 0 ].reset();
			allFields.removeClass( "ui-state-error" );
		}
	});

	var tech2Form = $tech2Dialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});
	
	var fullForm = $fullDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});
	
	var alertForm = $alertDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	$('#alert-button').click( function() {
		$alertDialog.dialog('open');
	});

	$('div').on('click', 'td.inside', handleSubClick("#start", "#role"));
	
	$("div").on('click', 'td.day', handleDateClick($fullDialog, "#date"));
        
        function handleDateClick(dialog, fieldToFill) {
            return function(event) {
                clickedSquare = event.target || event.srcElement;
		dialog.dialog("open");
		$(fieldToFill).val(clickedSquare.id);
            };
        }

	function handleSubClick(startField, roleField) {
		return function(event) {
			var columnNumber = $(event.target).index() + 1;
			var role = $('th:nth-child(' + columnNumber + ')').text();
			var roleDialog;
			if(role == "Faculty")
				roleDialog = $facultyDialog;
			if(role == "Fellow")
				roleDialog = $fellowDialog;
			if(role == "RN1")
				roleDialog = $rn1Dialog;
			if(role == "RN2")
				roleDialog = $rn2Dialog;
			if(role == "Tech1")
				roleDialog = $tech1Dialog;
			if(role == "Tech2")
				roleDialog = $tech2Dialog;
			clickedSquare = event.target || event.srcElement;
			roleDialog.dialog("open");
			$(startField + role).val(clickedSquare.id);
			$(roleField + role).val(role);
		};
	}
});
