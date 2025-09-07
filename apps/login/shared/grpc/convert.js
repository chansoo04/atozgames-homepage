const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

// Load the JSON documentation
const protoJsonPath = path.join(__dirname, './src/docs/proto.json');
const protoData = JSON.parse(fs.readFileSync(protoJsonPath, 'utf8'));

// Define a basic HTML template using Handlebars
const template = Handlebars.compile(`
<!DOCTYPE html>
<html>
<head>
  <title>Proto Documentation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; }
    h1, h2, h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
    .message, .enum, .service { margin-bottom: 20px; }
    .field, .method { margin-left: 20px; }
    .field strong, .method strong { color: #333; }
    .method { padding: 10px 0; }
    .request-response { font-style: italic; color: #555; }
  </style>
</head>
<body>
  <h1>Proto Documentation</h1>
  {{#each nested}}
    <h2>{{@key}}</h2>
    {{#each this.nested}}
      {{#if this.fields}}
        <div class="message">
          <h3>Message: {{@key}}</h3>
          {{#each this.fields}}
            <div class="field">
              <strong>{{@key}}</strong>: {{this.type}}
            </div>
          {{/each}}
        </div>
      {{/if}}
      {{#if this.methods}}
        <div class="service">
          <h3>Service: {{@key}}</h3>
          {{#each this.methods}}
            <div class="method">
              <strong>{{@key}}</strong>
              <div class="request-response">
                Request: <code>{{this.requestType}}</code><br>
                Response: <code>{{this.responseType}}</code>
              </div>
            </div>
          {{/each}}
        </div>
      {{/if}}
    {{/each}}
  {{/each}}
</body>
</html>
`);

// Generate the HTML documentation
const html = template(protoData);
fs.writeFileSync(path.join(__dirname, './src/docs/proto.html'), html);

console.log('HTML documentation generated successfully.');
