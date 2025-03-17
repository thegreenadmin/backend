const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-2" }); // Change region if needed

const apiGateway = new AWS.APIGateway();

// Function to create API Gateway
async function createApiGateway() {
  try {
    // Create a new REST API
    const api = await apiGateway
      .createRestApi({ name: "API-Gateway" })
      .promise();
    console.log("API Gateway Created: ", api.id);

    // Get Root Resource ID
    const resources = await apiGateway
      .getResources({ restApiId: api.id })
      .promise();
    const rootId = resources.items.find((r) => r.path === "/").id;

    // Create a new resource (e.g., `/api`)
    const apiResource = await apiGateway
      .createResource({ restApiId: api.id, parentId: rootId, pathPart: "api" })
      .promise();

    // Create a method (e.g., `ANY /api/{proxy+}`)
    await apiGateway
      .putMethod({
        restApiId: api.id,
        resourceId: apiResource.id,
        httpMethod: "ANY",
        authorizationType: "NONE",
      })
      .promise();

    // Integrate with Express API (running on EC2)
    const integrationResponse = await apiGateway
      .putIntegration({
        restApiId: api.id,
        resourceId: apiResource.id,
        httpMethod: "ANY",
        type: "HTTP_PROXY",
        integrationHttpMethod: "ANY",
        uri: "http://18.224.191.88:3520/{proxy}",
      })
      .promise();

    console.log("API Gateway Integrated with Express API");

    // Deploy the API
    const deployment = await apiGateway
      .createDeployment({ restApiId: api.id, stageName: "prod" })
      .promise();
    console.log("API Gateway Deployed: ", deployment.id);

    console.log(
      `API Gateway is accessible at: https://${api.id}.execute-api.us-east-1.amazonaws.com/prod`
    );
  } catch (error) {
    console.error("Error creating API Gateway:", error);
  }
}

createApiGateway();
