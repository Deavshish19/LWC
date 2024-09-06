public class ZendeskApiCall {
    
    public class TicektWrapper {
        public String body;
        public String subject;
        public String priority;
        public String name;
        public String email;
        Public Long assigneeId;
        public String caseId;
    }
    
    Public Static Void createTicketInZendesk(TicektWrapper wrapper){
        List<Case> caseList = new List<Case>();
        String endPointUrl = System.Label.Zendesk_URL;
        String header = System.Label.Zendesk_Username +':'+System.Label.Zendesk_APITOKEN;
        Blob headerValue = Blob.valueOf(header);
        System.debug('wrapper.assigneeId' + wrapper.assigneeId);
        String requestBody= '{'+
            '    "ticket": {'+
            '        "comment": {'+
            '            "body": "'+wrapper.body+'"'+
            '        },'+
            '        "priority": "'+wrapper.priority+'",'+
            '        "subject": "'+wrapper.subject+'",'+
            '        "requester": {'+
            '            "locale_id": 8,'+
            '            "name": "'+wrapper.name+'",'+
            '            "email": "'+wrapper.email+'"'+
            '        },'+
            '		  "assignee_id": "'+wrapper.assigneeId+'"'+	
            '    }'+
            '}';
        System.debug('requestBody' + requestBody);
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endPointUrl+'/tickets');
        req.setMethod('POST');
        req.setBody(requestBody);
        req.setHeader('Content-Type','application/json');
        req.setHeader('Accept','application/json');
        req.setHeader('Authorization','Basic '+ EncodingUtil.base64Encode(headerValue));
        
        HttpResponse httpRes = http.send(req);
        System.debug('SUCCESS \n '+httpRes.getBody());
        try{
            if(httpRes.getStatusCode() == 201){
                System.debug('SUCCESS \n '+httpRes.getBody());
                Map<String,Object> result = (Map<String,Object>) JSON.deserializeUntyped(httpRes.getBody());
                
                Map<String, Object> ticket = (Map<String, Object>) result.get('ticket');
                Integer zendeskId = (Integer)ticket.get('id');
                System.debug('zendeskId '+ zendeskId);
                String idOfCase = wrapper.caseId;
                System.debug('idOfCase '+ idOfCase);
                for(case c : [Select Id,Zendesk_Ticket_Id__c from Case Where Id = : idOfCase]){
                    c.Zendesk_Ticket_Id__c = String.valueOf(zendeskId);
                    caseList.add(c);
                }
                if(!caseList.isEmpty()){
                    update caseList;
                }
                // Success
            } else {
                System.debug('ERROR \n '+ httpRes.getBody());
            }
        }catch(System.CalloutException ex){
            System.debug('ERROR in CalloutException');
        }catch(System.Exception ex){
            System.debug('ERROR in Exception');
        }
    }
    
    Public Static List<ZendeskWrapper.ZendeskUser> getAgentDetails(){
        List<ZendeskWrapper.ZendeskUser> zendeskUsers = new List<ZendeskWrapper.ZendeskUser>();
        
        String endPointUrl = System.Label.Zendesk_URL;
        String header = System.Label.Zendesk_Username +':'+System.Label.Zendesk_APITOKEN;
        Blob headerValue = Blob.valueOf(header);
        
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endPointUrl+'/users');
        req.setMethod('GET');
        req.setHeader('Content-Type','application/json');
        req.setHeader('Accept','application/json');
        req.setHeader('Authorization','Basic '+ EncodingUtil.base64Encode(headerValue));
        
        try{
            HttpResponse httpRes = http.send(req);
            if(httpRes.getStatusCode() == 200){
                System.debug('SUCCESS \n '+httpRes.getBody());
                Map<String,Object> result = (Map<String,Object>) JSON.deserializeUntyped(httpRes.getBody());
                List<Object> users = (List<Object>) result.get('users');
                //System.debug('users' + users);
                for(Object userObj : users){
                    Map<String, Object> userMap = (Map<String, Object>)userObj;
                    String userole = (String)userMap.get('role');
                    System.debug('userole' + userMap.get('role'));
                    if(userMap.get('role') == 'agent'){
                        ZendeskWrapper.ZendeskUser wrapper = new ZendeskWrapper.ZendeskUser();
                        System.debug('userole' + userMap.get('role'));
                        wrapper.name = (String)userMap.get('name');
                        wrapper.email = (String)userMap.get('email');
                        wrapper.phone = (String)userMap.get('phone');
                        wrapper.role = (String)userMap.get('role');
                        wrapper.active = (Boolean)userMap.get('active');
                        wrapper.id = (Long)userMap.get('id');
                        zendeskUsers.add(wrapper);
                    }
                }
            } else {
                System.debug('ERROR \n '+ httpRes.getBody());
            }
        }catch(System.CalloutException ex){
            System.debug('ERROR in CalloutException');
        }catch(System.Exception ex){
            System.debug('ERROR in Exception');
        }
        System.debug('zendeskUsers '+ zendeskUsers);
        return zendeskUsers;
    }
}