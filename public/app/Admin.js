class Admin {

    constructor() {
        this.currentUser = null;
        this.currentProject = null;
        this.currentHub = null;
        this.demoMode = false;
        this.useDirectFetch = false;
        this._newProjectCallback = null;
        this._updateUICallback = null;
     
        this.adminHub = new AdminHub();

    }

    setNewProjectCallback(newprojectcallback)
    {
        this._newProjectCallback = newprojectcallback;
    }

    setUpdateUICallback(updateuicallback)
    {
        this._updateUICallback = updateuicallback;
    }

    _updateUI() {
        if (this._updateUICallback) {
            this._updateUICallback();
        }
    }

    async getConfiguration()
    {
        var res = await fetch(serveraddress + '/api/configuration');
        var data = await res.json();
        this.useDirectFetch = data.useDirectFetch;      
        this.demoMode = data.demoMode;                 
    }

    async checkLogin()
    {
        this.getConfiguration();
        var res = await fetch(serveraddress + '/api/checklogin');
        var data = await res.json();
        if (data.succeeded)
        {
            this.currentUser = data.user;
  
            $(".loggedinuser").html(data.user.email);

            if (data.hub)
            {
                $(".loggedinuser").html(data.user.email + " - Hub:" + data.hub.name);
            }
            else
            {
                $(".loggedinuser").html(data.user.email);
            }
               
            if (!data.hub) {
                this.currentProject = null;
                this.currentHub = null;
                this.adminHub.handleHubSelection();
            }
            else if (!data.project) {

                this.currentHub = data.hub;
                this.currentProject = null;
                this.handleProjectSelection();
            }
            else {
                this.currentHub = data.hub;
                this.loadProject(data.project);
            }
        }
        this._updateUI();
    }

    async handleLogout()
    {
        var res = await fetch(serveraddress + '/api/logout/', { method: 'PUT' });
        window.location.reload(true); 

    }

    async handleProjectSwitch()
    {
        await fetch(serveraddress + '/api/project/none', { method: 'PUT' });
        window.location.reload(true); 

    }

    
    handleNewProjectDialog() {
        let myModal = new bootstrap.Modal(document.getElementById('newprojectModal'));
        myModal.toggle();
    }


    handleRenameProjectDialog() {
        this.currentProject = $("#projectselect").val();
        let myModal = new bootstrap.Modal(document.getElementById('renameprojectModal'));
        myModal.toggle();
    }


    async renameProject() {
        var res = await fetch(serveraddress + '/api/renameproject/' + this.currentProject + "/" +  $("#renamedProjectName").val(), { method: 'PUT' });
        this.handleProjectSelection();
    }

    async newProject() {
        var res = await fetch(serveraddress + '/api/newproject/' + $("#newProjectName").val(), { method: 'PUT' });
        var data = await res.json();
        this.loadProject(data.projectid);
    }


    async deleteProject() {
         $('#chooseprojectModal').modal('hide');

        var res = await fetch(serveraddress + '/api/deleteproject/' + $("#projectselect").val(), { method: 'PUT' });
        this.handleProjectSelection();
    }

    async loadProject(projectid) {
       
        var res = await fetch(serveraddress + '/api/project/' + projectid, { method: 'PUT' });
        $(".projectname").empty();
        var data = await res.json();
        $(".projectname").append(data.projectname);  

        this.currentProject = data.projectname;              
        this._updateUI();
        $(".modal-backdrop").remove();
        CsManagerClient.msready();

    }

    async loadProjectFromDialog() {
        await this.loadProject($("#projectselect").val());
    }

    async handleProjectSelection() {
      
        let myModal = new bootstrap.Modal(document.getElementById('chooseprojectModal'));
        myModal.toggle();
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
        let myModal = new bootstrap.Modal(document.getElementById('registerusermodal'));
        myModal.toggle();

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
      
        let myModal = new bootstrap.Modal(document.getElementById('loginusermodal'));
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


                if (!response.succeeded) {

                    myAdmin.handleLogin();

                }
                else {

                    _this.currentUser = response.user;
                    $(".loggedinuser").empty();
                    $(".loggedinuser").append(response.user.email);
                    _this.adminHub.handleHubSelection();
                    _this._updateUI();
                }


            },
        });
    }

}

