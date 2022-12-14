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
function phoneFormat(num) {
  num = num.toString().replace(/^0+/, '');
  num = num.toString().replace(/[^0-9]/, '');
  if (num.length == 11) {
      if (num.substr(0, 1) == 1) num = "+1 " + num.substr(1, 3) + "-" + num.substr(4, 3) + "-" + num.substr(7, 4);
      else num = "+" + num.substr(0, 2) + " " + num.substr(2, 3) + "-" + num.substr(5, 3) + "-" + num.substr(8, 3);
  }
  return num;
}

deliveryClient
  .items()
  .type('event')
  .depthParameter(3)
  .orderByAscending('elements.title')
  .toPromise()
  .then(response => {
    const linkedItems = window['kontentDelivery'].linkedItemsHelper.convertLinkedItemsToArray(response.data.linkedItems)

    const fetchLinkedItem = (contentItem) => {
      for(row of linkedItems){
        if(row.system.codename == contentItem && row.system.type == 'video_content'){
          return({'url':row.elements.video.value[0].url,
            'type':row.elements.video.value[0].type})
        }
      }
    }
    const fetchLinkedItemByType = (contentType) => {
      contentTypeList = []

      for(row of linkedItems){
        if(row.system.type == 'speaker'){
          contentTypeList.push({
            "name": row.system.name,
            "company" : row.elements.company.value,
            "bio" : row.elements.bio.value,
            "photo" : row.elements.photo.value[0].url,
            "designation" : row.elements.title.value,
          })
        }
      }
      if(contentTypeList.length != 0) return contentTypeList
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
    const getRoom = (roomCodeName) =>{
        return ({
          "name": response.data.linkedItems[roomCodeName].elements.name.value,
          "capacity": response.data.linkedItems[roomCodeName].elements.capacity.value,
          "services": response.data.linkedItems[roomCodeName].elements.services.value,
          "style": response.data.linkedItems[roomCodeName].elements.style.value[0].name
        })
    }
    const fetchSessionItem = (sessionName) =>{      
      for(row of linkedItems){
        if(row.system.type == 'session_list' && row.system.codename == sessionName){
          const sessionSpeakerKey = row.elements.speaker.value
            
          let speakerList = []
          for(speaker of sessionSpeakerKey){
            spk = getSpeaker(speaker)
            speakerList.push(spk)
          }
          const sessionroomDetails = getRoom(row.elements.room.value[0])
          return({
            "topic":row.elements.topic.linkedItems[0].elements.name.value,
            "topic_details": row.elements.topic.linkedItems[0].elements.topic_details.value,
            "speaker": speakerList,
            "room": sessionroomDetails.name,
            "start":row.elements.date_n_time.value,
            "end":row.elements.end_date___time.value
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
  console.log(page)
      if(page == 'index.html' || page=="")
      {
        const introElement = createElement('div','jumbotron','innerHTML',resolveIntroMessage)
        mainDivEle = document.getElementById('mainDiv')
        mainDivEle.appendChild(introElement)

      }else if(page == 'agenda.html'){
        //agenda
        const agendaHeroShotImageEle = document.getElementById('agendaHeroShotImage')

        const introPhoto = item.elements.photo.value[0].url
        const SectionImgElement = createElement('img','row','src',introPhoto)
        SectionImgElement.setAttribute('align','right')
        agendaHeroShotImageEle.appendChild(SectionImgElement)

        const agendaDay = response.data.linkedItems.full_agenda___denver_conf.elements.day.value
        const agendaDetails = response.data.linkedItems.full_agenda___denver_conf.elements.sessions.value
        const sessionList = [];
        const agendaDetailsEle = document.getElementById('agendaDetails')
        for(row of agendaDetails){
          sessionlist = fetchSessionItem(row)
          const startTime = new Date(sessionlist['start']).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
          const endTime =new Date(sessionlist['end']).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  
          let sessionRow = `
          <div class="alert alert-primary">${sessionlist['topic']}</div>
          <div class="pl-5">
          <h6 class="card-title">${startTime} - ${endTime} @${sessionlist['room']}</h6>
          <div class="card-text">${sessionlist['topic_details']}`;
          let spkitem = ''
          for (item of sessionlist['speaker'])
          {
            spkitem = spkitem + `${item.name}`+ ' ';
          }
          
          sessionRow = sessionRow + `<p>${spkitem} </p></div>`
          const sessionEle = createElement('div','row','innerHTML',sessionRow)
          agendaDetailsEle.appendChild(sessionEle)
        }
        
      }
      else if(page == 'speaker.html'){
        agendaTitle.innerText='Industry Experts';
        const speakerMainDivEle = document.getElementById('speakerMainDiv')
        industrySpeakerList = fetchLinkedItemByType('speaker')
        
        speakerHTMl = '';

        for(row of industrySpeakerList)
        {
          speakerHTMl = speakerHTMl + `<div class="card mx-1">
          <img class="card-img-top" src="${row.photo}" alt="Card image cap" width="100%">
            <div class="card-body">
              <h4 class="card-title">${row.name}</h4>
              <h6 class="card-title">${row.designation} - ${row.company}</h6>
              <p class="card-text">${row.bio}</p>
            </div>
           </div><br/>`
        } 
        const speakerEle = createElement('div','row','innerHTML',speakerHTMl)
        speakerMainDivEle.appendChild(speakerEle)
      }
      else{
        //venue
        venueEle = document.getElementById('venueMainDiv')
        const venueName = item.elements.venue.linkedItems[0].elements.name.value;
        const venueNameEle = createElement('h3','row pb-5','innerHTML',venueName)
        venueEle.appendChild(venueNameEle)

        const venue_hero_image = item.elements.venue.linkedItems[0].elements.venue_hero_image.value[0].url;
        const heroImg = createElement('img','row pb-5','src',venue_hero_image)
        venueEle.appendChild(heroImg)

        const drivingDirection = item.elements.venue.linkedItems[0].elements.driving_directions.value;
        const drivingEle = createElement('div','row pb-5','innerHTML',drivingDirection)
        const drivingTitle = createElement('h3','row','innerHTML','Driving Direction')
        venueEle.appendChild(drivingTitle)
        venueEle.appendChild(drivingEle)

        const maps = item.elements.venue.linkedItems[0].elements.maps.value[0].url;
        const mapsEle = createElement('img','row  pb-5','src',maps)
        const maptitle = createElement('h3','row','innerHTML','Maps')
        venueEle.appendChild(maptitle)
        venueEle.appendChild(mapsEle)

        const publicTransport = item.elements.venue.linkedItems[0].elements.public_transportation.value;
        const publicTEle = createElement('div','row','innerHTML',publicTransport)
        const parkingInfo = createElement('h3','row','innerHTML','Parking Information')
        venueEle.appendChild(parkingInfo)
        venueEle.appendChild(publicTEle)
      }
      const regEmail = response.data.linkedItems.contact___registration___general_questions.elements.email.value;
      const regPhone = response.data.linkedItems.contact___registration___general_questions.elements.phone_number.value;
      const registrationInfoElement = document.getElementById('registrationEmail')
      registrationInfoElement.innerText = regEmail
      const registrationPhoneElement = document.getElementById('registrationPhone')
      registrationPhoneElement.innerText = phoneFormat(regPhone)

      const sponsorEmail = response.data.linkedItems.sponsorship_information.elements.email.value;
      const sponsorPhone = response.data.linkedItems.sponsorship_information.elements.phone_number.value;
      const sponsorInfoElement = document.getElementById('sponsorEmail')
      sponsorInfoElement.innerText = sponsorEmail
      const sponsorPhoneElement = document.getElementById('sponsorPhone')
      sponsorPhoneElement.innerText = phoneFormat(sponsorPhone)

      const fb = response.data.linkedItems.facebook.elements.url.value;
      const facebookLinkElement = document.getElementById('facebookLink');
      facebookLinkElement.setAttribute("href",fb);

      const tw = response.data.linkedItems.twitter_dallas.elements.url.value;
      const twitterElement = document.getElementById('twitterLink');
      twitterElement.setAttribute("href",tw);
    });
  });  