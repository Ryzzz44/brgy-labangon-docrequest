# How we use Git and branches

## The branches

```
main      final, working version only. This is what we demo. Nobody pushes here directly.
  dev     everyone's finished work is combined here first. Nobody pushes here directly.
    feature/salado-resident-request      Samuel Salado
    feature/rafanan-staff-releasing      James Carl Rafanan
    feature/sanchez-request-management   Sean Anthony Sanchez
```

Rules:
1. **Work only on your own feature branch.**
2. Never push to `main` or `dev` directly. Changes reach them only through a **Pull Request (PR)**.
3. Another member reviews and approves the PR before it is merged.
4. Never use `git push --force`.
5. Never commit passwords, `.env` files or keys.

## First time (each member)

```bash
git clone https://github.com/Ryzzz44/brgy-labangon-docrequest.git
cd brgy-labangon-docrequest
git checkout feature/<your-branch>
```

Set your name once so your commits show as yours:

```bash
git config --global user.name "Your Full Name"
git config --global user.email "the-email-of-your-github-account"
```

## Every work session

```bash
# 1. Start on your branch, with the newest dev merged in
git checkout feature/<your-branch>
git pull origin feature/<your-branch>
git pull origin dev

# 2. Work... then save your progress in small commits
git add .
git commit -m "Add submit request endpoint"

# 3. Upload
git push origin feature/<your-branch>
```

Good commit messages say **what** changed: `Add cancel request endpoint`, `Build archive tab`, `Fix reject without reason`.

## When a part is finished: open a Pull Request

1. On GitHub, click **Pull requests > New pull request**.
2. **base: `dev`** and **compare: `feature/<your-branch>`**.
3. Fill in the template, link your issue (`Closes #3`), and add a teammate as reviewer.
4. The reviewer checks the code, runs it if possible, then clicks **Approve**, and the PR is merged.

When `dev` works completely, one member opens a PR from `dev` into `main` for the final version.

## If Git says there is a conflict

This happens when two people changed the same lines.

1. Open the file in VS Code. It shows **Current change** (yours) and **Incoming change** (theirs).
2. Choose the right version (or combine both), and delete the `<<<<<<<`, `=======` and `>>>>>>>` lines.
3. Then:
   ```bash
   git add .
   git commit -m "Resolve merge conflict with dev"
   git push origin feature/<your-branch>
   ```
4. Not sure? Ask the teammate who wrote the other change before deciding.
