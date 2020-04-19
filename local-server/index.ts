import express from 'express'
import * as vsts from 'azure-devops-node-api'
import bodyParser from 'body-parser'
import { GitStatusState } from 'azure-devops-node-api/interfaces/GitInterfaces'

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
    let repoId = req.body.resource.repository.id
    let pullRequestId = req.body.resource.pullRequestId
    let title = req.body.resource.title

    let prStatus = {
        
            "state": GitStatusState.Succeeded, // the js example uses the string "succeeded". In ts the value is a number from the enum: 2
            "description": "Ready for review",
            "targetUrl": "https://visualstudio.microsoft.com",
            "context": {
                "name": "wip-checker",
                "genre": "continuous-integration"
            }
        
    }
    if (title.includes("WIP")) {
        prStatus.state = GitStatusState.Pending // the js example uses the string "pending". In ts the value is a number from the enum: 1
        prStatus.description = "Work in progress"
    }
    
    connection.getGitApi().then( 
        vstsGit => { 
            // Issue with Microsoft documentation:
            // Had to move the vstsGit promise into here;
            // the Microsoft documentation apparently gets this object synchronously            
            vstsGit.createPullRequestStatus(prStatus, repoId, pullRequestId).then( result => {
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


