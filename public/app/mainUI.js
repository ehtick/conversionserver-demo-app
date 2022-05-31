var mainUI;

class MainUI {

    
    constructor() {

        this.sideBars = [];

    }

    registerSideBars(div,width, callback) {
        this.sideBars[div] = {width:width, expanded:false, callback:callback};
    }

    collapseAll() {
        for (var i in this.sideBars)
        {
            $("#" + i).css({ "display": "none" });  
            this.sideBars[i].expanded = false;
       
        }

    }
    
  
    toggleExpansion(div,element){
        var sidebar = this.sideBars[div];
        $(".sidenav").children().css("color", "");
        if (!sidebar.expanded)
        {
            this.collapseAll();
            $("#content").css("margin-left", ""); 
            $("#content").css({ "width": "" });
            
            $("#" + div).css({ "display": "block" });         
            $("#" + div).css({ "width": sidebar.width + "px" });         
            var newwidth = $("#content").width() - (sidebar.width + 50);

            $("#content").css("margin-left", (sidebar.width + 50) + "px"); 
            $("#content").css({ "width": newwidth + "px" });
            sidebar.expanded = true;
            $(element).css("color", "white");

        }
        else
        {
            this.collapseAll();
            $("#content").css("margin-left", ""); 
            $("#content").css({ "width": "" });
            sidebar.expanded = false;
            $(element).css("color", "");
        }
        if (sidebar.callback)
            sidebar.callback(sidebar.expanded);

        ui._toolbar.reposition();
        hwv.resizeCanvas();
    }


}

function updateMenu()
{
    if (!myAdmin.activeUser)
    {     
        $("li:contains(Logout)").css("opacity", "0.2");
        $("li:contains(Logout)").css("pointer-events", "none");

        $("li:contains(Register)").css("opacity", "1.0");
        $("li:contains(Register)").css("pointer-events", "all");


        $("li:contains(Login)").css("opacity", "1.0");
        $("li:contains(Login)").css("pointer-events", "all");
        
        $("li:contains(Switch Project)").css("opacity", "0.2");
        $("li:contains(Switch Project)").css("pointer-events", "none");


    }
    if (myAdmin.activeUser)
    {
      
        $("li:contains(Logout)").css("opacity", "1.0");
        $("li:contains(Logout)").css("pointer-events", "all");

        $("li:contains(Login)").css("opacity", "0.2");
        $("li:contains(Login)").css("pointer-events", "none");

        $("li:contains(Switch Project)").css("opacity", "1");
        $("li:contains(Switch Project)").css("pointer-events", "all");
        
        $("li:contains(Register)").css("opacity", "0.2");
        $("li:contains(Register)").css("pointer-events", "none");


    }

    if (myAdmin.currentProject) {
        $("#content").css("display", "block");
        $("body").css("background", "");
        $(".sidenav").css("pointer-events", "");
    }
    else {
        $("#content").css("display", "none");
        $("body").css("background", "grey");
        $(".sidenav").css("pointer-events", "none");

    }
}