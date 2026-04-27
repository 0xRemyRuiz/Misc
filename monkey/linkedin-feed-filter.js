// ==UserScript==
// @name        linkedin feed filter
// @namespace   Violentmonkey Scripts
// @grant       none
// @match       https://www.linkedin.com/*
// @version     0.1.2
// @author      0xRemyRuiz
// @description 9/5/2025, 4:01:31 PM
// ==/UserScript==

// This is a supplement filter that's in beta test
// It helps you can your feed clean without unfollowing people
// It also helps filter by regex although it is not recommended as it's heavy processing
// The script is very "hacky" and unoptimised, use with caution (and a good computer)!

let modal_base_id = 'linkedin-feed-filter';
let lff_analyzed_class = modal_base_id+'-analyzed';
let lff_started = false;
window._DEBUG_ = true;

let dialog_closed = false;

(() => {
  'use strict';

  setInterval(() => {
    let $root = document.getElementById('root');
    if ($root && !dialog_closed) {
      let dialog = document.querySelector('#root > dialog');
      if (dialog) {
        let section = dialog.querySelector('section');
        if (section) {
          if (section.innerHTML.includes('Premium')) {
            $root.querySelector('dialog > button').click();
            dialog_closed = true;
          }
        }
      }
    }
    if (!lff_started) {
      lff_started = true;
      //let feed = document.querySelectorAll('[id^="ember"][class^="feed-shared-update"]'); //v1
      //let feed = document.querySelectorAll('[data-view-name="feed-full-update"]'); //V2
      let feed = document.querySelectorAll('[componentkey^="container-update-list_mainFeed"] > div > div'); //v3
      if (!feed) {
        return;
      }

      feed.forEach((el) => {
        var hideIt = () => {
          el.style.display = 'none';
        }

        if (!el.classList.contains(lff_analyzed_class)) {
          //let el_header = el.querySelector('.fie-impression-container'); //v1
          let el_header = el.querySelector('div > h2 + div'); // v2 + v3
          if (el_header) {

            /** PLACE TO MODIFY TO FIT YOUR NEEDS **/
            if (el_header.innerHTML.includes('STUFF I DONT WANT') {
              hideIt();
            }
            /**^PLACE TO MODIFY TO FIT YOUR NEEDS^**/

          }
          el.classList.add(lff_analyzed_class);
        }
      })
      lff_started = false;
    }
  }, 5e2)



/**
 * Nice HTML/CSS almost only modal
 *
 * CSS PART
 */
function insertCss( code ) {
    var style = document.createElement('style');
    style.type = 'text/css';

    if (style.styleSheet) {
        // IE
        style.styleSheet.cssText = code;
    } else {
        // Other browsers
        style.innerHTML = code;
    }

    document.getElementsByTagName("head")[0].appendChild( style );
}

insertCss(`
#${modal_base_id}-container {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
}

#${modal_base_id}-config {
    font-family: Arial, Helvetica, sans-serif;
}

#${modal_base_id}-config-button {
  position: fixed;
  top: 5vh;
  left: 5vw;
  background-color: #0a66c2;
  font-weight: bold;
  color: white;
  opacity: 20%;
  padding: 12px;
  border-radius: 100%;
}
#${modal_base_id}-config-button:hover {
  opacity: 100%;
  cursor: pointer;
}

#${modal_base_id}-config input[type="checkbox"] {
	display:none;
}
#${modal_base_id}-config input[type="checkbox"]:checked ~ .modal,
#${modal_base_id}-config input[type="checkbox"]:checked ~ .modal-background {
	display: block;
}
#${modal_base_id}-config .modal-background {
	width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    position: fixed;
    top: 0;
    left: 0;
    display: none;
    z-index: 99998;
}
#${modal_base_id}-config .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    display: none;
    width: 100vw;
    max-width: 700px;
    height: 80vh;
    background-color: #fff;
    box-sizing: border-box;
    z-index: 99999;
}
#${modal_base_id}-config .modal > p {
	padding: 15px;
    margin: 0;
}
#${modal_base_id}-config .modal-header {
	background-color: #f9f9f9;
    border-bottom: 1px solid #dddddd;
    box-sizing: border-box;
    height: 50px;
}
#${modal_base_id}-config .modal-header h3 {
	margin: 0;
    box-sizing: border-box;
    padding-left: 15px;
    line-height: 50px;
    color: #4d4d4d;
    font-size: 16px;
    display: inline-block;
}
#${modal_base_id}-config .modal-header label {
	box-sizing: border-box;
    border-left: 1px solid #dddddd;
    float: right;
    line-height: 50px;
    padding: 0 15px 0 15px;
    cursor: pointer;
}
#${modal_base_id}-config .modal-header label:hover img {
	opacity: 0.6;
}
`);

/**
 * HTML PART
 *
var modal_div = document.body.appendChild(document.createElement("div"));
modal_div.setAttribute('id', modal_base_id+'-container');
modal_div.innerHTML = `
<div id="${modal_base_id}-config">
  <input type="checkbox" id="${modal_base_id}-config-modal">
  <label id="${modal_base_id}-config-button" for="${modal_base_id}-config-modal" class="example-label">LF</label>
  <label for="${modal_base_id}-config-modal" class="modal-background"></label>
  <div class="modal">
      <div class="modal-header">
          <h3>Linkedin Feed Filter Configuration Panel</h3>
          <label for="modal" onClick="document.getElementById('${modal_base_id}-config-modal').checked = false">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAdVBMVEUAAABNTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU0N3NIOAAAAJnRSTlMAAQIDBAUGBwgRFRYZGiEjQ3l7hYaqtLm8vsDFx87a4uvv8fP1+bbY9ZEAAAB8SURBVBhXXY5LFoJAAMOCIP4VBRXEv5j7H9HFDOizu2TRFljedgCQHeocWHVaAWStXnKyl2oVWI+kd1XLvFV1D7Ng3qrWKYMZ+MdEhk3gbhw59KvlH0eTnf2mgiRwvQ7NW6aqNmncukKhnvo/zzlQ2PR/HgsAJkncH6XwAcr0FUY5BVeFAAAAAElFTkSuQmCC" width="16" height="16" alt="">
          </label>
      </div>
      <p>Content for the modal</p>
  </div>
</div>
`;
/**/

})()

