public class ZendeskBatchClass implements database.Batchable<sObject>,Database.AllowsCallouts{
	
    Public Database.QueryLocator start(Database.BatchableContext bc){
        return Database.getQueryLocator([SELECT Id FROM Agent__c LIMIT 1]);
    }
    
    Public void execute (Database.BatchableContext bc , List<Sobject> scope){
        List<ZendeskWrapper.ZendeskUser> zendeskUser = ZendeskApiCall.getAgentDetails();
        List<Agent__c> agentData = new List<Agent__c>();
        for(ZendeskWrapper.ZendeskUser user : zendeskUser){
            Agent__c agent = new Agent__c();
            agent.Active__c = user.active;
            agent.Email__c = user.email;
            agent.Name = user.name;
            agent.Phone__c = user.Phone;
            agent.Zendesk_User_Id__c = string.valueOf(user.id);
            agent.Role__c = user.role;
            agentData.add(agent);
        }
        if(!agentData.isEmpty()){
            Database.Upsert(agentData, Agent__c.Zendesk_User_Id__c);
        }
    } 
    
    Public void finish (Database.BatchableContext bc){
        
    } 
}