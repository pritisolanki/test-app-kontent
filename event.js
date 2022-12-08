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
      const page = location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
      let mainTitle = document.getElementById('main-title');
      mainTitle.innerText = item.system.name


     const agendaTitle = document.getElementById('agendaTitle');
     agendaTitle.innerText=item.elements.agenda.linkedItems[0].elements.day.value

     const sponsorEmail = item.elements.contact.linkedItems[0].elements.email.value;
     const sponsorPhonenumber = item.elements.contact.linkedItems[0].elements.phone_number.value;
     const sponsor = createElement('div','col','innerHTML',sponsorEmail+' '+sponsorPhonenumber)

     const registrationEmail = item.elements.contact.linkedItems[1].elements.email.value;
     const registrationPhonenumber = item.elements.contact.linkedItems[1].elements.phone_number.value;
     const registration = createElement('div','col','innerHTML',registrationEmail+' '+registrationPhonenumber)

      if(page == 'index.html')
      {
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
        const introElement = createElement('div','jumbotron','innerHTML',introMessage)
        app.appendChild(introElement)
      }else if(page == 'agenda.html'){
        //agenda
        const agendaDetails = document.getElementById('agendaDetails')
        const introPhoto = item.elements.photo.value[0].url
        const SectionImgElement = createElement('img','row','src',introPhoto)
        SectionImgElement.setAttribute('align','right')
        agendaDetails.appendChild(SectionImgElement)
      }else{
        //venue
        const drivingDirection = item.elements.venue.linkedItems[0].elements.driving_directions.value;
        const location =item.elements.venue.linkedItems[0].elements.location.value;
        const maps =item.elements.venue.linkedItems[0].elements.maps.value[0].url;
        const venueName = item.elements.venue.linkedItems[0].elements.name.value;
        const publicTransport = item.elements.venue.linkedItems[0].elements.public_transportation.value;
        const venue_hero_image = item.elements.venue.linkedItems[0].elements.venue_hero_image.value[0].url;
      }
    });
  });




  