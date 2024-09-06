public class CaseUpdate {
    public Static void triggerMethod(List<Case> newCase , Map<Id,Case> oldCaseMap ){
        set<Id> accIds = new set<Id>();
        set<Id> caseIds = new set<Id>();
        if(!newCase.isEmpty()){
            for(Case c : newCase){
                if(c.AccountId != null && c.Status == 'Closed' && oldCaseMap.get(c.Id).Status == 'Working'){
                    accIds.add(c.AccountId);
                    caseIds.add(c.Id);
                }
            }
        }
    }
}