// Tax Preparation
// Create project to manage annual tax preparation
/* TODO:
- 
*/
(() => {
   let action = new PlugIn.Action(async function(selection) {
      let ptLib = this.projectTemplatesLib;
      let now = new Date();
      let todayStart = Calendar.current.startOfDay(now);
      let currentYear = todayStart.toISOString().substring(0,4);
      
      // Setup form
      let taxYearInput = new Form.Field.String("taxYear", "Tax Year", currentYear);
		
      let inputForm = new Form();
      inputForm.addField(taxYearInput);

      let formPrompt = "Create Tax Preparation Project";
      let buttonTitle = "Continue";
      let formPromise = inputForm.show(formPrompt, buttonTitle);
      
      inputForm.validate = function(formObject){
         return true;
		}
		
      formPromise.then(async function(formObject) {
			// Get form content
			let taxYear = formObject.values["taxYear"];
         let nextYear = String(parseInt(taxYear) + 1);
         let eightYearsAgo = String(parseInt(taxYear) - 8);
         
         // Build project template
         let projectTemplate = await ptLib.getTemplateContent("taxPreparation.taskpaper");
         
         // Populate template with form values
         projectTemplate = ptLib.removeCommentLines(projectTemplate);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Tax Year", taxYear);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Next Year", nextYear);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Tax Year -8 Years", eightYearsAgo);
         //console.log(projectTemplate);
        
         // Create project (URL scheme doesn't reflect changes so creating in advance for sort to work)
         //let projectName = taxYear + " Tax Preparation";
         let projectName =  "Tax Preparation (" + taxYear + ")";
         let homeFolder = folderNamed("Home");
         let proj = new Project(projectName, homeFolder);
         proj.deferDate = Calendar.current.startOfDay(new Date(taxYear + "/12/15"));
         proj.dueDate = ptLib.getEndOfDay(nextYear + "-04-15");
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