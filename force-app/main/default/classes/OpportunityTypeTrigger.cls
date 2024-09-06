public class OpportunityTypeTrigger {
    
    Public static void triggerMethod(List<Opportunity> newOpportunity){
        List<Opportunity> newOppList = new List<Opportunity>();
        for (Opportunity opp : newOpportunity) {
            if (opp.Type == 'New Customer'){
                newOppList.add(opp); 
            }
        }
        flowCall(newOppList);
    }
    
    Public static void flowCall(List<Opportunity> newOppReords){
        Map<String,List<Opportunity>> flowParameters = new Map<String,List<Opportunity>>();
        flowParameters.put('oppRecsList', newOppReords);
        
        flow.interview.Autolaunch flow = new flow.interview.Autolaunch(flowParameters);
        
        flow.start();
    }
       
}