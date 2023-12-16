import {config} from "./config.js";

"use strict";


// Mapping Objs
window.propTypes_out = {
    "Single Family Residential" : 1,
    "Multi-Family (2-4 Unit)" : 2,
    "Multi-Family (5+ Unit)" : 3,
    "Townhouse" : 4,
    "Condo/Co-op" : 5,
    "Mobile/Manufactured Home" : 6,
}

window.propTypes_in = {
    1: "Single Family Residential",
    2: "Multi-Family (2-4 Unit)",
    3: "Multi-Family (5+ Unit)",
    4: "Townhouse",
    5: "Condo/Co-op",
    6: "Mobile/Manufactured Home",
}

window.stateMapping_in = {
    'MA': 'Massachusetts',
    'RI': 'Rhode Island',
    'NH': 'New Hampshire',
    'ME': 'Maine',
    'VT': 'Vermont',
    'CT': 'Connecticut',
    'NJ': 'New Jersey',
    'NY': 'New York',
    'PA': 'Pennsylvania',
    'DE': 'Delaware',
    'DC': 'District of Columbia',
    'VA': 'Virginia',
    'MD': 'Maryland',
    'WV': 'West Virginia',
    'NC': 'North Carolina',
    'SC': 'South Carolina',
    'GA': 'Georgia',
    'FL': 'Florida',
    'AL': 'Alabama',
    'TN': 'Tennessee',
    'MS': 'Mississippi',
    'KY': 'Kentucky',
    'OH': 'Ohio',
    'IN': 'Indiana',
    'MI': 'Michigan',
    'IA': 'Iowa',
    'WI': 'Wisconsin',
    'MN': 'Minnesota',
    'SD': 'South Dakota',
    'ND': 'North Dakota',
    'MT': 'Montana',
    'IL': 'Illinois',
    'MO': 'Missouri',
    'KS': 'Kansas',
    'NE': 'Nebraska',
    'LA': 'Louisiana',
    'AR': 'Arkansas',
    'OK': 'Oklahoma',
    'TX': 'Texas',
    'CO': 'Colorado',
    'WY': 'Wyoming',
    'ID': 'Idaho',
    'UT': 'Utah',
    'AZ': 'Arizona',
    'NM': 'New Mexico',
    'NV': 'Nevada',
    'CA': 'California',
    'HI': 'Hawaii',
    'OR': 'Oregon',
    'WA': 'Washington',
    'AK': 'Alaska'
}

window.stateMapping_out={
    'Massachusetts': 'MA',
    'Rhode Island': 'RI',
    'New Hampshire': 'NH',
    'Maine': 'ME',
    'Vermont': 'VT',
    'Connecticut': 'CT',
    'New Jersey': 'NJ',
    'New York': 'NY',
    'Pennsylvania': 'PA',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Virginia': 'VA',
    'Maryland': 'MD',
    'West Virginia': 'WV',
    'North Carolina': 'NC',
    'South Carolina': 'SC',
    'Georgia': 'GA',
    'Florida': 'FL',
    'Alabama': 'AL',
    'Tennessee': 'TN',
    'Mississippi': 'MS',
    'Kentucky': 'KY',
    'Ohio': 'OH',
    'Indiana': 'IN',
    'Michigan': 'MI',
    'Iowa': 'IA',
    'Wisconsin': 'WI',
    'Minnesota': 'MN',
    'South Dakota': 'SD',
    'North Dakota': 'ND',
    'Montana': 'MT',
    'Illinois': 'IL',
    'Missouri': 'MO',
    'Kansas': 'KS',
    'Nebraska': 'NE',
    'Louisiana': 'LA',
    'Arkansas': 'AR',
    'Oklahoma': 'OK',
    'Texas': 'TX',
    'Colorado': 'CO',
    'Wyoming': 'WY',
    'Idaho': 'ID',
    'Utah': 'UT',
    'Arizona': 'AZ',
    'New Mexico': 'NM',
    'Nevada': 'NV',
    'California': 'CA',
    'Hawaii': 'HI',
    'Oregon': 'OR',
    'Washington': 'WA',
    'Alaska': 'AK'
}

//Num Cards per Row
window.numCardsPerRow=3;

//Local Storage Arrays
window.arrayName = 'outputArray';


// Get Page
const  hasPageClass = (cssClass) => {
    return $("body").hasClass(cssClass);
}


// Fetch API Handling
const status = (response) => {
    if(response.status === 200){
        return Promise.resolve(response);
    }
    else{
        return Promise.reject(new Error(response.status));
    }
}

const json = (response) => {
    return response.json();
}

// Utilities

const encryptString = async (plainText) => {
    const response = await fetch(config.crypto+`/encrypt?plainText=${plainText}`, {
        method: 'GET'
    })
    .then(status)
    .then(response => response.text())
    .catch((error) => {
      console.error('Error:', error);
    });

    return response;
}

const decryptString = async (cipherText) => {
    const response = await fetch(config.crypto+`/decrypt?cipherText=${cipherText}`, {
        method: 'GET'
    })
    .then(status)
    .then(response => response.text())
    .catch((error) => {
      console.error('Error:', error);
    });

    return response;
}

