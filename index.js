const core = require('@actions/core');
const github = require('@actions/github');

(async () => {
    const pk = process.env.KEY;
    const payload = github.context.payload;

    console.log(JSON.stringify(payload), undefined, 2);
    console.log(`PK: ${pk}`);
})();