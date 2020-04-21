import * as azdo from 'azure-devops-node-api'

const collectionURL = process.env.COLLECTIONURL 
// Get an AzDO PAT    
const token = process.env.TOKEN

let authHandler = azdo.getPersonalAccessTokenHandler(token)
let connection = new azdo.WebApi(collectionURL, authHandler)

async function testQueueBuild() {
    console.log('Queueing build...');
    const azdoBuild = await connection.getBuildApi();
    const buildDefinition = await azdoBuild.getDefinition('lucas-demo', 9);
    console.log(JSON.stringify(buildDefinition));
    const build = {
        definition: buildDefinition
    }
    let result = await azdoBuild.queueBuild(build, "lucas-demo");
    console.log(result);    
};

testQueueBuild();