const stripCommas = (string) => {
    return string.replaceAll(",","");
}

function delay(t, v) {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
 }


 const dynamicSort = (property,ascending,ignoreNull) => {

    let sortOrder = 1;

    if(!ascending){
        sortOrder=-1;
    }

    return function(a,b) {
        let result=null;
        if(ignoreNull){
           if(a[property]==null){
            return 1;
           }
           if(b[property]==null){
            return -1;
           }
        }

        result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;

        return result * sortOrder;
    }
 }

 
const hrefNewTabRedirectHandler = (event) =>{
    let link = $(event.currentTarget).attr('href');

    window.open(link,'_blank').focus();

    $(event.currentTarget).one('click',hrefNewTabRedirectHandler);
}


//Session Storage Utilities



 function getStorage(name){
    return JSON.parse(sessionStorage.getItem(name));
 }


 function putStorage(name,obj) {
    sessionStorage.setItem(name, JSON.stringify(obj));
 }

 function appendToStoredArray(name,obj){
    
    let storedObj = getStorage(name) ?? [];

    storedObj.push(obj);

    putStorage(name,storedObj);

    return storedObj.length;
 }









// Login Event Definitions

const displayErrorMsg = (error) =>{
    const errorMsg=document.querySelector('#error-msg');
    $(errorMsg).html(error);
    if(!errorMsg.classList.contains('show')){
        errorMsg.classList.add('show');
    }

}

const loginUserRedirectHandler = (response) =>{
    if(response){
        window.location="."
    }
}

const loginUserErrorHandler = (response) => {
    if (response.error===null){
        return true
    }
    else{
        displayErrorMsg(response.error)
        return false
    }
}

const loginUser = async (post) =>{
    const [user,pass] = document.querySelectorAll('.form-control');
    const response = await fetch(config.model+"/auth/login",{
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            username:user.value,
            password:pass.value
        })
    })
    .then(status)
    .then(json)
    .then(loginUserErrorHandler)
    .then(loginUserRedirectHandler)
    .catch(function(error){
        displayErrorMsg(`We're sorry. Please try again later.`);
        console.log(error);
    })
    .finally(function(){
        $('#submit-btn').one('click',loginUser);
        //Reset the click button
    })
};

const resetErrorMsg = (event) =>{
    const errorMsg = document.querySelector('#error-msg');
    if(errorMsg.classList.contains('show')){
        errorMsg.classList.remove('show');
    }
}

const showPasswordEventHandler = (event) =>{
    const $password = $('#password');

    const $type = $password.attr('type') === 'password' ? 'text' : 'password';
    $password.attr('type',$type);

    event.target.classList.toggle('bi-eye');
    event.target.classList.toggle('bi-eye-slash');

    const $title=$(event.target).attr("title") === 'Show password' ? 'Hide password' : 'Show password';
    $(event.target).attr('title',$title);

}

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

const displayEmailValidation = (event) =>{
    const email = document.querySelector('#username').value;
    const pass = document.querySelector('#password');
    const button = document.querySelector('#submit-btn');
    let response = validateEmail(email);
    if(!response){
        if(!pass.classList.contains('disabled')){
            pass.classList.add('disabled');
        }
        if(!button.classList.contains('disabled')){
            button.classList.add('disabled');
        }
        if(event.currentTarget!=window){
            displayErrorMsg("Not a valid email.")
        }
    }
    else{
        if(pass.classList.contains('disabled')){
            pass.classList.remove('disabled');
        }
    }
}

const disableAuthSubmission = () =>{
    const email = document.querySelector('#username').value;
    const pass = document.querySelector('#password').value;
    const button = document.querySelector('#submit-btn');
    if(email==="" || pass===""){
        if(!button.classList.contains('disabled')){
            button.classList.add('disabled');
        }
    }
    else{
        if(button.classList.contains('disabled')){
            button.classList.remove('disabled');
        }
    }
}


// Login Events
if(hasPageClass("login")){
    $(window).on('load',displayEmailValidation);
    $('input').on('blur',displayEmailValidation);
    $('input').on('keyup',disableAuthSubmission);
    $('input').on('click',resetErrorMsg);
    $('input').on('click',disableAuthSubmission);
    $('#togglePassword').on('click',showPasswordEventHandler);
    $('#submit-btn').on('click',displayEmailValidation);
    $('#submit-btn').one('click',loginUser);

}


// Register Event Definitions

const registerUserRedirectHandler = (response) =>{
    if(response){
        window.location="."
    }
}

const registerUserErrorHandler = (response) => {
    if (response.error===null){
        return true
    }
    else{
        displayErrorMsg(response.error)
        return false
    }
}


const registerUser = async (post) =>{
    const [user,pass] = document.querySelectorAll('.form-control');
    const response = await fetch(config.model+"/auth/register",{
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            username:user.value,
            password:pass.value
        })
    })
    .then(status)
    .then(json)
    .then(registerUserErrorHandler)
    .then(registerUserRedirectHandler)
    .catch(function(error){
        displayErrorMsg(`We're sorry. Please try again later.`);
        console.log(error);
    })
    .finally(function(){
        $('#submit-btn').one('click',registerUser);
        //Reset the click button
    })
};


