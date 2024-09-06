import { LightningElement, wire,api } from 'lwc';
import getAccountData from '@salesforce/apex/controller.getAccountData';
import { getObjectInfo,getPicklistValues } from 'lightning/uiObjectInfoApi';
import { createRecord,getRecord,getFieldValue, updateRecord } from 'lightning/uiRecordApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import SLA_TYPE_FIELD from '@salesforce/schema/Account.SLA__c';
import PARENTACCOUNT_FIELD from '@salesforce/schema/Account.ParentId';
import ACCOUNTNAME_FIELD from '@salesforce/schema/Account.Name';
import SLAEXPIRATIONDATE_FIELD from '@salesforce/schema/Account.SLAExpirationDate__c';
import ACCOUNTDESCRIPTION_FIELD from '@salesforce/schema/Account.Description';
import ACCOUNTID_FIELD from '@salesforce/schema/Account.Id';
import {NavigationMixin} from 'lightning/navigation'
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const fieldInput = [SLA_TYPE_FIELD,PARENTACCOUNT_FIELD,ACCOUNTNAME_FIELD,SLAEXPIRATIONDATE_FIELD,ACCOUNTDESCRIPTION_FIELD];

export default class CustomAccountPage extends NavigationMixin(LightningElement) {

    parentOptions= [];
    selectedParentAcc;
    accName = '';
    slaExpDate = null
    slaType;
    slaPicklistOptions;
    accDecription = '';
    @api recordId;

    @wire(getRecord,{recordId : '$recordId', fields : fieldInput})
    wiredrecord({data,error}){
        console.log('Data2>>>', data);
        if(data){
            console.log('Data2>>>', data);
            this.selectedParentAcc = getFieldValue(data,PARENTACCOUNT_FIELD);
            this.accName = getFieldValue(data,ACCOUNTNAME_FIELD);
            this.slaExpDate = getFieldValue(data,SLAEXPIRATIONDATE_FIELD);
            this.slaType = getFieldValue(data,SLA_TYPE_FIELD);
            this.accDecription = getFieldValue(data,ACCOUNTDESCRIPTION_FIELD);
        }else if(error){
             console.log('error in loading data');
        }
    }

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
            console.log('this.selectedParentAcc',this.selectedParentAcc)
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
            this.accDecription = this.sanitizeInput(value);
        }
    }

    sanitizeInput(input) {
        const doc = new DOMParser().parseFromString(input, 'text/html');
        return doc.body.textContent || '';
    }
    handleSave(event){
        console.log('inside Handle Save');
        if(this.validateInput()){
            console.log('return validate');
            let inputFields = {};
            inputFields[PARENTACCOUNT_FIELD.fieldApiName] = this.selectedParentAcc;
            inputFields[ACCOUNTNAME_FIELD.fieldApiName] = this.accName;
            inputFields[SLAEXPIRATIONDATE_FIELD.fieldApiName] = this.slaExpDate;
            inputFields[SLA_TYPE_FIELD.fieldApiName] = this.slaType;
            inputFields[ACCOUNTDESCRIPTION_FIELD.fieldApiName] = this.accDecription;
            if(this.recordId){
                inputFields[ACCOUNTID_FIELD.fieldApiName] = this.recordId;
                let recordInput ={
                    fields : inputFields
                }

                updateRecord(recordInput).then((result)=>{
                    console.log('record Update Successfully');
                    this.showNotification('Success','Record Update Successfully', 'success');
                })
                .catch((error)=>{
                    console.log('error while updating record : ' + error);
                    this.showNotification('Error','Record not Update', 'error');
                })
            }
            else{
                let recordInput = {
                apiName : ACCOUNT_OBJECT.objectApiName,
                fields : inputFields
            }
            
                createRecord(recordInput).then((result)=>{
                    console.log('record created with id : ' + result.id);
                    let pageRef = {
                        type: 'standard__recordPage',
                        attributes: {
                            recordId: result.id,
                            objectApiName: ACCOUNT_OBJECT.objectApiName,
                            actionName: 'view'
                        }
                    };
                    this[NavigationMixin.Navigate](pageRef);
                })
                .catch((error)=>{
                    console.log('error while creating record : ' + error);
                })
            }
        }else{
            console.log('error while saving');
        }
    }

    validateInput(){
        console.log('inside validate ');
        let fields = Array.from(this.template.querySelectorAll('.validate'));
        //console.log('isValidsd ', JSON.stringify(fields));
        let isValid = fields.every(currentField => currentField.checkValidity());
        console.log('isValid ', isValid);
        return isValid;
    }

    showNotification(toastTitle, toastMessage, toastVariant) {
        const evt = new ShowToastEvent({
          title: toastTitle,
          message: toastMessage,
          variant: toastVariant,
        });
        this.dispatchEvent(evt);
      }
    
}