//Push Out
//Push selected tasks out by the desired amount
(() => {
   let action = new PlugIn.Action(function(selection) {
      //Setup dates
		var now = new Date();
		var todayStart = Calendar.current.startOfDay(now);
      var dc = new DateComponents();
      
      //Setup menu
		var pushTypeMenu = new Form.Field.Option(
         "pushType",
		   "Defer to",
		   [0, 1],
		   ["Next Weekend", "One Week"],
		   0
		);
      updateDueDate = new Form.Field.Checkbox("updateDueDate", "Update Due Date", true);
		
      var inputForm = new Form();
      inputForm.addField(pushTypeMenu);
      inputForm.addField(updateDueDate);
      var formPrompt = "Push Out Tasks";
      var buttonTitle = "Continue";
      var formPromise = inputForm.show(formPrompt,buttonTitle);
		
      inputForm.validate = function(formObject){
         return true;
		}
		
      formPromise.then(function(formObject){
			var chosenIndex = formObject.values['pushType'];
			var updateDueDateSelection = formObject.values['updateDueDate'];
         var newDeferDate;
         var newDueDate;
         
         selection.tasks.forEach(function(task) {
            var currentDeferDate = task.deferDate;
            //Use current date for defer date if null
            if (!currentDeferDate) {
               currentDeferDate = todayStart;
            }
            var currentDueDate = task.dueDate;
            dc.day = null;
            
            if (chosenIndex == 0) {
               if (currentDeferDate.getDay() == 0) {
                  //Push to Sunday
                  newDeferDate = getNextDayOfWeek(todayStart, "Sunday");
               }
               else {
                  //Push to Saturday
                  newDeferDate = getNextDayOfWeek(todayStart, "Saturday");
               }
               task.deferDate = newDeferDate;
               
               //Update due date if desired and not null
               if (updateDueDateSelection && currentDueDate) {
                  dc.day = daysBetween(currentDeferDate, newDeferDate);
                  newDueDate = Calendar.current.dateByAddingDateComponents(currentDueDate, dc);
                  task.dueDate = newDueDate;  
               }
            }            
            else {
               //Push One Week
               dc.day = 7;
               newDeferDate = Calendar.current.dateByAddingDateComponents(currentDeferDate, dc);
               task.deferDate = newDeferDate;

               //Update due date if desired and not null
               if (updateDueDateSelection && currentDueDate) {
                  newDueDate = Calendar.current.dateByAddingDateComponents(currentDueDate, dc);
                  task.dueDate = newDueDate;  
               }
            }
            
         });         
		});

		formPromise.catch(function(err){
			console.error("Form cancelled", err.message);
		});	
   });

    
	action.validate = function(selection){
		return (selection.tasks.length >= 1);
	};
        
	return action;
})();


function getNextDayOfWeek(date, dayOfWeek) {
   var daysArray = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
   var dayNum = daysArray.indexOf(dayOfWeek);
   
   var resultDate = new Date(date.getTime());
   resultDate.setDate(date.getDate() + (7 + dayNum - date.getDay()) % 7);

   if (resultDate.getDate() == date.getDate()) {
      resultDate.setDate(resultDate.getDate() + 7);
   }

   return resultDate;
}

function daysBetween(first, second) {

    // Copy date parts of the timestamps, discarding the time parts.
    var one = new Date(first.getFullYear(), first.getMonth(), first.getDate());
    var two = new Date(second.getFullYear(), second.getMonth(), second.getDate());

    // Do the math.
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;

    // Round down.
    return Math.floor(days);
}