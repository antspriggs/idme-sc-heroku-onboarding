# ID.me SC Heroku Onboarding

This application demonstrates how to set up and deploy an ID.me integration using Heroku. Follow the steps below to configure, set up, test, and deploy the application.

## Prerequisites

### ID.me Sandbox Configuration

1. Create an `Organization`.
2. Within your `Organization`, create a `Consumer` with:
   - `Type` set to `OAuth`
   - `Sandbox Mode` should be unchecked
   - Click `Add Redirect URI` and input `http://localhost:5001/callback`
3. Within your `Organization`, create an `ID.me Social Login`/`NIST IAL1/AAL1` `Policy` following [the playbook](https://idmeinc.atlassian.net/wiki/spaces/SI/pages/3190456321/SE+-+Social+Login+Policy+Configuration).
4. Copy your `Client ID` and `Client Secret` for future use.

### Local Heroku Setup

1. Prepare your app by cloning the repository:

    ```sh
    git clone https://github.com/antspriggs/idme-sc-heroku-onboarding.git
    cd idme-sc-heroku-onboarding
    ```

2. Log into Heroku CLI (VPN must be turned off for this step):

    ```sh
    heroku login
    ```

    *You will be prompted to sign into Heroku and redirected back to your terminal after successfully authenticating.*

3. Check `node` version and ensure you are using version 18 or later:

    ```sh
    node --version
    ```

4. Check `npm` is installed by Node:

    ```sh
    npm --version
    ```

5. Check `git` version to confirm `git` is installed:

    ```sh
    git --version
    ```

6. Initialize your `git` repository with Heroku:

    ```sh
    heroku git:remote -a <your Heroku app name>
    ```

## Setup Application

1. Install the necessary dependencies:

    ```sh
    npm install
    ```

2. Create a `.env` file in the root directory of your project and add the following environment variables:

    ```plaintext
    SANDBOX_CLIENT_ID=<your ID.me Sandbox Client ID>
    SANDBOX_CLIENT_SECRET=<your ID.me Sandbox Client Secret>
    PRODUCTION_CLIENT_ID=<your ID.me Production Client ID>
    PRODUCTION_CLIENT_SECRET=<your ID.me Production Client Secret>
    ```

## Setting Up Environment Variables in Heroku

1. Set the environment variables in Heroku:

    ```sh
    heroku config:set SANDBOX_CLIENT_ID=<your ID.me Sandbox Client ID>
    heroku config:set SANDBOX_CLIENT_SECRET=<your ID.me Sandbox Client Secret>
    heroku config:set PRODUCTION_CLIENT_ID=<your ID.me Production Client ID>
    heroku config:set PRODUCTION_CLIENT_SECRET=<your ID.me Production Client Secret>
    ```

## Testing the Application

1. Run the application locally to ensure everything is set up correctly:

    ```sh
    npm start
    ```

2. Open your browser and navigate to [`http://localhost:5001`](http://localhost:5001) to test the application.

## Deploy your application to Heroku

1. Commit your code to `git` and deploy to Heroku using `git`:

    ```sh
    git add .
    git commit -a -m "make it better"
    git push heroku master
    ```

Your application should now be deployed to Heroku and accessible via your Heroku app URL.