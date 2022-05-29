const path = require('path');
const express = require('express');
const apiController = require('../controllers/api');
const loginController = require('../controllers/login');
const router = express.Router();

module.exports = router;

router.post('/upload', apiController.postUpload);
router.get('/uploadToken/:name/:size', apiController.getUploadToken);
router.get('/downloadToken/:itemid/:type', apiController.getDownloadToken);
router.put('/processToken/:itemid', apiController.processFromToken);
router.get('/models', apiController.getModels);
router.get('/scs/:itemid', apiController.getSCS);
router.get('/png/:itemid', apiController.getPNG);
router.get('/step/:itemid', apiController.getSTEP);
router.put('/generateStep/:itemid', apiController.generateSTEP);

router.put('/deleteModel/:itemid', apiController.deleteModel);

router.put('/newproject/:projectname', loginController.putNewProject);
router.put('/deleteproject/:projectid', loginController.putDeleteProject);
router.put('/renameproject/:projectid/:newname', loginController.putRenameProject);
router.put('/project/:projectid', loginController.putProject);
router.get('/projects', loginController.getProjects);