// Register Events
if(hasPageClass("register")){
    $(window).on('load',displayEmailValidation);
    $('input').on('blur',displayEmailValidation);
    $('input').on('keyup',disableAuthSubmission);
    $('input').on('click',resetErrorMsg);
    $('input').on('click',disableAuthSubmission);
    $('#togglePassword').on('click',showPasswordEventHandler);
    $('#submit-btn').on('click',displayEmailValidation);
    $('#submit-btn').one('click',registerUser);

}





//Update Event Definitions

const updateUserRedirectHandler = (response) =>{
    if(response){
        window.location="."
    }
    else{
        window.location="login.html"
    }
}

const updateUserErrorHandler = (response) => {
    if (response.error===null){
        return true
    }
    else{
        return false
    }
}


const updateUser = async (post) =>{
    const [user,pass] = document.querySelectorAll('.form-control');
    const response = await fetch(config.model+"/auth/update",{
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            username:user.value,
            password:pass.value
        })
    })
    .then(status)
    .then(json)
    .then(updateUserErrorHandler)
    .then(updateUserRedirectHandler)
    .catch(function(error){
        displayErrorMsg(`We're sorry. Please try again later.`);
        console.log(error);
    })
    .finally(function(){
        $('#submit-btn').one('click',updateUser);
        //Reset the click button
    })
};


const disableUpdateSubmission = (event) =>{
    const email = document.querySelector('#username').value;
    const pass = document.querySelector('#password').value;
    const button = document.querySelector('#submit-btn');
    if(email==="" && pass===""){
        if(!button.classList.contains('disabled')){
            button.classList.add('disabled');
        }
    }
    else{
        if(button.classList.contains('disabled')){
            button.classList.remove('disabled');
        }
    }
}

const displayUpdateEmailValidation = (event) =>{
    const email = document.querySelector('#username').value;
    const button = document.querySelector('#submit-btn');
    let response = validateEmail(email);
    if(!response && email!==""){
        if(!button.classList.contains('disabled')){
            button.classList.add('disabled');
        }
        if(event.currentTarget!=window){
            displayErrorMsg("Not a valid email.")
        }
    }
}

// Update User Events
if(hasPageClass("update")){
    $(window).on('load',disableUpdateSubmission);
    $('input').on('keyup',disableUpdateSubmission);
    $('input').on('blur',displayUpdateEmailValidation);
    $('input').on('click',disableUpdateSubmission);
    $('#togglePassword').on('click',showPasswordEventHandler);
    $('#submit-btn').one('click',updateUser);
    $('#submit-btn').on('click',displayUpdateEmailValidation);
    $('input').on('click',resetErrorMsg);
}








// Search Panel Display Button Event Definitions

const searchPanelButtonClickEventHandler = (event) =>{
    const $sp = $('#search-panel');
    const $spc = $('#search-panel-content');


    if($sp.css('display')!=='none'){
        if($sp.css('position')=='absolute'){
            $sp.fadeOut('medium');
        }
        else{
            $spc.fadeOut('fast', function(){
                $sp.animate({width:"toggle"},700)
            })
        }
    }
    else{
        if($sp.css('position')=='absolute'){
            $sp.fadeIn('medium');
        }
        else{
            $spc.hide();
            $sp.animate({width:"toggle"},700,function(){
                $spc.fadeIn('fast');
            })
        }
    }

}

//Logout
const logout = async (event) =>{
    const response = await fetch(config.model+"/auth/logout",{
        method:"GET",
        mode:"cors",
        credentials: "include",
        headers: {
            "Content-Type":"application/json"        }
    })
    .then(status)
    .then(json)
    .then(logoutRedirectHandler)
    .catch(function(error){
        console.log('Requested Failed: ', error);
    })
}

const logoutRedirectHandler = (data) => {
    window.location="."
}

//Update Login Selections Event Defitnions

const displayLoginStatus = (input) =>{
    let $loggedIn=$('#loggedIn');
    let $loggedOut=$('#loggedOut');


    if(input.error===null){
        if($loggedIn.hasClass("hidden")){
            $loggedOut.addClass('hidden');
            $loggedIn.removeClass("hidden");
        }
    }
    else{
        if($loggedOut.hasClass("hidden")){
            $loggedIn.addClass('hidden');
            $loggedOut.removeClass("hidden");
        }
    }

    return input
}


const getLoginStatus = async () =>{
    const response = await fetch(config.model+"/auth/status",{
        method:"GET",
        mode:"cors",
        credentials: "include",
        headers: {
            "Content-Type":"application/json"        }
    })
    .then(status)
    .then(json)
    .then(displayLoginStatus)
    .catch(function(error){
        console.log('Requested Failed: ', error);
    })
}


//Search Panel Event Definitions


const getSearches = async () =>{
    const response = await fetch(config.model+"/data/searches",{
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            "Content-Type":"application/json"        }
    })
    .then(status)
    .then(json)
    .then(displaySearches)
    .catch(function(error){
        console.log('Requested Failed: ', error);
    })
    .finally(function(){
        $('#refresh-btn').one('click',getSearches);
        //Reset click button
    });
}


