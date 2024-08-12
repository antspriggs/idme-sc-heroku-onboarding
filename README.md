# ID.me SC Heroku Onboarding

## Prerequisite

### ID.me Sandbox Configuration

1. Create an `Organization` 
2. Within your `Organization`, create a `Consumer` with:
  - `Type` set to `OAuth`
  - `Sandbox Mode` should be unchecked
  - Click `Add Redirect URI` and input http://localhost:3000/callback
3. Within your `Organization`, create an `ID.me Social Login`/`NIST IAL1/AAL1` `Policy` following [the playbook](https://idmeinc.atlassian.net/wiki/spaces/SI/pages/3190456321/SE+-+Social+Login+Policy+Configuration)
4. Copy your `Client ID` and `Client Secret` for future use

### Local Heroku Setup

1. Prepare you app by cloning the repository 

```
git clone https://github.com/antspriggs/idme-sc-heroku-onboarding.git
cd idme-sc-heroku-onboarding
```

2. Install Heroku CLI

```
brew tap heroku/brew && brew install heroku
```

3. Log into Heroku CLI 

**VPN must be turned off for this step**

```
heroku login
```

*You will be prompted to sign into Heroku and redirected back to your terminal after successfully authenticating*

4. Check `node` version and ensure you are using version 18 or later.

```
node --version
```

5. Check `npm` version to confirm `npm` is installed by Node.

```
npm --version
```

6. Check `git` version to confirm `git` is installed.

```
git --version
```

7. Initialize your `git` repository with Heroku

```
heroku git:remote -a <<your Heroku app name>>
```

## Setup Application

```
npm install
```

## Deploy your application to Heroku

1. Commit your code to `git` and deploy to Heroku using `git`

```
git add .
git commit -a "make it better"
git push heroku master
```
