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


    $(window).resize(function () {
      resizeCanvas();
    });

    $(".webviewer-canvas").css("outline", "none");

  }, 10);
}

async function setupApp() {

  myAdmin = new Admin();
  await myAdmin.checkLogin();

  mainUI = new MainUI();
  mainUI.registerSideBars("sidebar_models", 450);

  myAdmin.setUpdateUICallback(mainUI.updateMenu);


  let viewer;
  if (!myAdmin.useStreaming) {
    viewer = await Sample.createViewer();
  }
  else {

    let res = await fetch(serveraddress + '/api/streamingSession');
    var data = await res.json();

    viewer = new Communicator.WebViewer({
      containerId: "content",
      endpointUri: 'ws://localhost:80?token=' + data.sessionid,
      model: "_empty",
      rendererType: "csr"
    });
  }

  hwv = viewer;
  var screenConfiguration =
    md.mobile() !== null
      ? Communicator.ScreenConfiguration.Mobile
      : Sample.screenConfiguration;
  var uiConfig = {
    containerId: "viewerContainer",
    screenConfiguration: screenConfiguration,
    showModelBrowser: true,
    showToolbar: true,
  };

  ui = new Communicator.Ui.Desktop.DesktopUi(hwv, uiConfig);


  hwv.setCallbacks({
    modelStructureReady: msready,
  });

  hwv.start();

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


}

function resizeCanvas() {

  let offset = $("#content").offset();
  let width = $(window).width() - offset.left;
  let height = $(window).height() - offset.top;
  $("#content").css("width", width + "px");
  $("#content").css("height", (height) + "px");
  hwv.resizeCanvas();
  $("#toolBar").css("left", (width / 2 - 250) + "px");
  $("#toolBar").css("top", (height - 50) + "px");

}