const displaySearches = async (input) =>{
    const parent = document.querySelector("#search-items");

    if(input.error===null){

        const template=document.querySelector("#search-card-template");

        
        const encryptionPromises = input.data.map(async (search) => {
            return await encryptString(search.s_id);
        });

        const encryptedStrings = await Promise.all(encryptionPromises);

        input.data.forEach((search, index) => {

            let clone = template.content.cloneNode(true);

            clone.querySelector('.search-card').setAttribute("data-id",encryptedStrings[index]);

            let keywords = clone.querySelectorAll('.keyword');
            
            keywords[0].innerHTML=(Number(search.price_min).toLocaleString('en-US'));
            keywords[1].innerHTML=(Number(search.price_max).toLocaleString('en-US'));
            keywords[2].innerHTML=(window.propTypes_in[parseInt(search.property_type)]);
            keywords[3].innerHTML=(search.year_built_min);
            keywords[4].innerHTML=(search.year_built_max);
            keywords[5].innerHTML=((search) => {
                let string = "";
            
                if(search.city!=="" && search.city !== null){
                    string+=search.city
                    string+=", "
                }
                if(search.state!=="" && search.state !== null){
                    string+=window.stateMapping_in[search.state]
                    string+=" "
                }
                if(search.zip!=="" && search.zip !== null){
                    string+=search.zip
                }
                return string;
            })(search);
            keywords[6].innerHTML=(Number(search.bedrooms).toLocaleString('en-US'));
            keywords[7].innerHTML=(Number(search.bathrooms).toLocaleString('en-US'));
            keywords[8].innerHTML=(Number(search.sqft).toLocaleString('en-US'));

            parent.appendChild(clone);

        })

        //Event Listeners
        $('.list-group-item').on('click',searchContentUnhideForm);

        document.querySelectorAll('.price-list-item').forEach(
            function(elem){
                elem.addEventListener('click',function(e){
                    searchContentBasicInputHandler(e,document.querySelectorAll(".price"));
                })
            })
        document.querySelectorAll('.year-built-list-item').forEach(
            function(elem){
                elem.addEventListener('click',function(e){
                    searchContentBasicInputHandler(e,document.querySelectorAll(".year"));
                })
            })

        document.querySelectorAll('.prop-type-list-item').forEach(
            function(elem){
                elem.addEventListener('click',function(e){
                    searchContentSelectionHandler(e,document.querySelector("#prop-type"))
                })
            })

        document.querySelectorAll('.loc-list-item').forEach(
            function(elem){
                elem.addEventListener('click',function(e){
                    searchContentBasicInputHandler(e,
                        document.querySelectorAll("#location"))
                })
            })

        document.querySelectorAll('.dim-list-item').forEach(
            function(elem){
                elem.addEventListener('click',function(e){
                    searchContentBasicInputHandler(e,
                        document.querySelectorAll("#bd,#ba,#sqft")
                    );
                })
            })

        document.querySelectorAll('.login-card .card-img-top').forEach(
            function(elem){
                $(elem).one('click',function(e){
                    postSearch(e);
                })
            })

    }

    else{

        const template=document.querySelector("#search-card-no-login-template");

        let clone = template.content.cloneNode(true);

        parent.appendChild(clone);

        // Add event listeners for template
        $('.no-login-card').on('click',clickNoLoginCardRedirectHandler);

    }
}

const clearSearches = (event) => {
    const cards=document.querySelectorAll(".search-card");
    const parent=document.querySelector("#search-items");

    if(cards.length > 0){  
        cards.forEach((card) => {
            parent.removeChild(card);
        })
    }
}


// Search Card Event Definitions

const clickNoLoginCardRedirectHandler = (event) =>{
    window.location="login.html";
}


const postSearch = async (event) => {
    let decryptedString = await decryptString(String($(event.currentTarget).closest(".login-card").attr("data-id")))

    const id = Number(decryptedString);

    const response = await fetch(config.model+"/data/searches",{
        method: "POST",
        mode: "cors",
        credentials: "include", 
        headers: {
            "Content-Type":"application/json"        },
        body:
            JSON.stringify({
                "s_id":id
            })

    })
    .then(status)
    .then(json)
    .then(outputErrorHandler)
    .then(storeData)
    .then(outputRedirectHandler)
    .catch(function(error){
        console.log("Request Failed:", error)
    })
    .finally(function(){
        document.querySelectorAll('.login-card.card-img-top').forEach(
            function(elem){
                $(elem).one('click',function(e){
                    postSearch(e);
                })
            })
    })
}

const storeData = async (response) =>{
    if(response!==null){
        let len = appendToStoredArray(window.arrayName,response.data);
        let encryptedIdx = await encryptString(String((len-1)));
        return encryptedIdx;
    }
    return "error";
}


const outputRedirectHandler = (id) =>{
    if(id){
        window.location=`output.html?id=${id}`;
    }
}

const outputErrorHandler = (response) =>{
    if(response.error === null){
        return response;
    }
    else{
        return null;
    }
}

const searchContentUnhideForm = (event) =>{
    const elems = document.querySelectorAll(".form-group");


    fadeInTargets(null,elems);
}


const searchContentSelectionHandler = (event, target) =>{
    let keyword = event.currentTarget.querySelector('.keyword');

    let keyString = new String(keyword.innerHTML).trim();

    $(target).selectpicker('val',keyString);
    
}

