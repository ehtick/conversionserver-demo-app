class Admin {

    constructor() {
        this.activeUser = null;
        this.currentProject = null;

    }


    async getConfiguration()
    {
        var res = await fetch(serveraddress + '/api/configuration');
        var data = await res.json();
        useDirectFetch = data.useDirectFetch;              
    }

    async checkLogin()
    {
        var res = await fetch(serveraddress + '/api/checklogin');
        var data = await res.json();
        if (data.succeeded)
        {
            this.activeUser = data.user;
            $(".loggedinuser").empty();
            $(".loggedinuser").append(data.user.email);

            this.handleProjectSelection();
//            CsManagerClient.msready();
        }
        updateMenu();
    }

    async handleLogout()
    {
        var res = await fetch(serveraddress + '/api/logout/', { method: 'PUT' });
        window.location.reload(true); 

    }

    async handleProjectSwitch()
    {
        window.location.reload(true); 

    }


    handleNewProjectDialog() {
        var myModal = new bootstrap.Modal(document.getElementById('newprojectModal'));
        myModal.show();
    }


    handleRenameProjectDialog() {
        this.currentProject = $("#projectselect").val();
        var myModal = new bootstrap.Modal(document.getElementById('renameprojectModal'));
        myModal.show();
    }


    async renameProject() {
        var res = await fetch(serveraddress + '/api/renameproject/' + this.currentProject + "/" +  $("#renamedProjectName").val(), { method: 'PUT' });
        this.handleProjectSelection();
    }


    async newProject() {
        var res = await fetch(serveraddress + '/api/newproject/' + $("#newProjectName").val(), { method: 'PUT' });
        this.handleProjectSelection();
    }


    async deleteProject() {
         $('#chooseprojectModal').modal('hide');

        var res = await fetch(serveraddress + '/api/deleteproject/' + $("#projectselect").val(), { method: 'PUT' });
        this.handleProjectSelection();
    }


    async loadProject() {
        this.currentProject = $("#projectselect").val();
        var res = await fetch(serveraddress + '/api/project/' + $("#projectselect").val(), { method: 'PUT' });
        $(".projectname").empty();
        var data = await res.json();
        $(".projectname").append(data.projectname);  

        this.currentProject = data.projectname;              
        updateMenu();
        CsManagerClient.msready();

    }



    async handleProjectSelection() {
        var myModal = new bootstrap.Modal(document.getElementById('chooseprojectModal'));
        myModal.show();
        var response = await fetch(serveraddress + '/api/projects');
        var models = await response.json();

        $("#projectselect").empty();
        var html = "";
        for (var i = 0; i < models.length; i++) {
            let cm = models[i];
            html += '<option value="' + cm.id + '">' + cm.name + '</option>';
        }
        $("#projectselect").append(html);

    }


    handleRegistration()
    {
        var myModal = new bootstrap.Modal(document.getElementById('registerusermodal'));
        myModal.show();

    }

    _submitRegistration() {

        var fd = new FormData();
        fd.append('firstName', $("#register_firstname").val());
        fd.append('lastName', $("#register_lastname").val());
        fd.append('email', $("#register_email").val());
        fd.append('password', $("#register_password").val());

        $.ajax({
            url: serveraddress + "/api/register",
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function (response) {
                if (!response.succeeded)
                    myAdmin.handleRegistration();
                else
                    CsManagerClient.msready();
            },
        });
    }


    handleLogin()
    {
        var myModal = new bootstrap.Modal(document.getElementById('loginusermodal'));
        myModal.show();

        var input = document.getElementById("login_password");
        input.addEventListener("keyup", function(event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
              // Cancel the default action, if needed
              event.preventDefault();
              // Trigger the button element with a click
              document.getElementById("loginbutton").click();
            }
          });

    }

    _submitLogin() {

        var fd = new FormData();
        fd.append('email', $("#login_email").val());
        fd.append('password', $("#login_password").val());

        var _this = this;
        $.ajax({
            url: serveraddress + "/api/login",
            type: 'post',
            data: fd,
            contentType: false,
            processData: false,
            success: function (response) {
                if (!response.succeeded)
                    myAdmin.handleLogin();
                else
                {
                    _this.activeUser = response.user;
                    $(".loggedinuser").empty();
                    $(".loggedinuser").append(response.user.email);        
                    _this.handleProjectSelection();
                    updateMenu();
//                    CsManagerClient.msready();
                }
            },
        });
    }



}

