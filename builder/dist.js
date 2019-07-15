const fs = require('fs');

const ecosystemData = JSON.parse(fs.readFileSync(__dirname + '/../backend/ecosystemData.json', 'UTF-8'));

ecosystemData.distDate = new Date().getTime();

fs.writeFileSync(__dirname + '/../backend/ecosystemData.json', JSON.stringify(ecosystemData, null, 4));