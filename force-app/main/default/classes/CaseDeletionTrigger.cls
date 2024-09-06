public class CaseDeletionTrigger {
    public static void triggerMethod(List<Case> listOfDeletedCase) {
        Set<Id> accIds = new Set<Id>();
        List<Task> listToInsertTask = new List<Task>();
        List<Messaging.SingleEmailMessage> listOfEmail = new List<Messaging.SingleEmailMessage>();
        
        for (Case c : listOfDeletedCase) {
            if (c.AccountId != null) {
                accIds.add(c.AccountId); 
            }
        }
        
        if (!accIds.isEmpty()) {
            Map<Id, Account> mapOfAccount = new Map<Id, Account>([SELECT Id, Owner.Email, Name FROM Account WHERE Id IN :accIds]);
            
            for (Case csRecord : listOfDeletedCase) {
                if (csRecord.AccountId != null && mapOfAccount.containsKey(csRecord.AccountId)) {
                    Account acc = mapOfAccount.get(csRecord.AccountId);
                    
                    Task taskRecord = new Task();
                    taskRecord.Subject = 'Case Record Deleted - CaseNumber: ' + csRecord.CaseNumber;
                    taskRecord.Priority = 'High';
                    taskRecord.Status = 'In Progress';
                    taskRecord.WhatId = csRecord.AccountId;
                    listToInsertTask.add(taskRecord);
                    
                    if (acc.Owner.Email != null) {
                        String ownerEmail = acc.Owner.Email;
                        String emailBody = 'Hello,\n\nA case record with Case Number: ' + csRecord.CaseNumber + 
                                           ' has been deleted from Account ' + acc.Name + '\n\nBest Regards,\nSalesforce Team';
                        listOfEmail.addAll(sendEmailtoOwner(ownerEmail, emailBody));
                    }
                }
            }
            
            if (!listToInsertTask.isEmpty()) {
                insert listToInsertTask;
            }
        }

        if (!listOfEmail.isEmpty()) {
            Messaging.sendEmail(listOfEmail);
        }  
    }
    
    public static List<Messaging.SingleEmailMessage> sendEmailtoOwner(String email, String body) {
        List<Messaging.SingleEmailMessage> listOfEmail = new List<Messaging.SingleEmailMessage>();
        
        Messaging.SingleEmailMessage emailMsg = new Messaging.SingleEmailMessage();
        emailMsg.setToAddresses(new String[] {email});
        emailMsg.setSubject('Case Record Deleted');
        emailMsg.setPlainTextBody(body);
        listOfEmail.add(emailMsg);
        
        return listOfEmail;
    }
}