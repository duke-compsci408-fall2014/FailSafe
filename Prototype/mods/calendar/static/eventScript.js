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
	var firstDay;

	if(document.getElementById("calendar") != null) {
		document.getElementById("calendar").innerHTML = makeCalendar();
	}
	if(document.getElementById("dayView") != null) {
		document.getElementById("dayView").innerHTML = makeDayView();
	}
	
	function getDaySchedule() {
		var schedule;
		$.ajax({
			url: '/calendar/jsonDaySchedule',
			async: false,
			dataType: 'json',
			data: { 
				"day": displayTime.date(),
				"month": displayTime.month() + 1,
				"year": displayTime.year()
			},
			success: function(json) {
				schedule = json.results;
			}
		});
		return schedule;
	}

	function getSubstitutions() {
		var schedule;
		$.ajax({
			url: '/calendar/jsonSubSchedule',
			async: false,
			dataType: 'json',
			data: { 
				"day": displayTime.date(),
				"month": displayTime.month() + 1,
				"year": displayTime.year()
			},
			success: function(json) {
				schedule = json.results;
			}
		});
		return schedule;
	}

	function getMonthSchedule() {
		var schedule;
		$.ajax({
			url: '/calendar/jsonMonthSchedule',
			async: false,
			dataType: 'json',
			data: { 
				"month": displayTime.month() + 1,
				"year": displayTime.year()
			},
			success: function(json) {
				schedule = json.results;
			}
		});
		return schedule;
	}
	
	function makeDayView() {
		var schedule = getDaySchedule();
		var substitutions = getSubstitutions();
		
		var dayView = "<table align='center'>";
		
		//header
		dayView += "<tr><td class='header' colspan='7' id='header'>";
		dayView += displayTime.format("dddd, MMMM Do[,] YYYY");
		dayView += "</td></tr>";
		
		//labels
		dayView += "<tr><td class='timelabel'></td>";
		for(role = 0; role < roles.length; role++) {
			dayView += "<td class='rolelabel'>" + roles[role] + "</td>";
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
			dayView += "<tr><td class='timelabel'>" + id.format("h[:]mm") + "</td>";
			for(role = 0; role < roles.length; role++) {
				dayView += "<td class='inside top' id='" + id.format() + "'>";
				for(sub = 0; sub < substitutions.length; sub++) {
					var startTime = moment(substitutions[sub][1]).format();
					var endTime = moment(substitutions[sub][2]).format();
					var subRole = substitutions[sub][3];
					if((id.isSame(startTime) || id.isAfter(startTime)) && (id.isSame(startTime) || id.isBefore(endTime)) && subRole == roles[role]) {
						dayView += "Sub: " + substitutions[sub][4];
					}
				}
				dayView +=  "</td>";
			}
			dayView += "</tr>";
			id.add(30, 'm');
			dayView += "<tr><td class='timelabel'>" + id.format("h[:]mm") + "</td>";
			for(role = 0; role < roles.length; role++) {
				dayView += "<td class='inside bottom' id='" + id.format() + "'>";
				for(sub = 0; sub < substitutions.length; sub++) {
					var startTime = moment(substitutions[sub][1]).format();
					var endTime = moment(substitutions[sub][2]).format();
					var subRole = substitutions[sub][3];
					if((id.isSame(startTime) || id.isAfter(startTime)) && (id.isSame(startTime) || id.isBefore(endTime)) && subRole == roles[role]) {
						dayView += "Sub: " + substitutions[sub][4];
					}
				}
				dayView +=  "</td>";
			}
			dayView += "</tr>";
			id.add(30, 'm');
		}
		
		dayView += "</table>";
		return dayView;
	}

	function makeCalendar() {
		var schedule = getMonthSchedule();
		var calendarText = "<table align='center'>";
		
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
		firstDay = displayTime.date(1).day();
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
								calendarText += "<br>" + roles[role] + ": " + schedule[j][role+1];
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
	
	$("#last-month").click(function(event) {
		displayTime.subtract(1, "M");
		document.getElementById("calendar").innerHTML = makeCalendar();
	});


	$("#next-month").click(function(event) {
		displayTime.add(1, "M");
		document.getElementById("calendar").innerHTML = makeCalendar();
	});
	
	$("#yesterday").click(function(event) {
		displayTime.subtract(1, "d");
		document.getElementById("dayView").innerHTML = makeDayView();
	});


	$("#tomorrow").click(function(event) {
		displayTime.add(1, "d");
		document.getElementById("dayView").innerHTML = makeDayView();
	});

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
        
	function alertOnCall() {
		var test_data = {
			"eta":$('#eta').val(),
			"location":$('#location').val(),
			"type":$('#type').val(),
			"msg":$('#msg').val()
		};
		$.ajax({
			url:"/backend/on_call",
			type: "POST",
			contentType:"application/json",
			dataType:"json",
			data: JSON.stringify(test_data)
		});
		$alertDialog.dialog( "close" );
	}
	
	function addSub() {
		var valid = true;
		allFields.removeClass( "ui-state-error" );
		
		var start = $('#start').val();
		var duration = parseInt($('#duration').val());
		
		if(valid) {
			var sub_data = {
				"start":start,
				"end":moment(start).add(duration, 'h').format(),
				"role":$('#role').val(),
				"sub":$('#sub').val()
			};
			$.ajax({
				url:"/calendar/addSub",
				type: "POST",
				contentType:"application/json",
				dataType:"json",
				data: JSON.stringify(sub_data)
			});
			$subDialog.dialog( "close" );
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
			$.ajax({
				url:"/calendar/addCall",
				type: "POST",
				contentType:"application/json",
				dataType:"json",
				data: JSON.stringify(oncall_data)
			});
			clickedSquare.innerHTML = "Covered!";
			$fullDialog.dialog( "close" );
			document.getElementById("calendar").innerHTML = makeCalendar();
		}
	}

	var $subDialog = $( "#substitution-form" ).dialog({
	  autoOpen: false,
	  height: 300,
	  width: 350,
	  modal: true,
	  buttons: {
		"Create event": addSub,
		Cancel: function() {
		  $subDialog.dialog( "close" );
		}
	  },
	  close: function() {
		subForm[ 0 ].reset();
		allFields.removeClass( "ui-state-error" );
	  }
	});
	
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
		fullForm[ 0 ].reset();
		allFields.removeClass( "ui-state-error" );
	  }
	});
	
	var subForm = $subDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});
	
	var fullForm = $fullDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});
	
	var fullForm = $alertDialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	$('#alert-button').click( function() {
		$alertDialog.dialog('open');
	});

	$('div').on('click', 'td.inside', function(event) {
		clickedSquare = event.target || event.srcElement;
    		$subDialog.dialog('open');
		$('#start').val(clickedSquare.id);
	});
	
	$("div").on('click', 'td.day', function(event) {
		clickedSquare = event.target || event.srcElement;
		$fullDialog.dialog("open");
		$('#date').val(clickedSquare.id);
	});
});
