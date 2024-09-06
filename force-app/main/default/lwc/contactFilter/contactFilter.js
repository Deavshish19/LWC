import { LightningElement,wire,track,api } from 'lwc';
import { getObjectInfo,getPicklistValues } from 'lightning/uiObjectInfoApi';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';
import { publish, MessageContext } from 'lightning/messageService';
import recordSelected from '@salesforce/messageChannel/sendAccountid__c';

export default class ContactFilter extends NavigationMixin(LightningElement) {

    selectedValue;
    isButtonDisable =true;
    selectedAccountId;

    @wire(getObjectInfo,{objectApiName :ACCOUNT_OBJECT})
    accountInfo;
    
    @wire(getPicklistValues, { recordTypeId: '$accountInfo.data.defaultRecordTypeId', fieldApiName: INDUSTRY_FIELD } )
    indutryOptions;
    
    handleSelectedRecord(event){
        this.selectedAccountId = event.detail;
        //console.log('this.selectedAccountId>>>' , this.selectedAccountId)
        if(this.selectedAccountId){
            this.isButtonDisable = false;
        }
        else{
            this.isButtonDisable = true;
        }
        this.notifyFilterChange();
        this.publishMessage();
    }

    handleChange(event){
        this.selectedValue = event.target.value;
        //console.log('this.selectedValue>>> ', this.selectedValue );
        this.notifyFilterChange();
        this.publishMessage();
    }

    handleButtonClick(){
        //console.log('this.selectedAccountId>>>' , this.selectedAccountId)
       let defaultValues = encodeDefaultFieldValues({
        AccountId : this.selectedAccountId
       });

        let pageRef ={
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Contact',
                actionName: 'new'
            },
            state:{
                defaultFieldValues : defaultValues,
            }
        };

        this[NavigationMixin.Navigate](pageRef);
    }

    notifyFilterChange(){
        let changeFilter = new CustomEvent('filterchange',{
            detail:{
                accountId : this.selectedAccountId,
                industry : this.selectedValue
            }
        });
        this.dispatchEvent(changeFilter);
    }
      
    @wire(MessageContext)
    messageContext;

    publishMessage(){
        const payload = { accountIdFromFilter: this.selectedAccountId };

        publish(this.messageContext, recordSelected, payload);
    }
}