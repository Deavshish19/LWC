public class AssignLeadsUsingAssignmentRules
{
   @InvocableMethod
    public static void assignLeads(List<Id> leadIds){
        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.AssignmentRuleHeader.useDefaultRule = TRUE;
        List<Lead> toAssign = [SELECT Id FROM Lead WHERE Id = :leadIds];
        Database.update(toAssign,dmo);
    }
}