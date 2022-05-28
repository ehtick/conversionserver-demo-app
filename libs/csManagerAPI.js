const CsFiles = require('../models/csFiles');

let _updatedTime = new Date();

let csserver;

exports.init = (server) =>
{
    csserver = server;
    _checkPendingConversions();      
};

exports.getUploadToken = async (name,size, project) => {
    let json = await csserver.requestUploadToken(name, "http://localhost:3000/api/webhook");
    const item = new CsFiles({
        name: name,
        converted: false,
        storageID: json.itemid,
        filesize: size,
        uploaded: new Date(),
        project:project
    });
    await item.save();

    _updated();
    _checkPendingConversions();      
    
    return json;
};

exports.getDownloadToken = async (itemid,type, project) => {
    let item = await CsFiles.findOne({ "_id": itemid });
    let json = await csserver.requestDownloadToken(item.itemid, type);
     
    return json;
};

exports.processFromToken = async (itemid) => {
    let item = await CsFiles.findOne({ "storageID": itemid });

    res = csserver.reconvert(item.storageID);
};

exports.getModels = async (project) => {
    let models = await CsFiles.find({project:project});
    let res = [];
    for (let i = 0; i < models.length; i++) {
        res.push({ name: models[i].name, id: models[i]._id.toString(), pending: !models[i].converted, category:models[i].category,uploaded:models[i].uploaded, filesize:models[i].filesize});
    }
    return {"updated":_updatedTime.toString(), "modelarray":res};
};

exports.getSCS = async (itemid) => {
    let item = await CsFiles.findOne({ "_id": itemid });
    let res =  await csserver.getSCS(item.storageID);
    return res;
};


exports.deleteModel = async (itemid) => {
    let item = await CsFiles.findOne({ "_id": itemid });
    await csserver.delete(item.storageID);
    await CsFiles.deleteOne({ "_id": itemid });
    _updated();
};

exports.getPNG = async (itemid) => {
    let item = await CsFiles.findOne({ "_id": itemid });
    let res =  await csserver.getPNG(item.storageID);
    return res;
};

exports.updateConversionStatus =  () => {
    _checkPendingConversions();
};

async function _checkPendingConversions() {
    let notConverted = await CsFiles.find({ "converted": false });

    for (let i = 0; i < notConverted.length; i++) {
        if (notConverted[i].storageID != "NONE") {
            const data = await csserver.getData(notConverted[i].storageID);
            if (data != undefined && data != "NOTFOUND") {
                console.log(data);
                if (data.conversionState == "SUCCESS") {
                    notConverted[i].converted = true;
                    notConverted[i].save();
                    _updated();
                }
                else if (data.conversionState.indexOf("ERROR") != -1) {
                    console.log(notConverted[i]._id);
                    CsFiles.deleteOne({ _id: notConverted[i]._id }, function (err) {
                    });
                    _updated();
                }
            }
        }
    }
}


function _updated()
{
    _updatedTime = new Date();
}
