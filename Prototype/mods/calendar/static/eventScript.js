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

	document.getElementById("calendar").innerHTML = makeCalendar();
	document.getElementById("dayView").innerHTML = makeDayView();
	
	function getDaySchedule() {
		var schedule;
		$.ajax({
			url: '/calendar/jsonDaySchedule',
			async: false,
			dataType: 'json',
			data: { 
				"day": displayTime.day(),
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
		var dayView = "<table align='center'>";
		
		//header
		calendarText += "<tr><td class='date' colspan='7' id='date'>";
		calendarText += displayTime.format("dddd Do[,] YYYY");
		calendarText += "</td></tr>";
		
		//labels
		dayView += "<tr><td class='timelabel'></td>";
		for(role = 0; role < roles.length; role++) {
			dayView += "<td class='rolelabel'>" + roles[role] + "</td>";
		}
		dayView += "</tr>";
		
		//primary person for this day for each role
		dayView += "<tr><td class='timelabel'>Primary</td>";
		for(role = 0; role < roles.length; role++) {
			dayView += "<td class='inside' id='ALLNIGHT'>" + schedule[0][role+1] + "</td>";
		}
		dayView += "</tr>";
		
		var id = moment([displayTime.year(), displayTime.month(), displayTime.day(), 17]);
		
		//times of the day
		for(n = 1; n < 14; n++) {
			dayView += "<tr><td class='timelabel'>" + id.format("h[:]mm") + "</td>";
			for(role = 0; role < roles.length; role++) {
				dayView += "<td class='inside top' id='" + id.toISOString() + "'>" + "" /*todo: add subs */ + "</td>";
			}
			dayView += "</tr>";
			id.add(30, 'm');
			dayView += "<tr><td class='timelabel'>" + id.format("h[:]mm") + "</td>";
			for(role = 0; role < roles.length; role++) {
				dayView += "<td class='inside bottom' id='" + id.toISOString() + "'>" + "" /*todo: add subs */ + "</td>";
			}
			dayView += "</tr>";
			id.add(30, 'm');
		}
		
		dayView += "</table>";
		return dayView;
	}

	function makeCalendar() {
		var schedule = getMonthSchedule();
		//alert(schedule);
		var calendarText = "<table align='center'>";
		
		//header
		calendarText += "<tr><td class='month' colspan='7' id='month'>";
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
		document.getElementById("calendar").innerHTML = makeDayView();
	});


	$("#tomorrow").click(function(event) {
		displayTime.add(1, "d");
		document.getElementById("calendar").innerHTML = makeDayView();
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
        
	function jeffTest() {
		var test_data = {
			"eta":$('#eta').val(),
			"location":$('#location').val(),
			"type":$('#type').val(),
			"msg":$('#msg').val(),	
		}
		$.ajax({
			url:"colab-sbx-131.oit.duke.edu:5001/test_send_template_sms",
			type: "POST",
			contentType:"application/json",
			dataType:"json",
			data: JSON.stringify(test_data)
		});
		$jeffTest.dialog( "close" );
	}
	
	function addSub() {
		var valid = true;
		allFields.removeClass( "ui-state-error" );
		
		/*
		 * repeated code here is temporary
		 * trying to learn javascript :p
		 */
		valid = valid && checkLength(sub, "Substitute", 80);
		valid = valid && checkRegexp( sub, /^([a-zA-Z ])+$/, "Substitute name must only include a-z" );
		
		var start = $('#start').val();
		var duration = parseInt($('#duration').val());
		
		if(valid) {
			var sub_data = {
				"start":start,
				"end":moment(start).add(duration, 'h'),
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
			clickedSquare.innerHTML = "SUB: " + $('#sub').val();
			$subDialog.dialog( "close" );
		}
	}

	function addFull() {
		var valid = true;
		allFields.removeClass( "ui-state-error" );
		
		/*
		 * repeated code here is temporary
		 * trying to learn javascript :p
		 */
		valid = valid && checkLength(faculty, "Faculty", 80);
		valid = valid && checkLength(fellow, "Fellow", 80);
		valid = valid && checkLength(rn1, "RN1", 80);
		valid = valid && checkLength(rn2, "RN2", 80);
		valid = valid && checkLength(tech1, "Tech1", 80);
		valid = valid && checkLength(tech2, "Tech2", 80);
		
		valid = valid && checkRegexp( faculty, /^([a-zA-Z ])+$/, "Faculty name must only include a-z and spaces" );
		valid = valid && checkRegexp( fellow, /^([a-zA-Z ])+$/, "Fellow name must only include a-z and spaces" );
		valid = valid && checkRegexp( rn1, /^([a-zA-Z ])+$/, "Nurse name must only include a-z and spaces" );
		valid = valid && checkRegexp( rn2, /^([a-zA-Z ])+$/, "Nurse name must only include a-z and spaces" );
		valid = valid && checkRegexp( tech1, /^([a-zA-Z ])+$/, "Tech name must only include a-z and spaces" );
		valid = valid && checkRegexp( tech2, /^([a-zA-Z ])+$/, "Tech name must only include a-z and spaces" );
		
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
			window.location.reload(true);
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
	
	var $jeffTest = $( "#test-form" ).dialog({
	  autoOpen: false,
	  height: 350,
	  width: 350,
	  modal: true,
	  buttons: {
		"Send SMS": jeffTest,
		Cancel: function() {
		  $jeffTest.dialog( "close" );
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
	
	var fullForm = $jeffTest.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
	});

	$('#alert-button').click( function() {
		$jeffTest.dialog('open');
	});

	$('.inside').click(function(event) {
		clickedSquare = event.target || event.srcElement;
    	$subDialog.dialog('open');
		$('#start').val(clickedSquare.id);
	});
	
	$("div").on('click', 'td.day', function() {
		clickedSquare = event.target || event.srcElement;
		$fullDialog.dialog("open");
		$('#date').val(clickedSquare.id);
	});
});
