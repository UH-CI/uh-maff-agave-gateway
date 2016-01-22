
$( document ).ready(function() {
  //This that should happen for each page - like check user is logged in
  var sPath = window.location.pathname;
  var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);
  if(sPage != "login.html"){
     checkUserAuthed()
  }
  
}); //close jquery ready block


///////// USER LOGIN AND API TOKEN FUNCTIONS ////////////////////////////
function agaveAuth(username, password, tenant_name){
    
    //if (getAccessTokenCookie("token") == 0){
        //Fetch the Session/Tenant data from AGAVE for the user
        $.ajax
        ({
          type: "POST",
          url: "https://agave.iplantc.org:443/clients/v2/",
          dataType: 'json',
          async: true,
          headers: {
            "Authorization": "Basic " + btoa(username + ":" + password)
          },
          data: { clientName: tenant_name, description: "some description", tier:"UNLIMITED", callbackUrl: null },
          success: function (data){
            getAgaveAccessToken(data.result.consumerKey, data.result.consumerSecret, username)     
            $('#authModal').modal('hide');
          }
        });
        
    //}
    //else{
    //    alert("user already logged in!")
    //}
    return
}
function checkUserAuthed(){
  if (getAccessTokenCookie() == "")
     {//user is not logged in redirect to login page
      window.location.assign("login.html")
    }
}
function getAgaveAccessToken(consumerKey, consumerSecret, username){
    //Fetch the access token for the Session/Tenant for this user
    $.ajax({
      type: "POST",
      url: "https://agave.iplantc.org:443/token",
      dataType: 'json',
      async: false,
      headers: {
        "Authorization": "Basic " + btoa(consumerKey + ":" + consumerSecret),
        "Content-Type":"application/x-www-form-urlencoded"
      },
      data: { grant_type: "client_credentials", username: "apiuser", password:"apiuser", scope:"PRODUCTION", callbackUrl: null },
      success: function (data){
        mydata=data
        setAccessTokenCookie(data.access_token, username, 6)
        window.location.assign("index.html")
      }
    });   
}
function setAccessTokenCookie(value, username, expire_hours) {
    var d = new Date();
    d.setTime(d.getTime() + (expire_hours*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = "token=" + value + "; " + expires;
    document.cookie = "username=" + username + "; " + expires;
}

function getAccessTokenCookie(){
    var name ="token=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function getUsernameCookie(){
    var name ="username=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

//////////////// FILE API RELATED FUNCTIONS /////////////////////////////

//Fetch the files on a system
//system_id ="sftp.lustre.storage.uhhpc1.its.hawaii.edu"
//file_path = "/lus/scratch/seanbc"

function getStorageDirectoryListing(system_id, file_path){
    
    $.ajax({
      type: "GET",
      url: "https://agave.iplantc.org:443/files/v2/listings/system/"+system_id+"/"+file_path,
      dataType: 'json',
      async: false,
      headers: {
        "Authorization": "Bearer " + getAccessTokenCookie(),
        "Content-Type":"application/x-www-form-urlencoded"
      },
      data: {},
      success: function (data){
        mydata= data
      }
    }); 
}

function populateDirectoryTable(dir_data, dir_table,system){
    dir_table.clear();
    for (var i = 0; i < mydata.result.length; i++) {
        var actions = '<span class="fa fa-file"></span>'
        if (mydata.result[i].type == "dir"){
            actions = '<span class="fa fa-folder btn btn-primary" onclick="goToStorageFolder(\''+mydata.result[i].path+'\', table, system_id)"></span>'
        }
        dir_table.row.add([mydata.result[i].name, mydata.result[i].type, mydata.result[i].length, mydata.result[i].lastModified, mydata.result[i].path, actions])
    }
    dir_table.draw();
}

function goToStorageFolder(dir_path, dir_table,system){
    //$('#fileModal').modal('show');
    getStorageDirectoryListing(system, dir_path)
    populateDirectoryTable(mydata, table)
    $('#file_path').val(dir_path)
}

///////////////// JOB LIST API FUNCTIONS ///////////////////////////////

function getJobListing(system_id){
    $.ajax({
      type: "GET",
      url: "https://agave.iplantc.org:443/jobs/v2/",
      dataType: 'json',
      async: false,
      data:{execution_system: system_id},
      headers: {
        "Authorization": "Bearer " + getAccessTokenCookie(),
        "Content-Type":"application/x-www-form-urlencoded"
      },
      data: {},
      success: function (data){
        mydata= data
      }
    }); 
}

function populateJobTable(job_data, job_table, system){
    job_table.clear();
    for (var i = 0; i < mydata.result.length; i++) {
        job_table.row.add([mydata.result[i].appId, mydata.result[i].name, mydata.result[i].status, mydata.result[i].created, mydata.result[i].startTime, mydata.result[i].endTime])
    }
    job_table.draw();
}

