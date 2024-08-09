import { LightningElement,wire } from 'lwc';
import getInCompleteTask from '@salesforce/apex/toDoController.getInCompleteTask';
import getCompletedTask from '@salesforce/apex/toDoController.getCompletedTask';
import { createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import TASKMANAGER_OBJECT from "@salesforce/schema/Task_Manager__c";
import TASKNAME_FIELD from "@salesforce/schema/Task_Manager__c.Name";
import TASKEXPDATE_FIELD from "@salesforce/schema/Task_Manager__c.Task_Expiration_Date__c";
import ISCOMPLETE_FIELD from "@salesforce/schema/Task_Manager__c.IsCompleted__c";
import COMPLETIONDATE_FIELD from "@salesforce/schema/Task_Manager__c.Completion_Date__c";

export default class ToDoManager extends LightningElement {
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

    handleAdd(){

        if(!this.taskDate){
            this.taskDate = new Date().toISOString().slice(0,10);
        }
        
        if(this.validateTask()){
           /*  console.log('this.taskName ', this.taskName)
            console.log('this.taskDate ', this.taskDate)
            this.incompleteTask = [
                ...this.incompleteTask,
                {
                    taskName: this.taskName,
                    taskDate: this.taskDate
                }
            ];
            console.log('this.incompleteTask>>> 5g1',JSON.parse(JSON.stringify(this.incompleteTask)));
        this.handleReset();
        this.sortingLogic(); */

        let inputFields = {};
        inputFields[TASKNAME_FIELD.fieldAPINAME] = this.taskName;
        inputFields[TASKEXPDATE_FIELD.fieldAPINAME] = this.taskDate;
        inputFields[ISCOMPLETE_FIELD.fieldAPINAME] = false;
        
        let recordInput= {
            apiName : TASKMANAGER_OBJECT.objectApiName,
            fields : inputFields
        }

        createRecord(recordInput).then(result=>{
            console.log('record created ', result.id)
            this.showNotification('Success','Record Created Successfully','success');
            this.handleReset();
        })
        .catch(error=>{
            console.log('error while creating record : ' + error);
        })
      }
        
    }

    validateTask(){
        console.log('inside validate');
        let isValid = true;
        let element = this.template.querySelector('.taskName')

        if(!this.taskName){
            console.log('inside If');
            isValid = false;
        }else{
            console.log('inside else');
            let task = this.incompleteTask.find(currentItem => 
                currentItem.taskName === this.taskName &&
                currentItem.taskDate === this.taskDate
            );
            console.log('Task>>2 ', task);
            if(task){
                isValid = false;
                console.log('Task>> ', task);
                element.setCustomValidity("Task Already Present");
            }
        }
        if(isValid){
            element.setCustomValidity("");
        }

        element.reportValidity();
        return isValid;
    }

    sortArray(inputArray){
        let sortedArray = inputArray.sort((a,b)=>{
            const dateA = new Date(a.taskDate);
            const dateB = new Date(b.taskDate);
            return dateA - dateB;
        });

        return sortedArray;
    }

    handleDelete(event){
        let index = event.target.name;
        this.incompleteTask.splice(index,1);
        this.sortingLogic();
    }

    completedTaskHandler(event){
        let index = event.target.name;
        let removeItem = this.incompleteTask.splice(index,1);
        this.sortingLogic();
        this.completedTask = [...this.completedTask,removeItem[0]];
        console.log('this.completeTask>>> ', this.completedTask);
    }

    sortingLogic(){
        let sortedArray = this.sortArray(this.incompleteTask);
        this.incompleteTask = [...sortedArray];
        console.log('this.incompleteTask>>> ', this.incompleteTask);
    }

    dragStartHandler(event){
        event.dataTransfer.setData("index",event.target.dataset.item);
    }

    allowDrop(event){
        event.preventDefault();
    }

    drangHandler(event){
        let index = event.dataTransfer.getData("index");
        let removeItem = this.incompleteTask.splice(index,1);
        this.sortingLogic();
        this.completedTask = [...this.completedTask,removeItem[0]];
        console.log('this.completeTask>>> ', this.completedTask);
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