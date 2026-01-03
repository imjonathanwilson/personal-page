# Deployment Checklist - Next.js Migration

**Version:** 1.0
**Date:** 2026-01-02
**Phase:** 6 - Deployment Pipeline

## Pre-Deployment Checks

### Code Review
- [ ] Review `.github/workflows/deploy.yml` changes
- [ ] Review `ansible/playbook.yml` changes
- [ ] Review `plans/06-deployment/rollback-procedure.md`
- [ ] Verify all changes in devlog are accurate
- [ ] Code review approved by team lead

### Local Testing
- [x] Next.js build completes successfully (`npm run build`)
- [x] Build output verified (`out/` directory structure)
- [x] Bundle size within target (287.6 KB < 500 KB)
- [x] No build errors or warnings
- [ ] Local preview tested (`npm start` or serve `out/`)

### Environment Preparation
- [ ] AWS credentials configured
- [ ] Terraform state accessible
- [ ] EC2 instance healthy (check AWS Console)
- [ ] CloudFront distribution active
- [ ] SSM agent running on EC2

### Communication
- [ ] Team notified of deployment window
- [ ] Stakeholders informed of changes
- [ ] Rollback team on standby
- [ ] Monitoring team alerted

## Deployment Steps

### Step 1: Push to Feature Branch
```bash
cd /home/jdubz/personal-page
git status
git add .github/workflows/deploy.yml
git add ansible/playbook.yml
git add plans/06-deployment/
git add devlog/workstream-6.1-cicd-implementation.md
git commit -m "feat: Update CI/CD pipeline for Next.js deployment"
git push origin feature/nextjs-deployment
```

**Checklist:**
- [ ] Files staged correctly
- [ ] Commit message descriptive
- [ ] Push successful
- [ ] GitHub shows feature branch

### Step 2: Monitor GitHub Actions
- [ ] Navigate to GitHub Actions tab
- [ ] Locate latest workflow run
- [ ] Verify `build-nextjs` job starts
- [ ] Monitor build logs for errors
- [ ] Verify artifact upload successful

### Step 3: Wait for Terraform
- [ ] `terraform-plan` job completes
- [ ] Review Terraform plan output
- [ ] Verify no unexpected infrastructure changes
- [ ] `terraform-apply` job completes (if on main)

### Step 4: Monitor Deployment
- [ ] `deploy-website` job starts
- [ ] Artifact download successful
- [ ] Ansible playbook begins execution
- [ ] Ansible tasks complete without errors
- [ ] Nginx restart successful

### Step 5: Cache Invalidation
- [ ] `invalidate-cloudfront` job starts
- [ ] CloudFront invalidation created
- [ ] Invalidation ID received

### Step 6: Verify Deployment
- [ ] Wait 5 minutes for invalidation to propagate
- [ ] Visit CloudFront URL
- [ ] Verify Next.js app loads
- [ ] Check browser console (no errors)
- [ ] Test on mobile device
- [ ] Test on desktop browser

## Post-Deployment Validation

### Functional Tests
- [ ] Homepage loads (`/`)
- [ ] 404 page works (`/nonexistent`)
- [ ] All navigation links work
- [ ] Images load correctly
- [ ] Fonts render correctly
- [ ] CSS styles applied

### Technical Tests
- [ ] View source shows static HTML
- [ ] JavaScript bundles load
- [ ] CSS files load
- [ ] No 404 errors in Network tab
- [ ] No console errors or warnings
- [ ] Lighthouse score similar to Phase 5

### Performance Tests
- [ ] Page load time < 2 seconds
- [ ] First Contentful Paint < 1 second
- [ ] Time to Interactive < 3 seconds
- [ ] CloudFront cache headers present
- [ ] Gzip compression active

### SEO Tests
- [ ] Meta tags present (`<title>`, `<meta name="description">`)
- [ ] OpenGraph tags present
- [ ] Favicon loads
- [ ] Robots.txt accessible (if applicable)
- [ ] Sitemap accessible (if applicable)

### Security Tests
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] SSL certificate valid
- [ ] No mixed content warnings
- [ ] Security headers present (CSP, X-Frame-Options, etc.)

### Monitoring
- [ ] CloudWatch logs show no errors
- [ ] EC2 instance metrics normal (CPU, memory)
- [ ] Nginx access logs show successful requests
- [ ] Nginx error logs empty or minimal

## Rollback Decision Point

**If any of the following occur, initiate rollback:**

### Critical Issues (Rollback Immediately)
- [ ] Website returns 5xx errors
- [ ] Critical JavaScript errors prevent page load
- [ ] Complete site downtime
- [ ] Data breach or security vulnerability
- [ ] Legal/compliance violation

### Major Issues (Rollback Recommended)
- [ ] Key functionality broken (navigation, forms, etc.)
- [ ] Performance degradation > 50%
- [ ] SEO meta tags missing
- [ ] Mobile rendering broken
- [ ] Multiple 404s for assets

### Minor Issues (Fix Forward)
- [ ] Minor styling issues
- [ ] Non-critical console warnings
- [ ] Slow page load (but functional)
- [ ] Minor accessibility issues

**Rollback Procedure:** See `/home/jdubz/personal-page/plans/06-deployment/rollback-procedure.md`

## Post-Deployment Tasks

### Immediate (Within 1 Hour)
- [ ] Monitor error logs for 30 minutes
- [ ] Test from multiple geographic locations
- [ ] Notify stakeholders of successful deployment
- [ ] Update status page (if applicable)
- [ ] Post success message to team chat

### Short-term (Within 24 Hours)
- [ ] Review CloudWatch metrics
- [ ] Analyze Lighthouse report
- [ ] Check Google Search Console (if applicable)
- [ ] Update documentation
- [ ] Archive deployment logs

### Long-term (Within 1 Week)
- [ ] Monitor analytics for traffic changes
- [ ] Review user feedback
- [ ] Conduct post-deployment retrospective
- [ ] Document lessons learned
- [ ] Plan Phase 7 work

## Merge to Main (After Successful Feature Branch Test)

### Pre-Merge Checklist
- [ ] Feature branch deployed successfully
- [ ] All validation tests passed
- [ ] No rollback required
- [ ] Team approves merge
- [ ] Create pull request

### Merge Steps
```bash
git checkout main
git pull origin main
git merge feature/nextjs-deployment
git push origin main
```

**OR via Pull Request:**
- [ ] Create PR: `feature/nextjs-deployment` → `main`
- [ ] Add reviewers
- [ ] PR approved
- [ ] Merge PR (squash or merge commit)

### Post-Merge Verification
- [ ] GitHub Actions triggers on main
- [ ] Deployment to production successful
- [ ] Production site verified
- [ ] Feature branch deleted (optional)

## Cleanup

### Artifact Cleanup
- [ ] GitHub Actions artifacts auto-expire (5 days)
- [ ] Local `out/` directory can be deleted
- [ ] Terraform plan files cleaned up

### Documentation Updates
- [ ] Update CLAUDE.md with new deployment process
- [ ] Archive Phase 6 in roadmap
- [ ] Update README (if applicable)
- [ ] Tag release in Git (optional)

## Sign-Off

**Deployed By:** ___________________
**Date:** ___________________
**Time:** ___________________
**Status:** [ ] Success [ ] Rollback [ ] Partial

**Notes:**
___________________________________________
___________________________________________
___________________________________________

## Emergency Contacts

**Primary:** DevOps Lead
**Secondary:** Infrastructure Team
**Escalation:** Engineering Manager

**AWS Console:** https://console.aws.amazon.com/
**GitHub Actions:** https://github.com/[repo]/actions
**Monitoring:** [Dashboard URL]
