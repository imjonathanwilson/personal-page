# Security updates — handoff plan (2026-11-07)

## Where things are
- Branch: `security-updates-2026-11`, pushed to origin (8 commits, last `74d0b69`).
- Worktree: `/home/jdubz/personal-page/.claude/worktrees/agent-aa884c2b3c9f026a3`
  (main checkout at `/home/jdubz/personal-page` has unrelated uncommitted changes — don't touch).
- PR: NOT opened (`gh` not installed). Open: https://github.com/imjonathanwilson/personal-page/compare/main...security-updates-2026-11
- Two adversarial reviews done; all findings fixed except "Known remaining" below.

## What the branch does
- Next.js 16.4.5, React 19.3.1, `npm audit fix` (17 vulns incl. 1 critical → 8 moderate, dev-only eslint/minimatch chain). Build verified.
- CI Terraform 1.17.1; all actions SHA-pinned; `requirements.txt` pinned (ansible 14.6.0, ansible-pylibssh 1.4.0, boto3/botocore 1.43.126).
- AWS auth via GitHub OIDC (no static keys):
  - `github-actions-personal-page` (write), trust `repo:imjonathanwilson/personal-page:ref:refs/heads/main` → secret `AWS_ROLE_ARN`.
  - `github-actions-personal-page-plan` (ReadOnlyAccess + state lockfile), trust `...:pull_request` → secret `AWS_PLAN_ROLE_ARN`.
  - Permissions boundary `jonathan-wilson-boundary` required on all `jonathan-wilson-*` roles (prevents CI role → admin escalation). `terraform/iam.tf` sets it on both project roles.
  - SSM StartSession limited to instances tagged `Project=JonathanWilson90s`.
- Deploy job renders `ansible/inventory/hosts` from terraform outputs (previously missing in CI).

## Remaining steps (in order)
1. **Apply terraform-backend** (blocked for Claude by auto-mode; run manually or add a permission rule):
   ```
   cd /home/jdubz/personal-page/.claude/worktrees/agent-aa884c2b3c9f026a3/terraform-backend
   terraform plan  -state=/home/jdubz/personal-page/terraform-backend/terraform.tfstate   # expect 7 to add, 0 change, 0 destroy
   terraform apply -state=/home/jdubz/personal-page/terraform-backend/terraform.tfstate
   terraform output -state=/home/jdubz/personal-page/terraform-backend/terraform.tfstate
   ```
   - Uses AWS profile `terraform-deployer` (account 301236973204). No existing OIDC provider; only `jonathan-wilson-*` roles are the two project roles — verified.
   - State backup: `/tmp/claude-1000/-home-jdubz/cb4b0a50-0984-4af6-8f6d-fb051d80cfad/scratchpad/backend.tfstate.bak` (temp; copy elsewhere if needed). Saved plan file there may be stale — re-plan.
   - Note: `terraform-backend` state is local-only and gitignored — don't lose it.
2. **Set repo secrets** `AWS_ROLE_ARN` = `github_actions_role_arn`, `AWS_PLAN_ROLE_ARN` = `github_actions_plan_role_arn` (GitHub UI, or install `gh` and `gh secret set`).
3. **Open PR**; confirm the PR's Terraform Plan job passes with the plan role.
4. **Merge**; watch the main run. First apply attaches the boundary to the two existing roles (`PutRolePermissionsBoundary`). If an IAM AccessDenied appears, read the denied action and add it to `aws_iam_role_policy.github_actions` in `terraform-backend/main.tf`, re-apply backend, re-run.
   - Watch the Ansible step specifically: SSM StartSession document ARN and tag condition were not tested against AWS.
5. **After a green main run**: delete secrets `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` and deactivate/delete the IAM access keys they used.
6. Merge the worktree branch locally / remove worktree when done.

## Known remaining (optional follow-ups)
- Session Manager plugin downloaded from `latest` with no checksum (AWS publishes only a GPG `.sig`; could verify the signature).
- Maintenance bucket is public and also the SSM staging bucket → use a separate private bucket for `ansible_aws_ssm_bucket_name`.
- Pre-existing lint error `react-hooks/set-state-in-effect` in `personal-page-nextjs/app/components/InfoContent/TypedCommand.tsx:21` (CI doesn't run lint).
- three 0.128 → 0.187 not upgraded (big jump).
- AWS provider still `~> 5.0` (6.x is a major migration).
- Workflow triggers on `master` too, but the write role doesn't trust it (harmless if no `master` branch).
