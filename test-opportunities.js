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
    
    // Now test getMyOpportunities
    const oppOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/opportunities',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const oppReq = http.request(oppOptions, (oppRes) => {
      let oppBody = '';
      oppRes.on('data', (chunk) => { oppBody += chunk; });
      oppRes.on('end', () => {
        console.log('Get Opportunities Status:', oppRes.statusCode);
        console.log('Response:', oppBody);
      });
    });
    
    oppReq.on('error', (error) => {
      console.error('Error:', error);
    });
    
    oppReq.end();
  });
});

loginReq.on('error', (error) => {
  console.error('Login Error:', error);
});

loginReq.write(loginData);
loginReq.end();
