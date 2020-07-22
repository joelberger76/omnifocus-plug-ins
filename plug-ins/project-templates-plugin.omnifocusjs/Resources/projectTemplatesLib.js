(() => {
	var projectTemplatesLib = new PlugIn.Library(new Version("1.0"));
  	
		projectTemplatesLib.getFormFieldIndex = function(inputForm, key) {
         return inputForm.fields.map(i => i.key).indexOf(key);
      }
       
      projectTemplatesLib.removeCommentLines = function(template) {
         //Remove lines starting with #
         let regex = new RegExp("^\\s*#.*\(?:\n|$)", "mg");
         return template.replace(regex, '');
      }

      projectTemplatesLib.populateTemplateParameter = function(template, parameter, value) {
         //Replace parameters in the format <<name>> with the provided value
         let regex = new RegExp("<<"+parameter+">>", "g");
         return template.replace(regex, value);
      }
      
      projectTemplatesLib.getTemplateContent = function(templateName) {
         //Ideally, I'd load these templates from files but file reads are async and the OmniJS
         //implementation doesn't offer await or a dedicated file read API. Leaving remnant code
         //around in the event this changes.
         //See https://omni-automation.com/shared/url.html and
         //https://omnigrouphq.slack.com/archives/CAX46FMFH/p1593641191208300
         let templateContent = null;
   
         /* 
            const pluginName = "com.joelberger.omnifocus.project-templates-plugin";
            let plugin = PlugIn.find(pluginName);
            let fileURL = plugin.resourceNamed(filename);
            fileURL.fetch(function(data) {
               console.log(data.toString());
               templateContent = data.toString();
            });
         */

         // Establish templates as constants in lieu of files
         const onboardingBase =
         `## Onboarding Template: Base
         ## <<Name>> Onboarding @autodone(true) @defer(today 00:00):
            - Add <<Name>> to timesheet tracker
            - Add <<Name>> to team roster
            - Request Changepoint access for <<Name>> @defer(<<Start Date>> 00:00 -7d)
              https://adcs.service-now.com/sp/?id=sc_cat_item&sys_id=1c723890dbc3b280674038ff9d961999
            Workgroup: Salesforce - {Developers/Quality Assurance/Systems Analyst}
            Agile Team: {Spartans/Warriors/Gladiators/Fantastic Force}
            Time Approver: Joel Berger
            Tag as Cognizant resource: {Yes/No}
            - Inform Mary Jo of <<Name>> joining team @tags(Mary Jo)
            - Add <<Name>> to distribution lists @defer(<<Start Date>> 00:00)`;

         const onboardingAssociate =
         `## Onboarding Template: Associate
            - Add <<Name>> to PTO tracker
            - Add <<Name>>'s birthday to OmniFocus Events project
            - Update <<Name>>'s contact record with their birthday
            - Write personnel announcement for <<Name>> @due(<<Start Date>> 23:55)
            - Ask Mary Jo to send personnel announcement for <<Name>> @tags(Mary Jo) @defer(<<Start Date>> 00:00) @due(<<Start Date>> 23:55)
            - Schedule 1:1s with <<Name>> @defer(<<Start Date>> 00:00)
            - Schedule 2020s with <<Name>> @defer(<<Start Date>> 00:00)
            - Add 1:1 and 2020 time tracking entries to Airtable for <<Name>> @defer(<<Start Date>> 00:00)
            - Add <<Name>> to team meetings @defer(<<Start Date>> 00:00)
            - Develop goals with <<Name>> @defer(<<Start Date>> 00:00)
            - Schedule team welcome lunch for <<Name>> @defer(<<Start Date>> 00:00 -7d)
            - Add <<Name>> 2020 performance notes to Drafts
            - Add <<Name>> to OmniFocus Performance Cycle template
            omnifocus:///task/iCjW7qrw1js`;

         const onboardingPeopleLeader =
         `## Onboarding Template: People Leader
            - Add <<Name>> to leadership meeting @defer(<<Start Date>> 00:00)
            - Add <<Name>> to leadership lunch/happy hour @defer(<<Start Date>> 00:00)`;
   
         const onboardingOnsite =
         `## Onboarding Template: Onsite
            - Determine seating for <<Name>>
            - Request VPN access for <<Name>> @tags(Mary Jo)
              https://adcs.service-now.com/sp/?id=sc_cat_item&sys_id=3c7a3011db1853404e1c38ff9d 961920
              Cost Center: 17-222-722-800
            - Request nameplate for <<Name>> @tags(Mary Jo)
            - Exchange mobile numbers with <<Name>> @defer(<<Start Date>> 00:00)
            - Introduce <<Name>> to team @defer(<<Start Date>> 00:00) @due(<<Start Date>> 23:55)
            - Develop onboarding plan for <<Name>>`;
   
         const onboardingOnsiteContractor =
         `## Onboarding Template: Onsite Contractor
            - Request ID badge for <<Name>> @due(<<Start Date>> 23:55 -2d)
            https://vmrintweb01.corp.alldata.net/Retail/AccessRequest.aspx`;

         const onboardingOnsiteArriving =
         `## Onboarding Template: Onsite Arriving
            - Request Skype headset for <<Name>> @tags(Mary Jo)
            - Order laptop for <<Name>> @tags(Mary Jo)`;
            
         const offboardingBase =
         `## Offboarding Template: Base
         ## <<Name>> Offboarding @autodone(true) @defer(today 00:00)
            - Remove <<Name>> from timesheet tracker`;

         const offboardingAssociate = 
         `## Offboarding Template: Associate
            - Write personnel announcement for <<Name>> @due(<<Term Date>> 23:55)
            - Ask Mary Jo to send personnel announcement for <<Name>> @tags(Mary Jo) @due(<<Term Date>> 23:55)
            - Cancel 1:1s with <<Name>> @defer(<<Term Date>> 00:00 +mon)
            - Cancel 2020s with <<Name>> @defer(<<Term Date>> 00:00 +mon)
            - Remove 1:1 and 2020 time tracking entries from Airtable for <<Name>> @defer(<<Term Date>> 00:00 +mon) 
            - Remove <<Name>> from team meetings @defer(<<Term Date>> 00:00 +mon)
            - Drop <<Name>> VIP tag in OmniFocus @defer(<<Term Date>> 00:00 +mon)
            - Schedule going away lunch for <<Name>>
            - Remove <<Name>> from OmniFocus Performance Cycle template
            omnifocus:///task/iCjW7qrw1js`;
          
         const offboardingPeopleLeader = 
         `## Offboarding Template: People Leader
            - Remove <<Name>> from leadership meeting @defer(<<Term Date>> 00:00 +mon)
            - Remove <<Name>> from leadership lunch/happy hour @defer(<<Term Date>> 00:00 +mon)`;
                     
         const offboardingContractor = 
         `## Offboarding Template: Contractor
            - Inform Mary Jo of <<Name>>'s termination @tags(Mary Jo) @defer(<<Term Date>> 00:00 +mon)`;
      
         const offboardingInternalTransfer = 
         `## Offboarding Template: Internal Transfer
            - Transfer <<Name>> in Peoplesoft/Changepoint to new manager with start date of <<Term Date>>
            - Reassign <<Name>>'s manager in Changepoint`;
          
         const offboardingAssociateInternalTransfer = 
         `## Offboarding Template: Associate Internal Transfer
            - Send new manager <<Name>>'s PTO`;
        
         const offboardingContractorInternalTransfer =
         `## Offboarding Template: Contractor Internal Transfer
            - Request reporting structure change in Fieldglass for <<Name>> @defer(<<Term Date>> 00:00)`;
         
         const offboardingDeparting =
         `## Offboarding Template: Departing
            - Terminate <<Name>> in Peoplesoft/Fieldglass with an end date of <<Term Date>>
            - Remove <<Name>> from Changepoint @defer(<<Term Date>> 00:00 +mon)`;
            
         const offboardingAssociateDeparting =
         `## Offboarding Template: Associate Departing
            - Send HR termination letter for <<Name>> @due(<<Term Date>> 23:55)`;
            
         const offboardingOnsite = 
         `## Offboarding Template: Onsite
            - Return <<Name>>'s ID badge to security desk @defer(<<Term Date>> 00:00)
            - Return <<Name>>'s laptop and monitor @defer(<<Term Date>> 00:00 +mon)`;


            
         //Select appropriate template
         switch(templateName) {
            case "Onboarding Base":
               templateContent = onboardingBase;
               break;
            case "Onboarding Associate":
               templateContent = onboardingAssociate;
               break;
            case "Onboarding People Leader":
               templateContent = onboardingPeopleLeader;
               break;
            case "Onboarding Onsite":
               templateContent = onboardingOnsite;
               break;
            case "Onboarding Onsite Contractor":
               templateContent = onboardingOnsiteContractor;
               break;
            case "Onboarding Onsite Arriving":
               templateContent = onboardingOnsiteArriving;
               break;
            case "Offboarding Base":
               templateContent = offboardingBase;
               break;  
            case "Offboarding Associate":
               templateContent = offboardingAssociate;
               break;
            case "Offboarding People Leader":
               templateContent = offboardingPeopleLeader;
               break;
            case "Offboarding Contractor":
               templateContent = offboardingContractor;
               break; 
            case "Offboarding Internal Transfer":
               templateContent = offboardingInternalTransfer;
               break; 
            case "Offboarding Associate Internal Transfer":
               templateContent = offboardingAssociateInternalTransfer;
               break; 
            case "Offboarding Contractor Internal Transfer":
               templateContent = offboardingContractorInternalTransfer;
               break;   
            case "Offboarding Departing":
               templateContent = offboardingDeparting;
               break; 
            case "Offboarding Associate Departing":
               templateContent = offboardingAssociateDeparting;
               break; 
            case "Offboarding Onsite":
               templateContent = offboardingOnsite;
               break;        
            default:
               templateContent = "***TEMPLATE NOT FOUND***";
         }

         return templateContent;
      }      

	return projectTemplatesLib;
})();