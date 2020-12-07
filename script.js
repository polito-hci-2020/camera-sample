/*
The width and height of the captured photo. We will set the
width to the value defined here, but the height will be
calculated based on the aspect ratio of the input stream.
 */
let width = 300;    // We will scale the photo width to this
let height = 0;     // This will be computed based on the input stream

/*
|streaming| indicates whether or not we're currently streaming
video from the camera. Obviously, we start at false.
 */
let streaming = false;

/*
The letious HTML elements we need to configure or control. These
will be set by the startup() function.
 */
let video = null;
let canvas = null;
let photo = null;
let startbutton = null;
let input = null;

function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');
    input = document.getElementById("input");

    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            startbutton.disabled = true;
            window.alert("Error: the browser cannot access the camera. Change the" +
                " browser permission settings and reload the page.");
        });

    video.addEventListener('canplay', function(ev){
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth/width);

            /*
             Firefox currently has a bug where the height can't be read from
             the video, so we will make assumptions if this happens.
             */
            if (isNaN(height)) {
                height = width / (4/3);
            }

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);

    startbutton.addEventListener('click', function(ev){
        takePicture();
        ev.preventDefault();
    }, false);

    clearPhoto();

    input.addEventListener("change", function(e) {
        let data = e.target;
        let reader = new FileReader();
        reader.onload = function(){
            let dataURL = reader.result;
            photo.style.setProperty("width", "300px");
            photo.style.setProperty("display", "inline");
            photo.src = dataURL;
        };
        reader.readAsDataURL(data.files[0]);
    });
}


/*
Fill the photo with an indication that none has been
captured.
 */
function clearPhoto() {
    let context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
}


/*
Capture a photo by fetching the current contents of the video
and drawing it into a canvas, then converting that to a PNG
format data URL. By drawing it on an offscreen canvas and then
drawing that to the screen, we can change its size and/or apply
other changes before drawing it.
 */
function takePicture() {
    let context = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        let data = canvas.toDataURL('image/png');
        photo.style.setProperty('display', 'inline');
        photo.setAttribute('src', data);

    } else {
        clearPhoto();
    }
}


/*
Set up our event listener to run the startup process
once loading is complete.
 */
window.addEventListener('load', startup, false);
