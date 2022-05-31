const Users = require('../models/Users');
const Projects = require('../models/Projects');
const CsFiles = require('../models/csFiles');
const bcrypt = require('bcrypt');
const csmanager = require('../libs/csManager');
let mongoose = require('mongoose'); 
const config = require('config');

exports.postRegister = async(req, res, next) => {
    console.log("Registration");

    let item = await Users.findOne({ "email":  req.body.email });
    if (!item) 
    {
        data = req.body;
        data.password = await bcrypt.hash(data.password,10);

        let user = await Users.create(data);
        req.session.user = user;
        res.json({succeeded:true, user:req.session.user});
    }
    else 
        res.json({succeeded:false});
};

exports.postLogin = async(req, res, next) => {    
    console.log("login");

    let item = await Users.findOne({ "email":  req.body.email });
    if (!item) 
    {        
        res.json({succeeded:false});
    }
    else 
    {
        data = req.body;
        let result = await bcrypt.compare(req.body.password, item.password);
        if (result)
        {       
            req.session.user = item; 
            res.json({succeeded:true, user:req.session.user.email});
        }
        else
            res.json({succeeded:false});
    }
};


exports.configuration = async(req, res, next) => {    
    console.log("configuration");    
    res.json({useDirectFetch : config.get('app.useDirectFetch')});    
};


exports.checkLogin = async(req, res, next) => {    
    console.log("check login");
    if (req.session && req.session.user) {
        console.log(req.session.project);
        let projectid = null;
        let projectname = null;
        if (req.session.project)
        {
            projectid = req.session.project._id;
            projectname = req.session.project.name;
        }
        res.json({succeeded:true, user:req.session.user.email, project:projectid});
    }
    else
        res.json({succeeded:false});
};

exports.putLogout = async(req, res, next) => {    
    console.log("logout");
    req.session.destroy();
    res.json({succeeded:true});
};

exports.putNewProject = async(req, res, next) => {    
    console.log("new project");
    const project = new Projects({
        name: req.params.projectname,
        user: req.session.user      
    });

    await project.save();
    
    res.json({projectid:project.id});
};

exports.putDeleteProject = async(req, res, next) => {    
    let models = await CsFiles.find({project:req.params.projectid});
    for (let i = 0; i < models.length; i++) {
        await csmanager.deleteModel(models[i]._id.toString());
        
    }

    const projectid = req.params.projectid;
 //   let oid = mongoose.Types.ObjectId(projectid);
     await Projects.deleteOne({ _id: projectid });

    res.sendStatus(200);


   
};

exports.putRenameProject = async(req, res, next) => {    

    let item = await Projects.findOne({ "_id": req.params.projectid });
    item.name = req.params.newname;
    item.save();
    res.sendStatus(200);

};

exports.putProject = async(req, res, next) => {    

    if (req.params.projectid != "none") {
        var item = await Projects.findOne({ "_id": req.params.projectid });
        req.session.project = item;
        res.json({projectname:item.name});
    }
    else {
        req.session.project = null;
        res.sendStatus(200);
    }
};


exports.getProjects = async(req, res, next) => {    

    let projects = await Projects.find({ "user": req.session.user});
    let a = [];
    for (let i = 0; i < projects.length; i++) {
        a.push({ id: projects[i].id.toString(), name: projects[i].name});
    }
    res.json(a);    
};
