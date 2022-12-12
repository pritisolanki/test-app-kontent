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
  .depthParameter(3)
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
    const getSpeaker = (speakerName) =>{
      return ({
        "name": response.data.linkedItems[speakerName].system.name,
        "company" : response.data.linkedItems[speakerName].elements.company.value,
        "bio" : response.data.linkedItems[speakerName].elements.bio.value,
        "photo" : response.data.linkedItems[speakerName].elements.photo.value[0].url,
        "designation" : response.data.linkedItems[speakerName].elements.title.value,
      })
    }
    const fetchSessionItem = (sessionName) =>{
      
      for(row of linkedItems){
        if(row.system.type == 'session_list' && row.system.codename == sessionName){
          
          const sessionTopic = row.elements.topic.linkedItems[0].elements.name.value
          const sessionTopicDtl = row.elements.topic.linkedItems[0].elements.topic_details.value
          const sessionSpeakerKey = row.elements.speaker.value
            
          let speakerList = []
          for(speaker of sessionSpeakerKey){
            spk = getSpeaker(speaker)
            speakerList.push(spk)
          }
          const sessionroom = row.elements.room.value[0]
          const sessionStartDate= row.elements.date_n_time.value
          const sessionEndDate = row.elements.end_date___time.value
          return({
            "topic":sessionTopic,
            "topic_details": sessionTopicDtl,
            "speaker": speakerList,
            "room": sessionroom,
            "start":sessionStartDate,
            "end":sessionEndDate
          })
        }
      }
    }


    const fetchSponsor = (sponsorItem) =>{
      return (`<p align="center"><a href="${response.data.linkedItems[sponsorItem].elements.url.value}"><img src="${response.data.linkedItems[sponsorItem].elements.logo.value[0].url}" width="200" height="200"></a></p>`)
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
    
    const sponsorList = response.data.items[0].elements.sponsor.value;
    let i = 1
    for(sponsor of sponsorList)
    {
      sDetails = fetchSponsor(sponsor)
      keyC = `sponsor${i}`
      const sponsorElem = document.getElementById(keyC);
      sponsorElem.innerHTML=sDetails
      i = i + 1
    }
    
    response.data.items.forEach(item => {
      const page = location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
      let mainTitle = document.getElementById('main-title');
      mainTitle.innerText = item.system.name

      const agendaTitle = document.getElementById('agendaTitle');
      agendaTitle.innerText=item.elements.agenda.linkedItems[0].elements.day.value
  
      if(page == 'index.html')
      {
        const introElement = createElement('div','jumbotron','innerHTML',resolveIntroMessage)
        app.appendChild(introElement)
      }else if(page == 'agenda.html'){
        //agenda
        const agendaDetailsEle = document.getElementById('agendaDetails')
        const introPhoto = item.elements.photo.value[0].url
        const SectionImgElement = createElement('img','row','src',introPhoto)
        SectionImgElement.setAttribute('align','right')
        agendaDetailsEle.appendChild(SectionImgElement)

        const agendaDay = response.data.linkedItems.full_agenda___denver_conf.elements.day.value
        const agendaDetails = response.data.linkedItems.full_agenda___denver_conf.elements.sessions.value
        const sessionList = [];
        
        for(row of agendaDetails){
          sessionlist = fetchSessionItem(row)
          const startTime = new Date(sessionlist['start']).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
          const endTime =new Date(sessionlist['end']).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  
          let sessionRow = `
          <h3>${sessionlist['topic']}</h3>
          <h5>${startTime} - ${endTime} @${sessionlist['room']}</h5>
          <div style="padding-left:20px">${sessionlist['topic_details']}</div>`;
          console.log(sessionRow)
          let spkitem = ''
          for (item of sessionlist['speaker'])
          {
            spkitem = spkitem + `${item.name}`+ ' ';
          }
          
          sessionRow = sessionRow + `<p>${spkitem} </p>`
          const sessionEle = createElement('div','row','innerHTML',sessionRow)
          agendaDetailsEle.appendChild(sessionEle)
        }
        
      }
      else{
        //venue
        const drivingDirection = item.elements.venue.linkedItems[0].elements.driving_directions.value;
        
        const maps = item.elements.venue.linkedItems[0].elements.maps.value[0].url;
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
      sponsorInfoElement.innerText = sponsorEmail
      const sponsorPhoneElement = document.getElementById('sponsorPhone')
      sponsorPhoneElement.innerText = (sponsorPhone)

      const fb = response.data.linkedItems.facebook.elements.url.value;
      const facebookLinkElement = document.getElementById('facebookLink');
      facebookLinkElement.setAttribute("href",fb);

      const tw = response.data.linkedItems.twitter_dallas.elements.url.value;
      const twitterElement = document.getElementById('twitterLink');
      twitterElement.setAttribute("href",tw);
    });
  });  