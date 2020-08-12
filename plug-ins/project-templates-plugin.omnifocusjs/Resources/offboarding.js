// Offboard Resource
// Create project to offboard resource
/* TODO:
- Add term date error handling?
*/
(() => {
   let action = new PlugIn.Action(async function(selection) {
      let ptLib = this.projectTemplatesLib;
      let associateTypeVisible = false;
      let now = new Date();
      let todayStart = Calendar.current.startOfDay(now);
      // I'd use this instead, but it produces a time in the date picker on MacOS.
      // let fmatr = Formatter.Date.withFormat("M/d/yyyy");
      let fmatr = Formatter.Date.withStyle(Formatter.Date.Style.Short);
      
      // Setup form
		let firstNameInput = new Form.Field.String("firstName", "First Name", null);
		let lastNameInput = new Form.Field.String("lastName", "Last Name", null);
      let termDateInput = new Form.Field.Date("termDate", "Date", now, fmatr);
      // Keyboard selection only available on iOS
      if (Device.current.iOS) {
         termDateInput.keyboardType = KeyboardType.NumbersAndPunctuation;
      }
      let employeeTypeMenu = new Form.Field.Option(
         "employeeType",
		   "Employee Type",
		   [0, 1],
		   ["Associate", "Contractor"],
		   0
		);
      let associateTypeMenu = new Form.Field.Option(
         "associateType",
		   "Associate Type",
		   [0, 1],
		   ["Individual Contributor", "People Leader"],
		   0
         );
      let locationMenu = new Form.Field.Option(
         "location",
		   "Location",
		   [0, 1],
		   ["Onsite", "Offshore"],
		   0
         );   
      let internalTransferCheckbox = new Form.Field.Checkbox("internalTransfer", "Internal Transfer", false);
		
      let inputForm = new Form();
      inputForm.addField(firstNameInput);
      inputForm.addField(lastNameInput);
      inputForm.addField(termDateInput);
      inputForm.addField(employeeTypeMenu);
      inputForm.addField(associateTypeMenu);
      associateTypeVisible = true;
      inputForm.addField(locationMenu);
      inputForm.addField(internalTransferCheckbox);
      let formPrompt = "Create Offboarding Project";
      let buttonTitle = "Continue";
      let formPromise = inputForm.show(formPrompt,buttonTitle);
		
      inputForm.validate = function(formObject) {
         let employeeTypeIndex = formObject.values["employeeType"];
         let locationIndex = formObject.values["location"];
      
         // Remove Associate Type field based upon Employee Type selection
         if (employeeTypeIndex == 1 && associateTypeVisible) {
            inputForm.removeField(inputForm.fields[ptLib.getFormFieldIndex(inputForm, "associateType")]);
            associateTypeVisible = false;
         } 
         // Display the Associate Type field if Associate is the Employee Type
         else if (employeeTypeIndex == 0 && !associateTypeVisible) {
            let associateTypeMenu = new Form.Field.Option(
               "associateType",
               "Associate Type",
               [0, 1],
               ["Individual Contributor", "People Leader"],
               0
               );
            inputForm.addField(associateTypeMenu, ptLib.getFormFieldIndex(inputForm, "employeeType")+1);
            associateTypeVisible = true;
         } 
      
         if (!formObject.values["firstName"] || !formObject.values["lastName"]) {
		      throw "First and Last Names are required" 
         }
         
         return true;
		}
		
      formPromise.then(async function(formObject) {
			//Get form content
			let employeeFirstName = formObject.values["firstName"];
			let employeeName = formObject.values["firstName"] + " " + formObject.values["lastName"];
         let termDate8601 = formObject.values["termDate"].toISOString().substring(0,10);
         let employeeTypeIndex = formObject.values["employeeType"];
         let associateTypeIndex = formObject.values["associateType"];
         let locationIndex = formObject.values["location"];
			let internalTransfer = formObject.values["internalTransfer"];    
         
         //Build project template
         let projectTemplate = await ptLib.getTemplateContent("offboardingBase.taskpaper");
         if (employeeTypeIndex == 0) {
            projectTemplate = projectTemplate + "\n" + 
                              await ptLib.getTemplateContent("offboardingAssociate.taskpaper");
            if (associateTypeIndex == 1) {
               projectTemplate = projectTemplate + "\n" +
                                 await ptLib.getTemplateContent("offboardingPeopleLeader.taskpaper");           
            }
         }
         else {
            projectTemplate = projectTemplate + "\n" +
                              await ptLib.getTemplateContent("offboardingContractor.taskpaper");
         }
         
         if (!internalTransfer) {
            projectTemplate = projectTemplate + "\n" +
                              await ptLib.getTemplateContent("offboardingDeparting.taskpaper");
            if (employeeTypeIndex == 0) {
               projectTemplate = projectTemplate + "\n" +
                                 await ptLib.getTemplateContent("offboardingAssociateDeparting.taskpaper");
            }
         }
         else {
            projectTemplate = projectTemplate + "\n" +
                              await ptLib.getTemplateContent("offboardingInternalTransfer.taskpaper");
            if (employeeTypeIndex == 0) {
               projectTemplate = projectTemplate + "\n" +
                                 await ptLib.getTemplateContent("offboardingAssociateInternalTransfer.taskpaper");
            }
            else {
               projectTemplate = projectTemplate + "\n" +
                                 await ptLib.getTemplateContent("offboardingContractorInternalTransfer.taskpaper");
            }
         }
         
         if (locationIndex == 0) {
            projectTemplate = projectTemplate + "\n" + 
                              await ptLib.getTemplateContent("offboardingOnsite.taskpaper");
         }
         
         
         // Populate template with form values
         projectTemplate = ptLib.removeCommentLines(projectTemplate);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Name", employeeName);
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "Term Date", termDate8601);
         
         // Check if first name tag exists in OmniFocus
         let templateValue = "";
         if (flattenedTags.filter((tag) => tag.name === employeeFirstName)[0]) {
            templateValue = employeeFirstName; 
         }
         projectTemplate = ptLib.populateTemplateParameter(projectTemplate, "First Name", templateValue);
        
         // Create project (URL scheme doesn't reflect changes so creating in advance for sort to work)
         let projectName = employeeName + " Offboarding";
         let workFolder = folderNamed("Work");
         let proj = new Project(projectName, workFolder);
         proj.deferDate = todayStart;
         proj.completedByChildren = true;
         let dc = new DateComponents();
         dc.day = 90;
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