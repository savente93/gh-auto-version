const { createAppAuth } = require("@octokit/auth-app");
const { Octokit } = require("@octokit/rest");

const app = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    installationId: process.env.INSTALLATION_ID,
  },
});

app.on("issue_comment.created", async ({ payload }) => {
  const { owner, repo, number } = payload.issue;
  const { data: comments } = await app.issues.listComments({
    owner,
    repo,
    issue_number: number,
  });
  const comment = comments.find((comment) =>
    comment.body.includes("/version-bump")
  );
  if (!comment) return;
  const { sha } = await app.pulls.get({
    owner,
    repo,
    pull_number: number,
  });
  await app.git.createCommit({
    owner,
    repo,
    message: "Add empty commit",
    tree: sha,
    parents: [sha],
  });
});

