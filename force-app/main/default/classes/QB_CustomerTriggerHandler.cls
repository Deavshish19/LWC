public class QB_CustomerTriggerHandler {
    Public static void triggerMethod(List<QuickBook_Customer__c> newCustomer){
        List<QB_CustomerWrapper> customerWrapper = new List<QB_CustomerWrapper>();
        
        for(QuickBook_Customer__c customer : newCustomer){
            QB_CustomerWrapper wrapper = new QB_CustomerWrapper();
            wrapper.CompanyName = customer.Company_Name__c;
            
            wrapper.PrimaryEmailAddr = new QB_CustomerWrapper.PrimaryEmailAddr();
            wrapper.PrimaryEmailAddr.Address = customer.Primary_Email__c;
            
            wrapper.PrimaryPhone = new QB_CustomerWrapper.PrimaryPhone();
            wrapper.PrimaryPhone.FreeFormNumber = customer.Primary_Phone__c;
            
            wrapper.GivenName = customer.Given_Name__c;
            wrapper.MiddleName = customer.Middle_Name__c;
           	Id SalesforceId = customer.Id;
            
            makeCallout(JSON.serialize(wrapper),SalesforceId);
        }
    }
    
    @future(callout = true) // THIS is not the best Solution
        private static void makeCallout(String params,Id SalesforceId){
            // Convert the String in object(class)
            QB_CustomerWrapper wrapper = (QB_CustomerWrapper)JSON.deserialize(params, QB_CustomerWrapper.class);
            QB_CreateCustomer.createCustomer(wrapper,SalesforceId);
        }
}