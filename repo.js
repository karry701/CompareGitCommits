const axios = require('axios');
const jsdiff = require('diff');

exports.gitCommitDiff = async function (req, res, next) {
    try {
        const { owner, repo, commitSHA } = req.query;

        // Fetch the commit details from the GitHub API
        const commitURL = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSHA}`;
        const commitResponse = await axios.get(commitURL);
        const commit = commitResponse.data;

        // Fetch the file tree of the commit
        const treeURL = commit.commit.tree.url;
        const treeResponse = await axios.get(treeURL);
        //const files = treeResponse.data.tree.filter(item => item.type === 'blob');
        const files = treeResponse.data.tree

        // Fetch file content before and after the commit
        const fileDiffs = await Promise.all(files.map(async file => {
            const { path } = file;
            const fileBeforeURL = `${commitURL}?path=${path}`;
            const fileAfterURL = `https://raw.githubusercontent.com/${owner}/${repo}/${commitSHA}/${path}`;

            const fileBeforeResponse = await axios.get(fileBeforeURL);
            const fileBeforeContent = fileBeforeResponse.data.content;
            //const fileBeforeContent = fileBeforeResponse.data;

            const fileAfterResponse = await axios.get(fileAfterURL);
            const fileAfterContent = fileAfterResponse.data;

            // Generate code differences
            const diff = jsdiff.diffChars(fileBeforeContent, fileAfterContent);

            return {
                path,
                diff,
            };
        }));

        res.json(fileDiffs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
}