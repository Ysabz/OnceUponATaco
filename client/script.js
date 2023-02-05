import bot from './assets/bot.svg';
import user from './assets/user.svg';


const form = document.querySelector('form');
const formPhone = document.getElementById('formPhon');

const chatContainer = document.querySelector('#chat_container');
let loadInterval;
let isLoaded = true;



// handle message submission
const handleSubmit = async (e) => {
  isLoaded = false;
  e.preventDefault();

  const formData = new FormData(form);
  var message = formData.get('prompt').trim()
  if (message != '') {

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, message);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    form.reset();
    if (message.toLowerCase() != 'end') {


      // fetch data from server -> bot's response 
      // const response = await fetch('https://aichatbottest.onrender.com', {
      const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: formData.get('prompt'),
          type: 'correction'
        })
      })

      clearInterval(loadInterval);


      if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim();
        // check there was no grammar mistakes skip this step
        if (parsedData.localeCompare(formData.get('prompt').trim()) != 0) {

          // text correction chatstripe
          const uniqueIdCorrector = generateUniqueId();
          chatContainer.innerHTML += correctionChatStripe(" ", uniqueIdCorrector);
          chatContainer.scrollTop = chatContainer.scrollHeight;


          const messageDiv = document.getElementById(uniqueIdCorrector);

          messageDiv.innerHTML = '';
          typeText(messageDiv, "Correction:" + parsedData, formData, function () { handleCompletion(formData) });
        }
        else {
          handleCompletion(formData);
        }

      } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong";

        alert(err);
      }
    } else {
      $('#endingModal').modal('show');
    }
  }
}

// handle text completion
const handleCompletion = async (formData) => {

  //bot's chatstripe
  const uniqueId = generateUniqueId();

  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response 

  // const response = await fetch('https://aichatbottest.onrender.com', {
  const response = await fetch('https://once-upon-a-taco.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: formData.get('prompt'),
      type: 'completion'
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }

}


// show text is loading
function loader(element) {
  element.textContent = '';

  //every 300 milliseconds add . to text conte
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}


// type the text in message
function typeText(element, text, data, callback) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else {
      isLoaded = true;
      clearInterval(interval);
      if (callback) {
        isLoaded = false;
        callback(data);
      }
    }
  }, 20)
}


// generate unique id
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`
}


function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class = "wrapper ${isAi && 'ai'}">
    <div class= "chat">
    <div class= "profile">
    <img
      src = "${isAi ? bot : user}"
      alt= "${isAi ? 'bot' : 'user'}"
    />
    </div>
    <div class="message" id = ${uniqueId}> ${value}</div>
    </div>
    </div>
    `
  )
}


function correctionChatStripe(value, uniqueId) {
  return (
    `
    <div class = "wrapper correction">
    <div class= "chat">
    <div class= "profile">
    <img
      src = "${bot}"
      alt= "${'bot'}"
    />
    </div>
    <div class="message" id = ${uniqueId}> ${value}</div>
    </div>
    </div>
    `
  )
}


// on click event for selecting word on a single click
$('#chat_container').on("click", async function (event) {
  event.preventDefault();
  $("span.popup-tag").css("display", "none");
  if (isLoaded) {
    const s = window.getSelection();
    var range = s.getRangeAt(0);
    var node = s.anchorNode;

    // decrease start offset until a white space or puntation is reached or if reached the beginning of the text 
    while (range.toString().indexOf(' ') != 0 && range.startOffset > 0 && !(!!range.toString().charAt(0).match(/^[.,:!?"]/))) {
      range.setStart(node, range.startOffset - 1);
    }

    if (range.toString().indexOf(' ') == 0 || !!range.toString().charAt(0).match(/^[.,:!?"]/)) {
      range.setStart(node, range.startOffset + 1);
    }

    while (
      range.toString().indexOf(' ') == -1 &&
      range.toString().trim() != '' &&
      range.endOffset + 1 < s.baseNode.wholeText.length
      &&
      !(!!range.toString().charAt(range.toString().length - 1).match(/^[.,:!?"]/))
    ) {
      range.setEnd(node, range.endOffset + 1);
    }


    if (!!range.toString().charAt(range.toString().length - 1).match(/^[.,:!?"]/)) {
      range.setEnd(node, range.endOffset - 1);
    }

    // remove extra space
    range.setEnd(node, range.endOffset);
    var str = range.toString().trim();
    // remove last selection if is not letter or number
    const lastChar = range.toString().charAt(range.toString().length - 1);
    if (!/^[a-zA-Z0-9]*$/.test(lastChar)) {
      range.setEnd(node, range.endOffset - 1);
    }
    if (/^[a-zA-Z]*$/.test(range.toString())) {
      str = range.toString().trim();
      if (str != '') {
        str = await getDefinition(str);
        $("span.popup-tag").css("display", "block");
        $("span.popup-tag").css("top", event.clientY);
        $("span.popup-tag").css("left", event.clientX);
        $("span.popup-tag").text(str);
      } else {
        $("span.popup-tag").css("display", "none");
      }

    }

  }

});

function getSound() {
  return document.getElementById('checkboxsound').checked
}
async function getDefinition(word) {
  const dictionaryKey = "55e4d7e5-002a-4ac6-87a3-c65d9c3323e8"
  const response = await fetch(`https://dictionaryapi.com/api/v3/references/learners/json/${word}?key=${dictionaryKey}`);
  const data = await response.json();
  if (!data.length) { return "Not found" }
  if (!data[0].shortdef) {
    return "Not found"

  }
  var definition = data[0].shortdef[0]
  try { var audio = data[0].hwi.prs[0].sound.audio } catch { }
  if (getSound() && audio) {
    soundRender(audio, dictionaryKey)
  }
  return definition
}

function soundRender(audio, apikey) {
  let subFolder = audio.charAt(0)
  let soundSource = `https://media.merriam-webster.com/soundc11/${subFolder}/${audio}.wav?key=${apikey}`
  let aud = document.getElementById("audioplayer")
  aud.src = soundSource
  aud.controls = true
  aud.setAttribute("autoplay", '')
}
const handleSubmitPhone = async (e) => {
  isLoaded = false;
  e.preventDefault();
  const formData = new FormData(formPhone);

  const response = await fetch('http://localhost:5000/phoneMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: formData.get('UserPhoneNumber'),
      type: 'correction'
    })
  })
}

form.addEventListener('submit', handleSubmit);
formPhone.addEventListener('submit', handleSubmitPhone);

form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
})