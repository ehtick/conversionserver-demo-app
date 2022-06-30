const serveraddress = "http://" + window.location.host;
var myAdmin;


async function setupApp() {

  mainUI = new MainUI();
  mainUI.setupMenu();
  mainUI.registerSideBars("sidebar_models", 450);



  myAdmin = new Admin();
  myAdmin.setUpdateUICallback(mainUI.updateMenu);
  myAdmin.adminProject.setLoadProjectCallback(loadProjectCallback);

  await myAdmin.checkLogin();

}



function loadProjectCallback()
{
  initializeViewer();
  CsManagerClient.msready();
  
}


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


async function initializeViewer()
{
  
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
      rendererType:  Communicator.RendererType.Server
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