const searchContentBasicInputHandler = (event, targets) =>{ // Outputs To Targets In Same Order As Parsed From Event.Target
    let keywords = event.currentTarget.querySelectorAll('.keyword');

    keywords.forEach((keyword, i)=>{
        $(targets[i]).val(keyword.innerHTML).trigger('input');
    })

}




// Form Utilities
const formatLargeIntInput = (e) => {
    let formattedTarget = e.target.value.replaceAll(",","").replace(/\D+/g, "");
    let numericTarget = new Number(formattedTarget);

    if(numericTarget > 0){
        if(numericTarget > 1000000000){
            numericTarget=1000000000;
        }
        e.target.value = numericTarget.toLocaleString('en-US');
    }
    else{
        e.target.value=formattedTarget;
    }

}


const formatYearInput = (e) => {
    let formattedTarget = e.target.value.replace(/\D+/g, "");
    let numericTarget = new Number(formattedTarget);

    let currYear = new Date().getFullYear();

    if(numericTarget > currYear){
        e.target.value = currYear;
    }
    else{
        e.target.value=formattedTarget;
    }
}

const formatSmallFloatInput = (e) => {
    let formattedTarget = e.target.value.replace(/[^0-9.]/g, "");
    let numericTarget = new Number(formattedTarget);

    if(numericTarget > 0){
        if(numericTarget > 20){
            numericTarget=20;
        }
        e.target.value = numericTarget.toLocaleString('en-US',{style:"decimal"});
        if(formattedTarget.slice(-1) === "."){
            if(formattedTarget.slice(-2)!=="."){
                e.target.value+=".";
            }

        }
    }
    else{
        e.target.value=formattedTarget.replaceAll(".","");
    }
}

const formatLargeFloatInput = (e) => {
    let formattedTarget = e.target.value.replace(/[^0-9.]/g, "");
    let numericTarget = new Number(formattedTarget);

    if(numericTarget > 0){
        if(numericTarget > 100000){
            numericTarget=100000;
        }
        e.target.value = numericTarget.toLocaleString('en-US',{style:"decimal"});
        if(formattedTarget.slice(-1) === "."){
            e.target.value+=".";
        }
    }
    else{
        e.target.value=formattedTarget.replaceAll(".","");
    }
}


const fadeInTargets = (e,targets) => {

    for(let target of targets){
        if(target.classList.contains('hidden')){
            target.classList.remove('hidden');
        }
    }


}

const checkForm = () => {
    let $priceMin = $('#price-min');
    let $priceMax = $('#price-max');

    let $ybMin = $('#year-built-min');
    let $ybMax = $('#year-built-max');

    let $propType = $('#prop-type');

    let $loc = $('#location')

    let $bds = $('#bd');
    let $bas = $('#ba');
    let $sqft = $('#sqft');

    if($priceMin.val() ==="" || $priceMax.val()==="" || $ybMin.val()==="" || $ybMax.val()===""){
        return false;
    }

    if($loc.val() ===""){
        return false;
    }

    if(Number(stripCommas($priceMin.val()))>Number(stripCommas($priceMax.val()))){
        return false;
    }

    if(Number(stripCommas($ybMin.val()))>Number(stripCommas($ybMax.val()))){
        return false;
    }

    if(!Object.values(window.propTypes_in).includes($propType.val())){
        return false;
    }

    if(isNaN(Number(stripCommas($bds.val())))){
        return false;
    }
    
    if(isNaN(Number(stripCommas($bas.val())))){
        return false;
    }
    
    if(isNaN(Number(stripCommas($sqft.val())))){
        return false;
    }


    return true;
}

const checkFormIFL = (e) => {
    const check = checkForm();
    const btn = $('#ifl-btn');

    if(check){
        if(btn.hasClass('disabled')){
            btn.removeClass('disabled');
        }

    }
    else{
        if(!btn.hasClass('disabled')){
            btn.addClass('disabled');
        }

    }
}

const checkFormSbmt = (e) =>{
    const check = checkForm();
    const btn = $('#sbmt-btn')

    let $bds = $('#bd');
    let $bas = $('#ba');
    let $sqft = $('#sqft');

    let $loc = $('#location');

    if(check && (Number(stripCommas($bds.val()))>0 || Number(stripCommas($bas.val()))>0 || Number(stripCommas($sqft.val()))>0)){
        if(btn.hasClass('disabled')){
            btn.removeClass('disabled');
        }

    }
    else{
        if(!btn.hasClass('disabled')){
            btn.addClass('disabled');
        }

    }
}


const parseLocation = (location) => {
    const loc = {
        city:null,
        state:null,
        zip:null
    };

    if(location.includes(",")){
        let [city,state] = location.split(",");
        loc.city=city.trim();
        loc.state=window.stateMapping_out[state.trim()] ?? null;
    }
    else if(isNaN(Number(location))){
        loc.state=window.stateMapping_out[location.trim()] ?? null;
    }
    else if(Number(location)>0){
        loc.zip=location.trim();
    }

    return loc;
}

