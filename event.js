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
    console.log(response)
    const linkedItems = window['kontentDelivery'].linkedItemsHelper.convertLinkedItemsToArray(response.data.linkedItems)

    const fetchLinkedItem = (contentItem) => {
      for(row of linkedItems){
        if(row.system.codename == contentItem && row.system.type == 'video_content'){
          return({'url':row.elements.video.value[0].url,
            'type':row.elements.video.value[0].type})
        }
      }
    }
    const richTextElement = response.data.items[0].elements.intro_message;
    const resolvedRichTextObject = window['kontentDelivery'].createRichTextHtmlResolver().resolveRichText({
          element: richTextElement,
          linkedItems: window['kontentDelivery'].linkedItemsHelper.convertLinkedItemsToArray(response.data.linkedItems),
          contentItemResolver: (contentItem) => {
            if (contentItem) {
              const dtl = fetchLinkedItem(contentItem)
              return {
                contentItemHtml: `<video controls><source  src="${dtl.url}" type="${dtl.type}"></video>`
              };
            }
            return {
              contentItemHtml: `<div>Unsupported type ${contentItem.system.type}</div>`
            };
          }
    });    
    resolveIntroMessage = resolvedRichTextObject.html;
    const locationData = response.data.linkedItems.venue_details.elements.location.value;
    const locationInfoElement = document.getElementById('locationInfo')
    locationInfoElement.innerText = locationData

    response.data.items.forEach(item => {
      const page = location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
      let mainTitle = document.getElementById('main-title');
      mainTitle.innerText = item.system.name

      const agendaTitle = document.getElementById('agendaTitle');
      agendaTitle.innerText=item.elements.agenda.linkedItems[0].elements.day.value
  

      if(page == 'index.html')
      {
        const introMessage = item.elements.intro_message.value
        //const resolvedRichTextHtml = resolvedRichText.html;
        console.log(resolvedRichTextObject)
        const introElement = createElement('div','jumbotron','innerHTML',resolveIntroMessage)
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
        
        const maps =item.elements.venue.linkedItems[0].elements.maps.value[0].url;
        const venueName = item.elements.venue.linkedItems[0].elements.name.value;
        const publicTransport = item.elements.venue.linkedItems[0].elements.public_transportation.value;
        const venue_hero_image = item.elements.venue.linkedItems[0].elements.venue_hero_image.value[0].url;
      }
      
      const regEmail = response.data.linkedItems.contact___registration___general_questions.elements.email.value;
      const regPhone = response.data.linkedItems.contact___registration___general_questions.elements.phone_number.value;
      const registrationInfoElement = document.getElementById('registrationEmail')
      registrationInfoElement.innerText = regEmail
      const registrationPhoneElement = document.getElementById('registrationPhone')
      registrationPhoneElement.innerText = (regPhone)

      const sponsorEmail = response.data.linkedItems.sponsorship_information.elements.email.value;
      const sponsorPhone = response.data.linkedItems.sponsorship_information.elements.phone_number.value;
      const sponsorInfoElement = document.getElementById('sponsorEmail')
      sponsorInfoElement.innerText = regEmail
      const sponsorPhoneElement = document.getElementById('sponsorPhone')
      sponsorPhoneElement.innerText = (sponsorPhone)

    });
  });  