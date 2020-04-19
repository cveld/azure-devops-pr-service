import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import * as vsts from 'azure-devops-node-api'
import { GitStatusState } from 'azure-devops-node-api/interfaces/GitInterfaces'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    // setx COLLECTIONURL "https://dev.azure.com/<your account>"
    // $env:COLLECTIONURL = "https://dev.azure.com/<your account>"
    const collectionURL = process.env["COLLECTIONURL"];
    context.log("COLLECTIONURL: " + process.env["COLLECTIONURL"]);
    // Get an AzDO PAT    
    const token = process.env["TOKEN"];

    let authHandler = vsts.getPersonalAccessTokenHandler(token)
    let connection = new vsts.WebApi(collectionURL, authHandler)

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
    
    context.res = { 
        // status: 200, /* Defaults to 200 */
        body: 'Received the POST'
    };


    //const name = (req.query.name || (req.body && req.body.name));
};

export default httpTrigger;