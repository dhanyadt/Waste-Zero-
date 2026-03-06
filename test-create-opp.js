const http = require('http');

const loginData = JSON.stringify({
  email: "test@example.com",
  password: "Test1234@"
});

const loginOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
};

const loginReq = http.request(loginOptions, (loginRes) => {
  let body = '';
  loginRes.on('data', (chunk) => { body += chunk; });
  loginRes.on('end', () => {
    const loginResult = JSON.parse(body);
    if (!loginResult.success || !loginResult.token) {
      console.log('Login failed:', body);
      return;
    }
    
    console.log('Login successful!');
    const token = loginResult.token;
    
    // Create opportunity
    const oppData = JSON.stringify({
      title: "Community Recycling Drive",
      description: "Help us collect recyclables from the community",
      duration: "2 hours",
      location: "Central Park",
      status: "open",
      requiredSkills: ["Physical Labor", "Community Outreach"]
    });
    
    const createOppOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/opportunities',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': oppData.length,
        'Authorization': `Bearer ${token}`
      }
    };
    
    const createReq = http.request(createOppOptions, (createRes) => {
      let createBody = '';
      createRes.on('data', (chunk) => { createBody += chunk; });
      createRes.on('end', () => {
        console.log('Create Opportunity Status:', createRes.statusCode);
        console.log('Response:', createBody);
        
        // Now get opportunities again
        const getOppOptions = {
          hostname: 'localhost',
          port: 5000,
          path: '/api/opportunities',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        const getReq = http.request(getOppOptions, (getRes) => {
          let getBody = '';
          getRes.on('data', (chunk) => { getBody += chunk; });
          getRes.on('end', () => {
            console.log('Get Opportunities Status:', getRes.statusCode);
            console.log('Response:', getBody);
          });
        });
        
        getReq.on('error', (error) => {
          console.error('Get Error:', error);
        });
        
        getReq.end();
      });
    });
    
    createReq.on('error', (error) => {
      console.error('Create Error:', error);
    });
    
    createReq.write(oppData);
    createReq.end();
  });
});

loginReq.on('error', (error) => {
  console.error('Login Error:', error);
});

loginReq.write(loginData);
loginReq.end();
