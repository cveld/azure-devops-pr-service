import express from 'express'
import * as vsts from 'azure-devops-node-api'
import bodyParser from 'body-parser'

const app = express()
app.use(bodyParser.json())
app.get('/', function (req, res) {
res.send('Hello World!')
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

// setx COLLECTIONURL "https://dev.azure.com/<your account>"
// $env:COLLECTIONURL = "https://dev.azure.com/<your account>"
const collectionURL = process.env.COLLECTIONURL 
// Get an AzDO PAT    
const token = process.env.TOKEN

let authHandler = vsts.getPersonalAccessTokenHandler(token)
let connection = new vsts.WebApi(collectionURL, authHandler)

app.post('/', function (req, res) {
    let  repoId = req.body.resource.repository.id
    let pullRequestId = req.body.resource.pullRequestId
    let title = req.body.resource.title

    let prStatus = {
        
            "state": "succeeded",
            "description": "Ready for review",
            "targetUrl": "https://visualstudio.microsoft.com",
            "context": {
                "name": "wip-checker",
                "genre": "continuous-integration"
            }
        
    }
    if (title.includes("WIP")) {
        prStatus.state = "pending"
        prStatus.description = "Work in progress"
    }
    
    connection.getGitApi().then( 
        vstsGit => { 
            // Issues with Microsoft documentation:
            // 1. Had to move the vstsGit promise into here;
            //    the Microsoft documentation apparently gets this object synchronously
            // 2. Typing information does not seem to be correct; had to cast prStatus to <any>.
            vstsGit.createPullRequestStatus(<any>prStatus, repoId, pullRequestId).then( result => {
                console.log(result);
            },
            error => {
                console.log(error);
            })
        }, 
        error => { 
            console.log(error);
        } 
    );
    
    res.send('Received the POST');
});


