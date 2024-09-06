import { LightningElement, wire } from 'lwc';
import getAccountData from '@salesforce/apex/controller.getAccountData';
import { getObjectInfo,getPicklistValues } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import SLA_TYPE_FIELD from '@salesforce/schema/Account.SLA__c';


export default class Demo extends LightningElement {

    parentOptions= [];
    selectedParentAcc;
    accName = '';
    slaExpDate = null
    slaType;
    slaPicklistOptions;
    accDecription = '';

    @wire(getAccountData)
    accountData({data,error}){
        console.log('data>>' , data);
        this.parentOptions= [];
        if(data){
            this.parentOptions = data.map(currentItem => ({
                 label: currentItem.Name,
                 value: currentItem.Id
            }))
        }else if(error){
            console.log('error in Loading Apex query');
        }
    }

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    accountInfo;

    @wire(getPicklistValues,{recordTypeId : '$accountInfo.data.defaultRecordTypeId', fieldApiName : SLA_TYPE_FIELD  })
    slaPicklist({data,error}){
        if(data){
            this.slaPicklistOptions = data.values;
        }else if(error){
            console.log('error in Loading picklist value');
        }
    }



    handleChange(event){
        let{name,value} = event.target;

        if(name === 'parentAcc'){
            this.selectedParentAcc = value;
        }
        if(name=== 'accName'){
            this.accName= value;
        }
        if(name=== 'slaexpdate'){
            this.slaExpDate= value;
        }
        if(name=== 'slatype'){
            this.slaType= value;
        }
        if(name === 'accdescription'){
            this.accDecription = value;
        }
    }

}