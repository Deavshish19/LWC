public class QB_CreateCustomer {
	public static void testCreateCustomer(){
        QB_CustomerWrapper customer = new QB_CustomerWrapper();
        customer.CompanyName = 'Cymetasdrsafix';
        customer.DisplayName = 'Cymetriasadfsx.com';
        customer.FamilyName = 'Ingle55';
        customer.FullyQualifiedName = 'Cymetrix.com-Dsadsevashish-Ingldsfe';
        customer.GivenName = 'Devashisfash';
        customer.MiddleName = 'afN';
        customer.Notes = 'Testing from Apex Clasafss';
        customer.Suffix = 'Jr.';
        customer.Title = 'Mr';

        /* Prepare PrimaryEmailAddr */
        QB_CustomerWrapper.PrimaryEmailAddr email = new QB_CustomerWrapper.PrimaryEmailAddr();
        email.Address = 'asingh@zmail.com';
        customer.PrimaryEmailAddr = email;

        /* Prepare PrimaryPhone */
        QB_CustomerWrapper.PrimaryPhone phone = new QB_CustomerWrapper.PrimaryPhone();
        phone.FreeFormNumber = '987653210';
        customer.PrimaryPhone = phone;

        /* Prepare BillAddr */
		 Id SalesforceId = 'a04dL000000vK5FQAU';
        createCustomer(customer,SalesforceId);
    }    
    
    Public Static void createCustomer(QB_CustomerWrapper customer, Id SalesforceId){
        System.debug('Salesforce' + SalesforceId);
        List<QuickBooks_Metadata__mdt> configList = [SELECT Id, DeveloperName, MasterLabel,
                                        access_token__c, auth_url__c, expires_in__c, expires_in_time__c, minorVersion__c, 
                                        realmId__c, refresh_token__c, token_url__c,client_Id__c,client_secret__c 
                                        FROM QuickBooks_Metadata__mdt 
                                        WHERE DeveloperName = 'QBToken' 
                                        LIMIT 1];
        
        if(configList?.size() > 0){
            QuickBooks_Metadata__mdt config = configList.get(0);
            System.debug(config.access_token__c);
            String accessToken = config.access_token__c;
        	Boolean isValid = QuickBooksIntegeration.isValid(config);
            Map<String, Object> fieldWithValuesMap;

            if(isValid == false){ // Token is Expired
                // Refresh the Token
                fieldWithValuesMap = QuickBooksIntegeration.refreshToken(config);
                accessToken = (String)fieldWithValuesMap.get('access_token__c'); // null/blank
            }
            
        	String endUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company/'+config.realmId__c+'/customer?minorversion='+config.minorVersion__c;
        	
        	HttpRequest req = new HttpRequest();
        	req.setEndpoint(endUrl);
            req.setMethod('POST');
            req.setHeader('Content-Type','application/json');
            req.setHeader('Accept','application/json');
            req.setHeader('Authorization', 'Bearer '+ accessToken);
            
            String requestBody = System.JSON.serializePretty(customer);
            System.debug(requestBody);
            req.setBody(requestBody);
            
            try{
                HttpResponse res = (new Http()).send(req);
                System.debug(res.getStatusCode());
                System.debug(res.getBody());
                if(res.getStatusCode() >= 200 && res.getStatusCode() < 300){
                    Map<String,Object> responseMap = (Map<String,Object>)System.JSON.deserializeUntyped(res.getBody());
                    Map<String, Object> customerMap = (Map<String, Object>) responseMap.get('Customer');
                    String customerId = (String)customerMap.get('Id');
                    List<QuickBook_Customer__c> listToUpdate = new List<QuickBook_Customer__c>();
                    System.debug('Successfully Inserted Customer '+ customerId);
                    for(QuickBook_Customer__c cus : [Select Id,QuickBook_Customer_Id__c from QuickBook_Customer__c where Id = : SalesforceId]){
                        cus.QuickBook_Customer_Id__c = customerId;
                        listToUpdate.add(cus);
                    }
                    if(!listToUpdate.isEmpty()){
                        update listToUpdate;
                    }
                }else{
                    System.debug('error code');
                }
            }catch(CalloutException ex){
                System.debug('callout Exception '+ ex);
            }catch(exception ex){
                System.debug('Exception '+ ex);
            }
            
            if(fieldWithValuesMap?.size() > 0){
                System.debug('Updating the Custom Metadata... ');
                String fullName = 'QuickBooks_Metadata.QBToken';
                String label    = 'QBToken';
                // Deploy/Update the Custom Metadata
                CreateUpdateMetadataUtils.createUpdateMetadata(fullName, label, fieldWithValuesMap);
            }    
        }     
    }
}