public class ContactPhoneUpdate {
    public Static void triggerMethod(List<Contact> newContacts, map<Id,Contact> oldConMap){
        
        Map<Id,Contact> conPhoneMap = new Map<Id,Contact>();
        List<Contact> listToUpdateContact= new List<Contact>();
        List<Account> listToUpdateAccount= new List<Account>();
        
        if(!newContacts.isEmpty()){
            for(Contact newCon : newContacts){
                if(oldConMap != null){
                    Contact oldCon = oldConMap.get(newCon.Id);
                    if(newCon.AccountId != null && newCon.Phone != oldCon.Phone){
                        conPhoneMap.put(newCon.AccountId, newCon);
                    }
                }
            }    
        }
        if(!conPhoneMap.isEmpty()){
            List<Contact> contactList = [Select Id,Phone from Contact where AccountId IN : conPhoneMap.keyset()];
            if(!contactList.isEmpty()){
                for(Contact con : contactList){
                    if(conPhoneMap.containsKey(con.AccountId) && con.Phone != conPhoneMap.get(con.Id).Phone){
                        con.Phone = conPhoneMap.get(con.Id).Phone;
                        listToUpdateContact.add(con);
                    }
                }
                
                for(Account acc : [Select Id, Phone from Account where Id IN : conPhoneMap.keyset()] ){
                    acc.Phone = conPhoneMap.get(acc.Id).Phone;
                    listToUpdateAccount.add(acc);  
                }
            }
            
            if(!listToUpdateContact.isEmpty()){
                update listToUpdateContact;
            }
            
            if(!listToUpdateAccount.isEmpty()){
                update listToUpdateAccount;
            }
        }
    }
}