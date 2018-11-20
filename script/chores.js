let chores_data = [];
let users_data = [];
let jsonData;
$(function() {
    $('#login-section').show();
 
    $('#loginButton').click(loadData); 
    $('#logoffButton').click(logOff);
});

function loadData() {

     if(localStorage['chores_data'] && localStorage['users_data']){
            chores_data = JSON.parse(localStorage.getItem('chores_data'));
            users_data = JSON.parse(localStorage.getItem('users_data'));
            dataReady();
       } else {
        $.getJSON("../data/data.json", function (json) {
            jsonData = json;
            chores_data = jsonData.chores;
            users_data = jsonData.users;
            dataReady();
        });
       }

}
function logOff() {
    $('#chores-section').fadeOut();
    $('#login-section').fadeIn();
    $('#password').val('');
    $('#logoffButton').hide();
}
function dataReady() {
    if (authenticateUser()) {
        $('#login-section').fadeOut();
        $('#chores-section').fadeIn();
        $('#logoffButton').show();

        loadUserInfo($('#userName').val());
    } else {
        console.log("Login error");
    }
    

}
function authenticateUser() {
    
    if (users_data.filter(obj => (obj.name == $('#userName').val() &&
            obj.password == $('#password').val())).length > 0) {
            console.log("authenticated");
            return true
    };
    return false;
}


function loadUserInfo(userName) {
    // Load current user
    //const $userOptions = $('#users');

    let currentUser = users_data
        .filter(user => user.name === userName);
    
        if (currentUser.length > 0) {
            const $usersContainer = $('#users-container');
            $usersContainer.empty();
            if (currentUser[0].type === "admin") {
                $("#chores-container").show();
                // Load All Users
                users_data.forEach(function(value, index){
                    let userName = value.name;
                    $usersContainer.append(loadUsersChores(userName));
                });
                //Load Chore List
                loadAllChores();
            } else {
                $("#chores-container").hide();
                $usersContainer.append(loadUsersChores(currentUser[0].name));
            }
        } else {
            alert("Error");
        }
}

function isSelected(value) {
    if (value.name==="Emma") {
        return "selected";
    } 
    return "";
}
function loadAllChores(){
    const $chore_list = $('#chores-list');
    $chore_list.empty();
    console.log("chores_data", chores_data);
    chores_data.forEach(function(value, index){
        console.log(value.maxAssigned, value.assignedTo.length);
        if (value.maxAssigned > value.assignedTo.length) {
            $chore_list.append(`<div draggable="true" id="chore_${value.choreId}" data-chore_id="${value.choreId}" ondragstart="drag(event)" class="chore">${value.name}</div>`);
        }

    });
}

function loadUsersChores(userName) {
   
    let $chores = "";
    chores_data
       .filter(chore => chore.assignedTo.includes(userName))
       .forEach(chore => $chores += `<div class="chore-assigned" ondrop="drop(event)" ondragover="allowDrop(event)" data-user="${userName}">${chore.name}
       </div>`);
   

   let $choreInfo = 
        `<div class="user-section" id="${userName}" >
        <h3>${userName}</h3>
        <div class="assigned-chores" data-user="${userName}" ondrop="drop(event)" ondragover="allowDrop(event)" >
        ${$chores}
        </div></div>`;
   
   return $choreInfo;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();

    const userName = ev.target.dataset.user;
     
    //Get the chore id that was dragged
    const data = ev.dataTransfer.getData("text");
    const $chore_data = $(`#${data}`);
    const chore_id = $chore_data.data("chore_id");

    //Get the chore and assign to user
    const objIndex = chores_data.findIndex((obj => obj.choreId == chore_id));

    // Add chore to user if not already assigned
    if (chores_data[objIndex].assignedTo.indexOf(userName) == -1) {
        chores_data[objIndex].assignedTo.push(userName);
    }
   
    //Reload users chores
    const $newChores = loadUsersChores(userName);
    $(`#${userName}`).html($newChores);

    //Reload chore list
    loadAllChores();

    //save the changes
    saveData();
}
function saveData() {
    localStorage.setItem( 'users_data', JSON.stringify(users_data));
    localStorage.setItem( 'chores_data', JSON.stringify(chores_data));
}