// Setup Yearly Infrastructure
// Create project to manage annual setup
/* TODO:
- 
*/
(() => {
   let action = new PlugIn.Action(async function(selection) {
      let ptLib = this.projectTemplatesLib;
      let now = new Date();
      let todayStart = Calendar.current.startOfDay(now);
      let nextYear = String(parseInt(todayStart.toISOString().substring(0,4)) + 1);
      
      // Setup form
      let setupYearInput = new Form.Field.String("setupYear", "Setup Year", nextYear);
		
      let inputForm = new Form();
      inputForm.addField(setupYearInput);

      let formPrompt = "Create Yearly Infrastructure Setup Project";
      let buttonTitle = "Continue";
      let formPromise = inputForm.show(formPrompt, buttonTitle);
      
      inputForm.validate = function(formObject){
         return true;
		}
		
      formPromise.then(async function(formObject) {
			// Get form content
			let setupYear = formObject.values["setupYear"];
         
         // Build project template
         let projectTemplate = await ptLib.getTemplateContent("setupYearlyInfrastructure.taskpaper");
         
         // Populate template with form values
         projectTemplate = ptLib.removeCommentLines(projectTemplate);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Year", setupYear);
         //console.log(projectTemplate);
        
         // Create project (URL scheme doesn't reflect changes so creating in advance for sort to work)
         let projectName = "Setup " + setupYear + " Infrastructure";
         let workFolder = folderNamed("Work");
         let proj = new Project(projectName, workFolder);
         proj.deferDate = todayStart;
         proj.completedByChildren = true;
         proj.sequential = true;
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