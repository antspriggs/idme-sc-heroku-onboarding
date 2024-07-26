import express, { json } from 'express'
import axios from 'axios'
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'

const app = express()
const port = process.env.PORT || 5001

app.use(express.static('public'));
app.use(json());
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', './views');

const federatedProtocols = ['oauth', 'oidc', 'saml']
const envConig = {
  'prod': {
    'envDomain': `https://api.id.me`,
    'clientID': process.env.PRODUCTION_CLIENT_ID,
    'clientSecret': process.env.PRODUCTION_CLIENT_SECRET,
  },
  'sandbox': {
    'envDomain': `https://api.idmelabs.com`,
    'clientID': process.env.SANDBOX_CLIENT_ID,
    'clientSecret': process.env.SANDBOX_CLIENT_SECRET,
  }
}

const policiesEndpoint = (envDomain, clientID, clientSecret) => {
  return `${envDomain}/api/public/v3/policies.json?client_id=${clientID}&client_secret=${clientSecret}`
}
const apiEndpoint = (envDomain, dataEndpoint, accessToken) => {
  return `${envDomain}/api/public/v3/${dataEndpoint}.json?access_token=${accessToken}`
}

app.param('env', function(req, res, next){
  if (envConig[req.params.env]) {
    next();
  } else {
    next(res.status(404).send('failed to find protocol'));
  }
});

app.param('protocol', function(req, res, next){
  if (federatedProtocols.includes(req.params.protocol)) {
    next();
  } else {
    next(res.status(404).send('failed to find protocol'));
  }
});

app.param('policy', async function(req, res, next){
  const { env, policy } = req.params 
  const { envDomain, clientID, clientSecret } = envConig[env]

  try {
    const apiResponse = await axios.get(policiesEndpoint(envDomain, clientID, clientSecret));
    const policies = apiResponse.data.map(policy => policy.handle)

    if (policies.includes(policy)) {
      next();
    } else {
      next(res.status(404).send('failed to find policy'));
    }
  } catch (error) {
    console.error('Error making API request:', error);
    res.status(500).send('An error occurred');
  } 
});

app.get('/idme/:env/:protocol', async (req, res) => {
  const { env, protocol } = req.params 
  const { envDomain, clientID, clientSecret } = envConig[env]

  try {
    const apiResponse = await axios.get(policiesEndpoint(envDomain, clientID, clientSecret));
    const policies = apiResponse.data.map(policy => policy.handle)

    res.render('policies', { 
      policies: policies,
      env: env,
      protocol: protocol,
      basePath: 'idme'
    });
  } catch (error) {
    console.error('Error making API request:', error);
    res.status(500).send('An error occurred');
  } 
});

app.get('/idme/integrated/:env/:protocol', async (req, res) => {
  const { env, protocol } = req.params 
  const { envDomain, clientID, clientSecret } = envConig[env]

  try {
    const apiResponse = await axios.get(policiesEndpoint(envDomain, clientID, clientSecret));
    const policies = apiResponse.data

    console.log(apiResponse.data)
    
    res.render('policies', { 
      policies: policies,
      env: env,
      protocol: protocol,
      basePath: 'idme/integrated'
    });
  } catch (error) {
    console.error('Error making API request:', error);
    res.status(500).send('An error occurred');
  } 
});

app.get('/profile', (req, res) => {
  const { idmePayload, idmeData } = req.cookies
  const { fname, lname, email, zip, uuid } = idmeData

  if (idmeData){
    res.render('profile', { 
      payload: JSON.stringify(idmePayload, null, 4), 
      data: JSON.stringify(idmeData, null, 4), 
      fname: fname, 
      lname: lname, 
      email: email,
      zip: zip,
      uuid: uuid 
    });
  } else {
    res.redirect('/')
  }
});

app.get('/idme/:env/:protocol/:policy', function (req, res) {
  const { env, protocol, policy } = req.params
  const { envDomain, clientID } = envConig[env]
  const { state, eid } = req.query
  const { host } = req.headers
  const scope = protocol == 'oidc' ? `${policy} openid` : policy

  res.render('index', { 
    envDomain: envDomain,
    clientID: clientID,
    redirectUri: `http://${host}/callback/${env}/${protocol}`,
    scope: scope,
    state: state,
    eid: eid
  });
});

app.get('/idme/integrated/:env/:protocol/:policy', function (req, res) {
  const { env, protocol, policy } = req.params
  const { envDomain, clientID } = envConig[env]
  const { state, eid } = req.query
  const { host } = req.headers
  const scope = protocol == 'oidc' ? `${policy} openid` : policy
  const authEndpoint = `${envDomain}/oauth/authorize`

  let params = `?client_id=${clientID}&redirect_uri=http://${host}/callback/${env}/${protocol}&response_type=code&scope=${scope}`

  if (state) {params = `${params}&state=${state}`}
  if (eid) {params = `${params}&eid=${eid}`}

  res.redirect(`${authEndpoint}${params}`)
});

app.get('/callback/:env/:protocol', async function (req, res) {
  const authorizationCode = req.query.code;
  const { env, protocol } = req.params
  const { envDomain, clientID, clientSecret } = envConig[env]
  const { host } = req.headers
  const isOIDC = protocol == 'oidc'
  const dataEndpoint = isOIDC ? 'userinfo' : 'attributes'

  if (!authorizationCode) {
    return res.status(400).send('Authorization code not provided');
  }

  try {
    const tokenResponse = await axios.post(`${envDomain}/oauth/token`, {
      code: authorizationCode,
      client_id: clientID,
      client_secret: clientSecret,
      redirect_uri: `http://${host}/callback/${env}/${protocol}`,
      grant_type: 'authorization_code'
    });
    
    const accessToken = tokenResponse.data.access_token;
    const apiResponse = await axios.get(apiEndpoint(envDomain, dataEndpoint, accessToken));
    const data = isOIDC 
      ? jwt.decode(apiResponse.data) 
      : apiResponse.data.attributes.reduce((attributes, attribute) => {
          attributes[attribute.handle] = attribute.value;
          return attributes;
        }, {})

        
    res.clearCookie
    res.cookie('idmePayload', apiResponse.data, { expires: new Date(Date.now() + 60000) })
    res.cookie('idmeData', data, { expires: new Date(Date.now() + 60000) })
    res.redirect('/profile');
  } catch (error) {
    console.error('Error exchanging authorization code or making API request:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})