const parseFormContent = () =>{
    const data = {};

    data.price={
        min: Number(stripCommas($("#price-min").val())),
        max: Number(stripCommas($("#price-max").val()))
    }

    data.property_type = window.propTypes_out[$('#prop-type').val()];

    data.location=parseLocation($('#location').val());

    data.year_built={
        min: Number(stripCommas($('#year-built-min').val())),
        max: Number(stripCommas($('#year-built-max').val()))
    }
    data.dimensions={
        bedrooms: Number(stripCommas($('#bd').val())),
        bathrooms: Number(stripCommas($('#ba').val())),
        sqft: Number(stripCommas($('#sqft').val()))
    }

    return data;

}

//Form Submission
const submitForm = async (event) =>{
    let submissionType = new Number();

    if ($(event.currentTarget).attr('id')==="ifl-btn"){
        submissionType=1;
    }
    else{
        submissionType=2;
    }

    let data = parseFormContent();

    data.submission_type=submissionType;

    const response = await fetch(config.model+"/model/post",{
        method:"POST",
        mode: "cors",
        credentials: "include",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(data)
    })
    .then(status)
    .then(json)
    .then(outputErrorHandler)
    .then(storeData)
    .catch(function(error){
        console.log('Requested Failed: ', error);
    })
    .finally(function(){
        $('#ifl-btn').one('click',submitForm);
        $('#sbmt-btn').one('click',submitForm);
    })

    Promise.all([response,delay(1500)]).then(function(data){
        showFinalSubmitButton(data[0]);
    })

}

const changeDisplayOnSubmit = (event) =>{
    const $mainForm = $('#main-form');
    const $subBg = $('#submitted-bg');
    const $formAria = $('#form-aria-wrapper');
    const $searchPanel = $('#search-panel');
    const $searchPanelBtn = $('#search-panel-btn')

    if($searchPanel.css('display')!="none"){
        $searchPanelBtn.trigger('click');
    }

    $mainForm.fadeOut('500',function(){
        $formAria.addClass('shrink');
        $subBg.fadeIn('1000');
    })

}



const showFinalSubmitButton = (id) =>{
    const $btn = $('#see-houses-btn');
    const $ldsRing = $('#lds-ring');

    $btn.attr('data-storage-id',id);

    $ldsRing.fadeOut('1000',function(){
        $btn.fadeIn('1000');
    })
}








// Form Construction
const loadLocationOptions = async () => {
    const $inputBox = $('#location');
    const locations = await fetch("static/locations.json")
    .then(json)

    $inputBox.autocomplete({
        source: function(request, response) {

            var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
            response( $.grep(locations, function( item ){
                return matcher.test( item );
            }).slice(0, 10));

        }
    });

}

const loadPropertyTypeOptions = () =>{
    const select = $('#prop-type');
    const propTypes = ['Single Family Residential', 'Mobile/Manufactured Home',
                        'Townhouse', 'Multi-Family (2-4 Unit)', 
                        'Condo/Co-op','Multi-Family (5+ Unit)'];

    
    propTypes.forEach((prop) => {
        select.append(new Option(prop, prop,false,false));
    });

    select.selectpicker('refresh');

}


//Like Button Events


const displayLikeCount = (likeCount) =>{
    let adjustedLikeCount = ((likeCount) => {return likeCount < config.maxClaps ? likeCount : config.maxClaps})(likeCount);

    const $countObj = $('#like-count');

    if(!$countObj.hasClass('hidden')){
        $countObj.addClass('hidden');
    }
    let stringCount=adjustedLikeCount.toLocaleString('en-US');
    $countObj.html(stringCount);
    $countObj.removeClass('hidden');
}


const getLikeCount = async () => {

    const response = await fetch(config.model+"/data/claps",{
        method:"GET",
        mode: "cors",
        credentials: "include",
        headers:{
            "Content-Type":"application/json"
        },
    })
    .then(status)
    .then(json)
    .then(function(data){
        displayLikeCount(data.claps)
    })
}


const incrementLikeCount = (event) =>{
    const $countObj = $("#like-count");

    let currCount = Number(stripCommas($countObj.html()));

    currCount+=1;

    displayLikeCount(currCount);
}

const likeButtonAnimationClickEventHandler = (event) =>{
    const parent = document.querySelector("#badge-top");

    const template = document.querySelector("#like-action-template");

    let clone = template.content.cloneNode(true);

    let node = parent.appendChild(clone.firstElementChild);

    setTimeout(() =>{
        $(node).fadeOut(495,function(){
            parent.removeChild(node);
        })
    }, 805);
}


const postLike = async () =>{
    const response = await fetch(config.model+"/data/claps",{
        method:"POST",
        mode: "cors",
        credentials: "include",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            claps:true
        })
    })
    .then(status)
    .then(json)
    .catch(function(data){
        console.log(data.error)
    })
}


