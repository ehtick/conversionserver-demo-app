const serveraddress = "http://" + window.location.host;
var myAdmin;

function msready() {

  // $("#content").css("top", "0px");
  setTimeout(function () {

    var newheight = $("#content").height() - 40;
    $("#content").css("top", "40px");
    $("#content").css({ "height": newheight + "px" });

    var op = hwv.operatorManager.getOperator(Communicator.OperatorId.Orbit);
    op.setOrbitFallbackMode(Communicator.OrbitFallbackMode.CameraTarget);

    hwv.view.setAmbientOcclusionEnabled(true);

    myAdmin = new Admin();
    myAdmin.setUpdateUICallback(mainUI.updateMenu);

    myAdmin.checkLogin();
  

    $(window).resize(function () {
      resizeCanvas();
    });

    $(".webviewer-canvas").css("outline", "none");

  }, 10);
}

function setupApp() {

  hwv.setCallbacks({
    modelStructureReady: msready,
  });

  var viewermenu = [
    {
      name: 'Login',
      fun: async function () {
          myAdmin.handleLogin();
      }
    },
    {
      name: 'Switch Hub',
      fun: async function () {
          myAdmin.adminHub.handleHubSwitch();
      }
    },    
    {
      name: 'Switch Project',
      fun: async function () {
          myAdmin.adminProject.handleProjectSwitch();
      }
    },    
    {
      name: 'Logout',
      fun: async function () {
          myAdmin.handleLogout();
      }
    },
    {
      name: 'Register',
      fun: async function () {
          myAdmin.handleRegistration();
      }
    }
  
  ];

  $('#viewermenu1button').contextMenu("menu", viewermenu, {
    'displayAround': 'trigger',
    verAdjust: 45,
    horAdjust: -35
  });

  mainUI = new MainUI();
  mainUI.registerSideBars("sidebar_models",450);

}

function resizeCanvas()
{
 
    let offset = $("#content").offset();
    let width = $(window).width() - offset.left;
    let height = $(window).height() - offset.top;
    $("#content").css("width", width + "px");
    $("#content").css("height", (height) + "px");
    hwv.resizeCanvas();
    $("#toolBar").css("left", (width/2-250) + "px");
    $("#toolBar").css("top", (height-50) +  "px");
   
}