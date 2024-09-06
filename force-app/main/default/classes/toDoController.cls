public with sharing class toDoController {
    @AuraEnabled(cacheable=true)
    public static List<Task_Manager__c> getInCompleteTask(){
        return [SELECT Id,Name,Task_Expiration_Date__c,IsCompleted__c FROM Task_Manager__c WHERE OwnerId = : userInfo.getUserId() AND IsCompleted__c = false ORDER BY Task_Expiration_Date__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Task_Manager__c> getCompletedTask(){
        return [SELECT Id,Name,Task_Expiration_Date__c,IsCompleted__c,Completion_Date__c FROM Task_Manager__c WHERE OwnerId = : userInfo.getUserId() AND IsCompleted__c = true ORDER BY Task_Expiration_Date__c	DESC];
    }
}