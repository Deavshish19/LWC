public class controller {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountData(){
        system.debug([SELECT Id,Name FROM Account WHERE AnnualRevenue != null]);
        return [SELECT Id,Name FROM Account WHERE AnnualRevenue != null];
    }
}