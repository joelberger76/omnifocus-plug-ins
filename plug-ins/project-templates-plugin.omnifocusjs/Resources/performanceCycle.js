// Performance Cycle
// Create project to manage current associate performance management cycle
/* TODO:
- 
*/
(() => {
   let action = new PlugIn.Action(async function(selection) {
      const ignoreVIPs = ["Randy", "Jessica", "Karen"];
      let ptLib = this.projectTemplatesLib;
      let perfCycles = ["Mid-Year", "Year-End"];
      let now = new Date();
      let todayStart = Calendar.current.startOfDay(now);
      // I'd use this instead, but it produces a time in the date picker on MacOS.
      // let fmatr = Formatter.Date.withFormat("M/d/yyyy");
      let fmatr = Formatter.Date.withStyle(Formatter.Date.Style.Short);
      
      // Setup form
      let perfCycleMenu = new Form.Field.Option(
         "perfCycle",
		   "Performance Cycle",
		   [0, 1],
		   perfCycles,
		   0
		);
   
      let selfAssessmentInput = new Form.Field.Date("selfAssessmentDate", "Self-assessments Due", now, fmatr);
      let calibrationInput = new Form.Field.Date("calibrationDate", "Calibration", now, fmatr);      
      let perfConversationInput = new Form.Field.Date("perfConversationDate", "Performance Conversations Due", now, fmatr);

      // Keyboard selection only available on iOS
      if (Device.current.iOS) {
         selfAssessmentInput.keyboardType = KeyboardType.NumbersAndPunctuation;
         calibrationInput.keyboardType = KeyboardType.NumbersAndPunctuation;
         perfConversationInput.keyboardType = KeyboardType.NumbersAndPunctuation;
      }
		
      let inputForm = new Form();
      inputForm.addField(perfCycleMenu);
      inputForm.addField(selfAssessmentInput);
      inputForm.addField(calibrationInput);
      inputForm.addField(perfConversationInput);

      let formPrompt = "Create Performance Cycle Project";
      let buttonTitle = "Continue";
      let formPromise = inputForm.show(formPrompt, buttonTitle);
      
      inputForm.validate = function(formObject){
         return true;
		}
		
      formPromise.then(async function(formObject) {
			// Get form content
         let perfCycle = perfCycles[formObject.values["perfCycle"]];
         let selfAssessment8601 = formObject.values["selfAssessmentDate"].toISOString().substring(0,10);
         let calibration8601 = formObject.values["calibrationDate"].toISOString().substring(0,10);
         let perfConversation8601 = formObject.values["perfConversationDate"].toISOString().substring(0,10);   
         
         // Build project template
         let projectTemplate = await ptLib.getTemplateContent("performanceCycleBase.taskpaper");
         let writeReviewsTask = await ptLib.getTemplateContent("performanceCycleWriteReviews.taskpaper");
         
         // Generate write review task for each associate
         let allVIPs = tagNamed("VIP").flattenedTags.filter((tag) => tag.status === Tag.Status.Active).map(tag => tag.name);
         let associates = allVIPs.filter(tag => !ignoreVIPs.includes(tag));
         
         let writeReviewsTasks = [];
         associates.forEach((associate) => {
            writeReviewsTasks.push(ptLib.populateTemplateParameter(writeReviewsTask, "Associate", associate));
         });
         
         // Populate template with form values
         projectTemplate = ptLib.removeCommentLines(projectTemplate);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Write Performance Reviews", writeReviewsTasks.join('\n'));
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Start Date", todayStart.toISOString().substring(0,10));
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Cycle", perfCycle);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Self-Assessment Date", selfAssessment8601);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Calibration Date", calibration8601);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "End Date", perfConversation8601);
         //console.log(projectTemplate);
        
         // Create project (URL scheme doesn't reflect changes so creating in advance for sort to work)
         let projectName = selfAssessment8601.substring(0,4) + " " + 
                           perfCycle + " Performance Cycle";
         let workFolder = folderNamed("Work");
         let proj = new Project(projectName, workFolder);
         proj.deferDate = todayStart;
         proj.dueDate = ptLib.getEndOfDay(perfConversation8601);
         proj.completedByChildren = true;
         let dc = new DateComponents();
         dc.day = 14;
         proj.nextReviewDate = Calendar.current.dateByAddingDateComponents(todayStart, dc);
         
         // Create project leveraging TaskPaper bridge
         let encodedProjectTemplate = encodeURIComponent(projectTemplate);
         let encodedProjectName = encodeURIComponent(projectName);
		   let urlStr = "omnifocus:///paste?target=/task/" + encodedProjectName + "&content=" + encodedProjectTemplate;
		   URL.fromString(urlStr).open();
         
         // Cleanup
         PlugIn.find("com.joelberger.omnifocus.sort-plugin").action("sortProjects").perform();
      });

		formPromise.catch(function(err){
			console.error("Form cancelled", err.message);
		});	
   });

	action.validate = function(selection, sender) {
		return true;
	};
        
	return action;
})();