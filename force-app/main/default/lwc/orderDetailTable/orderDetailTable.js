import { LightningElement,api,wire } from 'lwc';
import getOrderSummary from '@salesforce/apex/OrderSummaryController.getOrderSummary';

const COLUMNS = [
    { label: 'Product Name', fieldName: 'Product2Name', type: 'text' },
    { label: 'Quantity', fieldName: 'Quantity', type: 'number' }
];

export default class OrderDetailTable extends LightningElement {
    @api recordId; 
    columns = COLUMNS;
    showOrder;
    orderItems;

    @wire(getOrderSummary, { orderId: '$recordId' })
    orderData({ error, data }) {
        if (data) {
            this.showOrder = data.order;
            this.showOrderItems = data.orderItems.map(item => ({
                ...item,
                Product2Name: item.Product2.Name 
            }));
        } else if (error) {
            console.error('Error fetching order data:', error);
        }
    }

}