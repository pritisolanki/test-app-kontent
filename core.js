// Define main container
const app = document.getElementById('app');

const Kk = window['kontentDelivery'];
const deliveryClient = new Kk.createDeliveryClient({
  projectId: 'a6b9420d-8938-0096-4de3-50425aa9e2ea'
});


const addToElementbyId = (elementType, id, parent) => {
  const element = document.createElement(elementType);
  element.setAttribute('id', id);
  parent.appendChild(element);
  return element;
};