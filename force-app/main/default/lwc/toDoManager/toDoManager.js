import { LightningElement,wire } from 'lwc';
import getInCompleteTask from '@salesforce/apex/toDoController.getInCompleteTask';
import getCompletedTask from '@salesforce/apex/toDoController.getCompletedTask';
import { createRecord, deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {refreshApex} from '@salesforce/apex';
import { NavigationMixin } from 'lightning/navigation';

import TASKMANAGER_OBJECT from "@salesforce/schema/Task_Manager__c";
import TASKID_FIELD from "@salesforce/schema/Task_Manager__c.Id";
import TASKNAME_FIELD from "@salesforce/schema/Task_Manager__c.Name";
import TASKEXPDATE_FIELD from "@salesforce/schema/Task_Manager__c.Task_Expiration_Date__c";
import ISCOMPLETE_FIELD from "@salesforce/schema/Task_Manager__c.IsCompleted__c";
import COMPLETIONDATE_FIELD from "@salesforce/schema/Task_Manager__c.Completion_Date__c";

export default class ToDoManager extends NavigationMixin(LightningElement) {
    taskName= "";
    taskDate = null;
    incompleteTask = [];
    completedTask = [];
    incompletetaskResult;
    completeTaskResult;
    
    @wire(getInCompleteTask)
    incompletetaskRecord(result){
        this.incompletetaskResult = result;
        let{data,error} =result;
        if(data){
            this.incompleteTask = data.map(currentItem => ({
                taskId   : currentItem.Id,
                taskName : currentItem.Name,
                taskDate : currentItem.Task_Expiration_Date__c
            }));
        }else if(error){
           console.log('error loading incomplete records ', error) 
        }
    }

    @wire(getCompletedTask)
    completetaskRecord(result){
        this.completeTaskResult = result;
        let{data,error} =result;
        if(data){
            this.completedTask = data.map(currentItem => ({
                taskId   : currentItem.Id,
                taskName : currentItem.Name,
                taskDate : currentItem.Task_Expiration_Date__c
            }));
        }else if(error){
           console.log('error loading complete records ', error) 
        }
    }

    handleChange(event){
        let{name,value} = event.target;
        if(name === "taskName"){
            this.taskName = value
        }else if(name === "taskDate"){

            this.taskDate = value
            
        }
    }

    handleReset(){
        this.taskName = "";
        this.taskDate = null;
       
    }

    async handleAdd(){

        if(!this.taskDate){
            this.taskDate = new Date().toISOString().slice(0,10);
        }
        
        if(await this.validateTask()){
        let inputFields = {};
        inputFields[TASKNAME_FIELD.fieldApiName] = this.taskName;
        inputFields[TASKEXPDATE_FIELD.fieldApiName] = this.taskDate;
        inputFields[ISCOMPLETE_FIELD.fieldApiName] = false;
        
        let recordInput= {
            apiName : TASKMANAGER_OBJECT.objectApiName,
            fields : inputFields
        }

        createRecord(recordInput).then(result=>{
            console.log('record created ', result.id)
            this.showNotification('Success','Record Created Successfully','success');
            this.handleReset();
            refreshApex(this.incompletetaskResult);
        })
        .catch(error=>{
            console.log('error while creating record : ' + JSON.stringify(error));
        })
      }
        
    }

    async validateTask(){
        console.log('inside validate');
        let isValid = true;
        let element = this.template.querySelector('.taskName')

        if(!this.taskName){
            console.log('inside If');
            isValid = false;
        }else{
            console.log('inside else');
            await refreshApex(this.incompletetaskResult);
            console.log('Updated Incomplete Tasks:', this.incompleteTask);
            let task = this.incompleteTask.find(currentItem => 
                currentItem.taskName === this.taskName &&
                currentItem.taskDate === this.taskDate
            );
            console.log('Task>>2 ', task);
            if(task){
                isValid = false;
                console.log('Task>> ', task);
                console.log('isValid>> ', isValid);
                element.setCustomValidity("Task Already Present");
            }
        }
        if(isValid){
            console.log('isValid>>2 ', isValid);
            element.setCustomValidity("");
        }

        element.reportValidity();
        console.log('isValid>>3 ', isValid);
        return isValid;
    }

    handleDelete(event){
        let recordId = event.target.name;
        deleteRecord(recordId).then(()=>{
            this.showNotification('Success','Record Deleted Successfully', 'success');
            refreshApex(this.incompletetaskResult);
        })
        .catch(error=>{
            console.log('error while deleting record : ' + JSON.stringify(error));
            this.showNotification('Error','Record Deleted failed', 'error');
        })
    }

    completedTaskHandler(event){
        let recordId = event.target.name;
        this.refreshData(recordId);
    }

    async refreshData(recordId){
        let inputFields = {};
        inputFields[TASKID_FIELD.fieldApiName] = recordId;
        inputFields[ISCOMPLETE_FIELD.fieldApiName] = true;
        inputFields[COMPLETIONDATE_FIELD.fieldApiName] = new Date().toISOString().slice(0,10) ;
        let recordInput={
            fields : inputFields
        }
        try{
            await updateRecord(recordInput);
            await refreshApex( this.completeTaskResult);
            await refreshApex(this.incompletetaskResult);
            this.showNotification('Success','Record updated Successfully', 'success');
        }catch(error){
            console.log('error while updating record : ' + JSON.stringify(error));
            this.showNotification('Error','Record update failed', 'error');
        }
        
    }

    dragStartHandler(event){
        event.dataTransfer.setData("index",event.target.dataset.item);
    }

    allowDrop(event){
        event.preventDefault();
    }

    drangHandler(event){
        let recordId = event.dataTransfer.getData("index");
        this.refreshData(recordId);
    }


    showNotification(toastTitle, toastMessage, toastVariant) {
        const evt = new ShowToastEvent({
          title: toastTitle,
          message: toastMessage,
          variant: toastVariant,
        });
        this.dispatchEvent(evt);
      }

    handleTaskNameClick(event){
        const taskRecordId = event.currentTarget.dataset.item; // Get the task ID from data attribute
        console.log('Navigating to record ID:', taskRecordId); // Debugging line

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: taskRecordId,
                objectApiName: TASKMANAGER_OBJECT.objectApiName, // Ensure this is correct
                actionName: 'view'
            }
        });
    }   
}