// Add list container to app
const articleList = addToElementbyId('div', 'article-list', app);
// Function for adding elements to DOM with specific attributes
const createElement = (elementType, classToAdd, attribute, attributeValue) => {
  const element = document.createElement(elementType);
  element.setAttribute('class', classToAdd);

  // Set attribute value based on the attribute required
  attribute === 'href'
    ? (element.href = attributeValue)
    : attribute === 'innerHTML'
    ? (element.innerHTML = attributeValue)
    : attribute === 'innerText'
    ? (element.innerText = attributeValue)
    : attribute === 'src'
    ? (element.src = attributeValue)
    : undefined;

  return element;
};

deliveryClient
  .items()
  .type('event')
  .toPromise()
  .then(response => {
    response.data.items.forEach(item => {
      console.log(item)
      console.log()
      let mainTitle = document.getElementById('main-title');
      mainTitle.innerText = item.system.name
      const introMessage = item.elements.intro_message.value
      
      const resolvedRichTextObject = window['kontentDelivery'].createRichTextObjectResolver({
        element: introMessage,
        linkedItems: window['kontentDelivery'].linkedItemsHelper.convertLinkedItemsToArray(item.elements.intro_message.linkedItems),          
        contentItemResolver: (contentItem) => {
          if (contentItem && contentItem.system.type === 'video_content') {
            return {
              contentItemHtml: `<video controls src="${contentItem.elements.value}"></video>`
            };
          }
          return {
            contentItemHtml: `<div>Unsupported type ${contentItem.system.type}</div>`
          };
        }
      });
      console.log(resolvedRichTextObject.html)
      const introElement = createElement('div','jumbotron','innerHTML',introMessage)
      app.appendChild(introElement)
      const introPhoto = item.elements.intro_message.images[0].url
    });
  });




  