// Index Page Events
if(hasPageClass("index")){
    $('#refresh-btn').on('click',clearSearches);

    $(document).ready(getLikeCount);
    $(document).ready(getLoginStatus);
    $('#logout').on('click',logout);

    $(document).ready(getSearches);

    $(window).on('load',loadPropertyTypeOptions);
    $(window).on('load',loadLocationOptions);

    document.querySelectorAll('.form-group').forEach(elem =>{
        $(elem).on('click input changed.bs.select',checkFormIFL);
        $(elem).on('click input changed.bs.select',checkFormSbmt);
    })

    /*ORDERING IMPORTANT*/
    $('#ifl-btn').on('click',checkFormIFL);
    $('#sbmt-btn').on('click',checkFormSbmt);

    $('#ifl-btn').one('click',changeDisplayOnSubmit);
    $('#sbmt-btn').one('click',changeDisplayOnSubmit);

    $('#ifl-btn').one('click',submitForm);
    $('#sbmt-btn').one('click',submitForm);
    /*END ORDERING*/

    $('#see-houses-btn').on('click',(event) =>{
        let id = $(event.currentTarget).attr('data-storage-id');
        outputRedirectHandler(id);
    });

    $('#prop-type').selectpicker().on("changed.bs.select",function(e){
        fadeInTargets(e,document.querySelectorAll('#year-built-group,#location-group'));
    })

    $('#location').on("input",function(e){
        fadeInTargets(e,document.querySelectorAll('#beds-group,#baths-group,#sqft-group'));
    })

    $('.price').on('input',formatLargeIntInput);
    $('.year').on('input',formatYearInput);
    $('.sm-nm').on('input',formatSmallFloatInput);
    $('.lg-nm').on('input',formatLargeFloatInput);

    $('#search-panel-btn').on('click',searchPanelButtonClickEventHandler);
    $('#exit-btn').on('click',searchPanelButtonClickEventHandler);

    /*ORDERING IMPORTANT*/
    $('#celebration-badge').on('click',incrementLikeCount);
    $('#celebration-badge').on('click',likeButtonAnimationClickEventHandler);
    $('#celebration-badge').on('click',postLike);
    /*END ORDERING*/

    $('#footer-text').on('click',hrefNewTabRedirectHandler);
}






//Output Page Event Definitions

const getCardsPerRow = () =>{
    let val = null;

    $('.form-check-input').each(function(){
        let $checkbox=$(this);
        if($checkbox.prop('checked')){
            val = $checkbox.attr("value");
            return false;
        }
    });

    return val;
}



const getSortDimension = () =>{
    let $targetBtn = null;

    $(".sort-btn").each(function(){
        let $this=$(this);
        if($this.hasClass("active")){
            $targetBtn=$this;
            return false;
        }
    })

    return $targetBtn;
}

const sortData = (data) =>{

    let $targetBtn = getSortDimension();

    let dimension = "default";
    let ascDirection = true;

    if($targetBtn!=null){
        dimension=$targetBtn.attr("value");
        ascDirection=(!$targetBtn.hasClass("desc"))
    }

    if(ascDirection){
        if(dimension=="default"){
            return data;
        }
        else{
            return data.sort(dynamicSort(dimension,true,true))
        }
    }
    else{
        if(dimension=="default"){
            return data.reverse();
        }
        else{
            return data.sort(dynamicSort(dimension,false,true));
        }
    }

}



const parseUrlParams = async () => {

    clearData();

    let url=new URL(window.location.toString())

    let urlParams = new URLSearchParams(url.search)

    let idParam = String(urlParams.get("id"));

    if(idParam==="error"){
        displayError();
        return;
    }

    let decryptedString = await decryptString(idParam);

    let arrayIdx= new Number(decryptedString);

    const data = (getStorage(window.arrayName) ?? [])[arrayIdx];

    let orderedData = sortData(data);

    let cardsPerRow=new Number(getCardsPerRow());

    displayData(orderedData,cardsPerRow);
}



const displayData = (data,cardsPerRow) =>{
    const mainContent = document.querySelector("#main-content");

    const rowTemplate=document.querySelector("#row-template");

    const cardTemplate = document.querySelector("#card-template");

    let numRows = Math.ceil(Number(data.length/cardsPerRow))
    
    let dataIdx = 0;

    for(let rowNum=0;rowNum<numRows;rowNum++){
        let rowClone = rowTemplate.content.cloneNode(true);
        let rowCloneColArray = rowClone.querySelectorAll('.cards-col');

        for(let col of rowCloneColArray){

            if(dataIdx>=data.length){
                $(col).addClass('disabled');
                continue;
            }

            if(cardsPerRow==1){
                if(col!==rowCloneColArray[1]){
                    $(col).addClass('disabled');
                    continue;
                }
            }

            let cardClone = cardTemplate.content.cloneNode(true);

            /*Update content for cardClone using data[dataIdx]*/
            let house = data[dataIdx];

            let sourceLink = cardClone.querySelector(".offer-link");

            $(sourceLink).attr("href",house.url);

            let entryItems = cardClone.querySelectorAll('.entry');

            entryItems[0].innerHTML=house.address;
            entryItems[1].innerHTML=house.city;
            entryItems[2].innerHTML=house.state;
            entryItems[3].innerHTML=house.zip;
            entryItems[4].innerHTML=new Number(house.price).toLocaleString('en-US');

            entryItems[5].innerHTML=house.bedrooms;
            entryItems[6].innerHTML=house.bathrooms;
            entryItems[7].innerHTML=new Number(house.sqft).toLocaleString('en-US'); //Bitwise Operation to convert to signed 32-bit int

            entryItems[8].innerHTML= new Number(house.year_built) | 0; //Bitwise Operation to convert to signed 32-bit int
            entryItems[9].innerHTML= new Number(house.price_per_sqft).toLocaleString('en-US');
            entryItems[10].innerHTML= new Number(house['HOA/month']).toLocaleString('en-US');

            if(house.openHouse_st+(18000*1000) > ((18000*1000)+1)){
                entryItems[11].innerHTML=(new Date(house.openHouse_st+(18000*1000)).toLocaleString()).split(",")[0].trim()
                entryItems[12].innerHTML=(new Date(house.openHouse_st+(18000*1000)).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  }));
                entryItems[13].innerHTML=(new Date(house.openHouse_et+(18000*1000)).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  }));
            }
            else{
                entryItems[11].innerHTML="N/A"
                entryItems[12].innerHTML="N/A"
                entryItems[13].innerHTML="N/A"
            }


            entryItems[14].innerHTML=new Number(house.days_on_market).toLocaleString('en-US');

            col.appendChild(cardClone)

            dataIdx++;
        }

        mainContent.appendChild(rowClone);
    }

    
    $('.offer-link').one('click',hrefNewTabRedirectHandler); 
    $('.expand-card').one('click',expandContentBtnEventHandler);
}


