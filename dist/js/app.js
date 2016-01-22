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

$( document ).ready(function() {
        $('#login_form').submit(function function_name (event) {
            event.preventDefault();
            $('#authModal').modal('show');
            agaveAuth($('#username').val(), $('#password').val(),"test-app")
            
        })  
}); //close jquery ready block