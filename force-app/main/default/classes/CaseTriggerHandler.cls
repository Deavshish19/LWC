public class CaseTriggerHandler {
    public static void handleAfterInsert(List<Case> newRecords){    
        List<Case> casesWithAgent = [
        SELECT Id, Description, Subject, Priority, 
               Contact.Name, Contact.Email,Agent__r.Zendesk_User_Id__c 
        FROM Case 
        WHERE Id IN :newRecords
    ];
        
        for(Case c : casesWithAgent){
            if (c.Contact != null && c.Contact.Email != null) {
                ZendeskApiCall.TicektWrapper wrapper = new ZendeskApiCall.TicektWrapper();
                wrapper.body     = c.Description;
                wrapper.subject  = c.Subject;
                wrapper.priority = c.Priority != null ? c.Priority.toLowerCase() : 'normal'; // Default to 'normal' if priority is null
                wrapper.name     = c.Contact.Name;
                wrapper.email    = c.Contact.Email;
                wrapper.caseId   = c.Id;
                //Integer zendeskAgentId = Integer.valueOf()
                wrapper.assigneeId =  Long.valueOf(c.Agent__r.Zendesk_User_Id__c);
				System.debug('wrapper.assigneeId Trigger' + wrapper.assigneeId);
                // Converting the Object into String and making the callout
                makeCallout(JSON.serialize(wrapper));
            } else {
                // Handle the case where Agent__r or email is null
                System.debug('Agent information is missing for Case ID: ' + c.Id);
            }
        }
     
    }   
        
        @future(callout = true) // THIS is not the best Solution
        private static void makeCallout(String params){
            // Convert the String in object(class)
            ZendeskApiCall.TicektWrapper wrapper = (ZendeskApiCall.TicektWrapper)JSON.deserialize(params, ZendeskApiCall.TicektWrapper.class);
            ZendeskApiCall.createTicketInZendesk(wrapper);
        }
    }