const displayError = () =>{
    const mainContent = document.querySelector("#main-content");

    const errorTemplate=document.querySelector("#error-template");

    let errorClone = errorTemplate.content.cloneNode(true);

    mainContent.appendChild(errorClone);
}

const clearData = () =>{
    let mainContent = $('#main-content');

    mainContent.children('.cards-row').each(function(){
        let $this = $(this);
        $this.remove();
    })
}


const expandContentBtnEventHandler = (event) =>{
    let $cardsRow = $(event.currentTarget).closest('.cards-row');

    let $localCard = $(event.currentTarget).closest('.house-card');
    let $localCardsColumn = $(event.currentTarget).closest('.cards-col');
    let $localMainColumn = $(event.currentTarget).closest('.main-card-col');
    let $localExpandedColumn = $(event.currentTarget).closest('.card-row').find('.expanded-card-col');
    let $localExpandedColumnCardBody = $localExpandedColumn.find('.card-body');

    $localCard.toggleClass('active');

    $localCardsColumn.toggleClass('expanded');

    $localCardsColumn.addClass('target');
    let $otherCardsColumns=$cardsRow.children('.cards-col').not('.target')
    $localCardsColumn.removeClass('target');

    if($localCardsColumn.hasClass('expanded')){

        $otherCardsColumns.each(function(){
            let $this=$(this);
            $this.toggleClass('span-0 op-0 p-0');
        })
        
    
        const growPromise = new Promise((resolve,reject) =>{
            $localCardsColumn.toggleClass('span-auto');
            setTimeout(() =>{
                resolve()},1100)
        })
    
        growPromise.then(() =>{
            $otherCardsColumns.each(function(){
                let $this=$(this);
                $this.toggleClass('hidden');
            })
            $localMainColumn.toggleClass('col col-auto');
            $localExpandedColumn.toggleClass('col');
            $localExpandedColumnCardBody.toggleClass('hidden');
        });
    }
    else{
        $localExpandedColumnCardBody.toggleClass('hidden');
        $localExpandedColumn.toggleClass('col');
        $localMainColumn.toggleClass('col col-auto');

        $otherCardsColumns.each(function(){
            let $this=$(this);
            $this.toggleClass('hidden');
            $this.toggleClass('span-0 op-0 p-0');
        })

        $localCardsColumn.toggleClass('span-auto');

    }

    $(event.currentTarget).one('click',expandContentBtnEventHandler);

}


const sortBtnClickEventHandler = (event) =>{
    let $currTarget = $(event.currentTarget);

    let $btnArray = $('.sort-btn');

    if($currTarget.hasClass('active')){
        $currTarget.toggleClass('asc');
        $currTarget.toggleClass('desc');
        changeSortBtnImg($currTarget);
    }
    else{
        $btnArray.each(function(){
            let $this=$(this);
            if($this.hasClass('active')){
                $this.removeClass('active');
            }
        })
        $currTarget.addClass('active');

    }
}


const changeSortBtnImg = (target) =>{
    let $currTarget = $(target);

    let $currImg = $currTarget.find('.sort-btn-img');

    if($currImg.hasClass('bi-arrow-up')){
        $currImg.removeClass('bi-arrow-up');
        $currImg.addClass('bi-arrow-down');
    }
    else if($currImg.hasClass('bi-arrow-down')){
        $currImg.removeClass('bi-arrow-down');
        $currImg.addClass('bi-arrow-up');
    }
}


//Output Page Events
if(hasPageClass("output")){
    $(document).ready(parseUrlParams)

    $('#cards-per-row-toggle').on('input',parseUrlParams);

    $(".sort-btn").each(function(){
        /*ORDERING IMPORTANT*/
        $(this).on("click",sortBtnClickEventHandler);
        $(this).on("click",parseUrlParams);
        /*END ORDERING*/
    })


    //Need to revise to attach to created templates

}