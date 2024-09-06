public with sharing class DataTableController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactList(){

        return [Select Id, Name,AccountId, Account.Name, Phone,Email, Title, Picture__c, Rank__c from Contact where AccountId != null];
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> getRealtedContactList(String selectedAccountId){

        return [Select Id, FirstName, LastName , LeadSource,Phone,Email, Title from Contact where AccountId = : selectedAccountId];
    }
     
}