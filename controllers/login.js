const Users = require('../models/Users');
const Projects = require('../models/Projects');
const Hubs = require('../models/Hubs');
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
        res.json({succeeded:true, user:req.session.user.email});
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
            res.json({succeeded:true, user:{email:req.session.user.email}});
        }
        else
            res.json({succeeded:false});
    }
};


exports.configuration = async(req, res, next) => {    
    console.log("configuration");    
    res.json({useDirectFetch : config.get('app.useDirectFetch'),demoMode: config.get('app.demoMode')});    
};



exports.checkLogin = async(req, res, next) => {    
    console.log("check login");
    if (config.get('app.demoMode')) {
        let item = await Users.findOne({ "email":  "guido@techsoft3d.com" });
        if (item)
        {
            var project = await Projects.findOne({ "user": item.id, "name": "Demo Project" });
            if (project)
            {
                req.session.user = {email:req.session.user.email};
                req.session.project = project;
            }
        }
    }

    if (req.session && req.session.user) {
        console.log(req.session.project);
        let projectid = null;
        let hubinfo = null;
        
        if (req.session.project)
        {
            projectid = req.session.project._id;
        }
        if (req.session.hub)
        {
            hubinfo = {id:req.session.hub._id,name:req.session.hub.name};
        }
        res.json({succeeded:true, user:{email:req.session.user.email}, project:projectid, hub:hubinfo});
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
        users: [{user:req.session.user.email, role:"Owner"}],
        hub: req.session.hub   
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

 //   let projects = await Projects.find({ "users.email": req.session.user.email,"hub": req.session.hub } );
    let projects = await Projects.find({ "hub": req.session.hub } );
  
    let a = [];
    for (let i = 0; i < projects.length; i++) {
        a.push({ id: projects[i].id.toString(), name: projects[i].name});
    }
    res.json(a);    
};


exports.getHubs = async(req, res, next) => {    

    let hubs = await Hubs.find({ "users.email": req.session.user.email});

    let a = [];
    for (let i = 0; i < hubs.length; i++) {
        a.push({ id: hubs[i].id.toString(), name: hubs[i].name});
    }
    res.json(a);    
};


exports.getUsers = async(req, res, next) => {    

    let users = await Users.find();

    let a = [];
    for (let i = 0; i < users.length; i++) {
        a.push(users[i].email);
    }
    res.json(a);    
};


exports.getHubUsers = async(req, res, next) => {    


    var item = await Hubs.findOne({ "_id": req.params.hubid });
    let hubusers = item.users;
    let a = [];
    for (let i = 0; i < hubusers.length; i++) {
        a.push({ email: hubusers[i].email, role: hubusers[i].role, accepted: hubusers[i].accepted});
    }
    res.json(a);    
};


exports.addHubUser = async(req, res, next) => {    


    var item = await Hubs.findOne({ "_id": req.params.hubid });
    let hubusers = item.users;
    let a = [];
    let alreadyAdded = false;
    for (let i = 0; i < hubusers.length; i++) {
        if (hubusers[i].email == req.params.userid)
        {
            alreadyAdded = true;
            break;
        }
    }
    if (!alreadyAdded) {
        let user = await Users.findOne({ "email":  req.params.userid });
        if (user)
        {
            hubusers.push({email:user.email, role:req.params.role, accepted:false});
        }
        else
        {
            let user = await Users.create({
                firstName: "empty",
                lastName: "empty",
                email: req.params.userid,
                password: "empty",
                status: "NotJoined",        
            });

            hubusers.push({email:req.params.userid, role:req.params.role, accepted:false});
        }
    }

    await item.save();
    
    res.sendStatus(200); 
};


exports.deleteHubUser = async (req, res, next) => {

    var item = await Hubs.findOne({ "_id": req.params.hubid });
    let hubusers = item.users;
  
    for (let i = 0; i < hubusers.length; i++) {
        if (hubusers[i].email == req.params.userid) {
            hubusers.splice(i, 1);
            break;
        }
    }
    await item.save();

    res.sendStatus(200);
};




exports.acceptHub = async (req, res, next) => {

    var item = await Hubs.findOne({ "_id": req.params.hubid });
    let hubusers = item.users;
   
    for (let i = 0; i < hubusers.length; i++) {
        if (hubusers[i].email == req.params.userid) {
            hubusers[i].accepted = true;
            break;           
        }
    }
    await item.save();

    res.sendStatus(200);
};



exports.putNewHub = async(req, res, next) => {    
    console.log("new hub");
    const hub = new Hubs({
        name: req.params.hubname,
        users: [{email:req.session.user.email, role:"Owner", accepted:true}],
    });

    await hub.save();
    
    res.json({hubid:hub.id});
};


exports.putHub = async(req, res, next) => {    

    if (req.params.hubid != "none") {
        var item = await Hubs.findOne({ "_id": req.params.hubid });
        req.session.hub = item;
        res.json({id: req.params.hubid,name:item.name});
    }
    else {
        req.session.hub = null;
        res.sendStatus(200);
    }
};
