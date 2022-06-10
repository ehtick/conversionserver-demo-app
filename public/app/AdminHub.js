class AdminHub {

    constructor() {
   
        this._userhash = [];
        this._hubusertable = null;
       

    }
    async handleHubSwitch()
    {
        await fetch(serveraddress + '/api/hub/none', { method: 'PUT' });
        window.location.reload(true); 

    }


    async loadHubFromDialog() {
        await this.loadHub($("#hubselect").val());
    }

    async handleHubSelection() {
      
        let myModal = new bootstrap.Modal(document.getElementById('choosehubModal'));
        myModal.toggle();
        var response = await fetch(serveraddress + '/api/hubs');
        var models = await response.json();

        $("#hubselect").empty();
        var html = "";
        for (var i = 0; i < models.length; i++) {
            let cm = models[i];
            html += '<option value="' + cm.id + '">' + cm.name + '</option>';
        }
        $("#hubselect").append(html);

    }

    
    handleNewHubDialog() {
        let myModal = new bootstrap.Modal(document.getElementById('newhubModal'));
        myModal.toggle();
    }

    
    async newHub() {
        var res = await fetch(serveraddress + '/api/newhub/' + $("#newHubName").val(), { method: 'PUT' });
        var data = await res.json();
        this.loadHub(data.hubid);
    }

    
    async loadHub(hubid) {
       
        let res = await fetch(serveraddress + '/api/hub/' + hubid, { method: 'PUT' });
        let data = await res.json();
        myAdmin.currentHub = data;  
        
        $(".loggedinuser").html(myAdmin.currentUser.email + " - Hub:" + data.name);
           
        myAdmin._updateUI();
        myAdmin.handleProjectSelection();
  

    }

    addUserToHub()
    {
        let prop = {id:this._hubusertable.getData().length, userid:"empty",email:"Select User"};

        this._hubusertable.addData([prop], false);
        this._hubusertable.redraw();
    }


    async refreshHubTable() {
        this._hubusertable.clearData();
        var response = await fetch(serveraddress + '/api/hubusers/' + this.editHub.id);
        var users = await response.json();
        for (let i = 0; i < users.length; i++) {

            let prop = { id: i, userid:users[i].id, email: this._userhash[users[i].id], role: users[i].role };

            this._hubusertable.addData([prop], false);
        }

        this._hubusertable.redraw();

    }

    async editHub() {
        let response = await fetch(serveraddress + '/api/hubusers/' + this.editHub.id);
        let users = await response.json();

        let tabdata = this._hubusertable.getData();
        for (let i = 0; i < tabdata.length; i++) {
            let userid = tabdata[i].email;
            for (let k in this._userhash) {
                if (this._userhash[k] == userid) {
                    userid = k;
                    break;
                }
            }
            if (userid != "empty") {
                let alreadyexists = false;
                for (let j = 0; j < users.length; j++) {
                    if (users[j].id == userid) {
                        alreadyexists = true;
                        break;
                    }
                }
                if (!alreadyexists) {
                   
                    let res = await fetch(serveraddress + '/api/addHubUser/' + this.editHub.id + "/" + userid + "/" + tabdata[i].role, { method: 'PUT' });
                }
            }

        }
        this.handleHubSelection();
    }

    async handleEditHubDialog() {

        this.editHub = {id:$("#hubselect").val(), name:$("#hubselect option:selected").text()};

        $("#editHubName").val(this.editHub.name);
        let myModal = new bootstrap.Modal(document.getElementById('edithubModal'));
        var response = await fetch(serveraddress + '/api/users');
        var users = await response.json();

        let userlist = [];
        this._userhash = [];
        for (let i = 0; i < users.length; i++) {
            userlist.push(users[i].email);
            this._userhash[users[i].id] = users[i].email;
        }
        let _this = this;
        this._hubusertable = new Tabulator("#hubuserstab", {
            layout: "fitColumns",
            selectable: 1,
            columns: [
                {
                    title: "ID", field: "id", width: 60
                },
                {
                    title: "userid", field: "userid",visible:false,
                },
                { title: "User", field: "email", editor: "select", editorParams: { values: userlist,placeholderEmpty:"No Results Found" } },
                {
                    title: "Role", field: "role", width: 90, editor: "select", editorParams: { values: ["Admin", "User"] }
                },

            ],
        });

        this._hubusertable.on("tableBuilt", function (e, row) {
            _this.refreshHubTable();
        });

        this._hubusertable.on("cellEdited", function (cell) {
            // let data = cell.getRow().getData();
            // let i = data.animation.split(":")[0];
            // currentAnimationGroup.getAnimations()[data.id].animation = currentAnimationList[i].animation;
            // currentAnimationGroup.getAnimations()[data.id].component = currentAnimationList[i].component;

        });

        myModal.toggle();
    }

}

