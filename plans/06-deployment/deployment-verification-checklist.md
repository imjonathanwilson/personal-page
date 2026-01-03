# Deployment Verification Checklist - Phase 6

**Version:** 1.0
**Last Updated:** 2026-01-02
**Owner:** Bob (Validation Agent)

## Overview

This checklist provides comprehensive validation steps for deploying the Next.js application to production. It covers pre-deployment verification, post-deployment validation, smoke testing, and rollback procedures.

---

## Pre-Deployment Checks

### 1. Build Verification

- [ ] **Local Build Success**
  - Run: `cd personal-page-nextjs && npm run build`
  - Verify: Build completes without errors
  - Verify: No TypeScript compilation errors
  - Verify: No ESLint warnings or errors
  - Expected output: `✓ Compiled successfully` message

- [ ] **Artifact Structure Validation**
  - [ ] `out/` directory exists
  - [ ] `out/index.html` exists and is valid HTML
  - [ ] `out/_next/static/chunks/` contains JS bundles (8+ files)
  - [ ] `out/_next/static/chunks/*.css` files present (2+ CSS files)
  - [ ] `out/_next/static/media/` contains favicon
  - [ ] Static assets (SVG files) present in `out/` root
  - [ ] No build artifacts outside `out/` directory

- [ ] **File Size Verification**
  - [ ] Total `out/` directory size < 5MB
  - [ ] Individual JS chunks < 1MB each
  - [ ] No unexpectedly large files
  - [ ] CSS files properly minified

### 2. Dependencies & Environment

- [ ] **Node.js Environment**
  - Node.js version: v24.11.1 or compatible
  - npm version: 11.6.2 or compatible
  - All npm packages installed: `npm ci` successful

- [ ] **Environment Variables**
  - [ ] `AWS_ACCESS_KEY_ID` set in GitHub Secrets
  - [ ] `AWS_SECRET_ACCESS_KEY` set in GitHub Secrets
  - [ ] `DOMAIN_NAME` (optional) configured if custom domain used
  - [ ] `ACM_CERTIFICATE_ARN` (optional) configured if DOMAIN_NAME set

- [ ] **Git & Branch Status**
  - [ ] All changes committed to feature branch
  - [ ] Branch up to date with main
  - [ ] No uncommitted changes
  - [ ] PR created and approved (if required)

### 3. Infrastructure Readiness

- [ ] **Terraform State**
  - [ ] S3 backend accessible
  - [ ] No terraform state locks present
  - [ ] Latest terraform apply completed successfully
  - [ ] `terraform output` shows expected values

- [ ] **EC2 Instance**
  - [ ] Instance running and healthy
  - [ ] SSM Agent online (check Systems Manager)
  - [ ] Nginx installed and running
  - [ ] Sufficient disk space (>1GB free)

- [ ] **CloudFront Distribution**
  - [ ] Distribution status: `Deployed`
  - [ ] No pending configuration changes
  - [ ] Origins configured correctly

---

## CI/CD Pipeline Validation

### 4. GitHub Actions Workflow Review

- [ ] **Build Job Configuration**
  - [ ] `build-nextjs` job defined
  - [ ] Node.js 24.x setup step present
  - [ ] `npm ci` install step present
  - [ ] `npm run build` build step present
  - [ ] Artifact upload configured for `out/` directory
  - [ ] Artifact name: `nextjs-build`
  - [ ] Artifact retention: 1 day minimum

- [ ] **Deploy Job Configuration**
  - [ ] `deploy-website` job depends on `build-nextjs`
  - [ ] Artifact download step present
  - [ ] Artifact downloaded to correct path
  - [ ] Ansible playbook reference updated
  - [ ] SSM Session Manager plugin installed

- [ ] **Job Dependencies**
  - [ ] `terraform-plan` → `terraform-apply` dependency correct
  - [ ] `build-nextjs` runs independently (no terraform dependency)
  - [ ] `deploy-website` requires both `terraform-apply` AND `build-nextjs`
  - [ ] `invalidate-cloudfront` depends on `deploy-website`

- [ ] **Conditional Execution**
  - [ ] Jobs only run on `main` branch (except plan)
  - [ ] Pull requests trigger plan only
  - [ ] Manual workflow_dispatch supported

### 5. Ansible Playbook Review

- [ ] **Deployment Path Updated**
  - [ ] `website_dir` variable points to `/var/www/html`
  - [ ] Source path updated from `../website/jonathan-wilson-90s.html` to artifact location
  - [ ] Synchronize module used instead of single file copy
  - [ ] Recursive sync enabled for entire `out/` directory

- [ ] **File Operations**
  - [ ] Directory structure preserved (recursive copy)
  - [ ] File permissions: `0644` for files, `0755` for directories
  - [ ] Owner: `nginx`
  - [ ] Group: `nginx`
  - [ ] Delete extraneous files enabled (clean deployment)

- [ ] **Nginx Configuration**
  - [ ] Nginx serves from `/var/www/html/`
  - [ ] `index.html` configured as default document
  - [ ] `_next/` directory accessible (no deny rules)
  - [ ] MIME types configured for `.js` and `.css`
  - [ ] Nginx reload/restart handler triggered after deployment

- [ ] **Service Management**
  - [ ] Nginx service started if stopped
  - [ ] Nginx service enabled on boot
  - [ ] Handler triggers nginx restart on config change

---

## Post-Deployment Validation

### 6. Deployment Success Verification

- [ ] **GitHub Actions Completion**
  - [ ] All jobs completed successfully (green checkmarks)
  - [ ] `build-nextjs` job: Build succeeded
  - [ ] `deploy-website` job: Ansible playbook completed
  - [ ] `invalidate-cloudfront` job: Cache invalidation created
  - [ ] No timeout errors
  - [ ] No connection failures

- [ ] **Server-Side Verification**
  - [ ] SSH/SSM into EC2 instance successful
  - [ ] Files exist in `/var/www/html/`:
    - [ ] `index.html`
    - [ ] `_next/static/chunks/`
    - [ ] `_next/static/media/`
    - [ ] `favicon.ico`
  - [ ] File ownership: `nginx:nginx`
  - [ ] File permissions correct: `0644` files, `0755` directories
  - [ ] Nginx service status: `active (running)`
  - [ ] Nginx error log clean: `sudo tail -f /var/log/nginx/error.log`

- [ ] **CloudFront Invalidation**
  - [ ] Invalidation request created successfully
  - [ ] Invalidation ID returned
  - [ ] Invalidation status: `InProgress` or `Completed`
  - [ ] Path: `/*` (all paths)

### 7. Functional Testing

#### Direct Server Test (EC2)

- [ ] **HTTP Request Test**
  - [ ] `curl http://localhost/` returns HTML
  - [ ] Response contains Next.js content
  - [ ] Response includes `<title>Jonathan Wilson - Terminal</title>`
  - [ ] Response includes CSS links to `/_next/static/`
  - [ ] Response includes JS script tags
  - [ ] HTTP status: `200 OK`

#### CloudFront Test (CDN)

- [ ] **CloudFront URL Access**
  - [ ] CloudFront URL loads: `https://<cloudfront-id>.cloudfront.net`
  - [ ] HTTPS connection successful (SSL valid)
  - [ ] Page renders without errors
  - [ ] Browser console shows no 404 errors
  - [ ] Browser console shows no CORS errors

### 8. Smoke Test Checklist

Execute these tests in order:

- [ ] **1. Homepage Load**
  - [ ] Page loads within 3 seconds
  - [ ] HTML structure renders correctly
  - [ ] Terminal window visible
  - [ ] Header controls (red, yellow, green buttons) visible
  - [ ] Terminal title displays: `jonathan-wilson@homepage:~`

- [ ] **2. Styling & Layout**
  - [ ] CSS loaded correctly (no unstyled content flash)
  - [ ] Background color correct (dark theme)
  - [ ] Terminal window centered on screen
  - [ ] Responsive breakpoints work (test 768px, 480px)
  - [ ] No layout shift or broken styling

- [ ] **3. Typing Effect Animation**
  - [ ] Command typing animation starts after page load
  - [ ] Typing speed: ~75ms per character
  - [ ] Initial delay: ~500ms
  - [ ] Cursor blinks at 1-second interval
  - [ ] Full text appears correctly:
    - `cat portfolio.txt`
    - `ls -la projects/`
    - `man skills`

- [ ] **4. Interactive Elements**
  - [ ] GitHub link clickable and opens in new tab
  - [ ] LinkedIn link clickable and opens in new tab
  - [ ] Footer text visible: `[Press any key to continue...]`
  - [ ] No JavaScript errors in console

- [ ] **5. Three.js Visualization (Desktop Only)**
  - [ ] Three.js canvas renders
  - [ ] 3D blocks/geometry visible
  - [ ] Shader effects active (if implemented)
  - [ ] Animation smooth (30+ FPS)
  - [ ] No WebGL errors in console
  - [ ] Canvas fills background correctly

- [ ] **6. Mobile Responsiveness**
  - [ ] Test on mobile viewport (375px width)
  - [ ] Three.js disabled on mobile (performance)
  - [ ] Terminal window stacks correctly
  - [ ] Text readable without horizontal scroll
  - [ ] Touch targets adequately sized
  - [ ] No content overflow

- [ ] **7. Performance Checks**
  - [ ] First Contentful Paint (FCP) < 1.5s
  - [ ] Largest Contentful Paint (LCP) < 2.5s
  - [ ] Total Blocking Time (TBT) < 300ms
  - [ ] Cumulative Layout Shift (CLS) < 0.1
  - [ ] Page weight < 2MB total

- [ ] **8. Cross-Browser Testing**
  - [ ] Chrome/Edge (Chromium): ✓
  - [ ] Firefox: ✓
  - [ ] Safari (if available): ✓
  - [ ] Mobile Safari (iOS): ✓
  - [ ] Mobile Chrome (Android): ✓

---

## Rollback Procedures

### 9. Rollback Decision Triggers

Initiate rollback if ANY of the following occur:

- [ ] **Critical Errors**
  - Site completely inaccessible (5xx errors)
  - CloudFront returns errors for all requests
  - JavaScript console shows breaking errors
  - Page fails to load on any major browser

- [ ] **Functional Regressions**
  - Typing animation broken or missing
  - Links do not work
  - Three.js visualization errors (if implemented)
  - Mobile layout completely broken

- [ ] **Performance Degradation**
  - Page load time > 10 seconds
  - First Contentful Paint > 5 seconds
  - Unresponsive UI or frozen page

- [ ] **Infrastructure Issues**
  - Nginx service crashes or fails to start
  - File permissions prevent access
  - CloudFront cannot reach origin server

### 10. Rollback Procedure

**Option A: Git Revert (Recommended for Main Branch)**

1. **Identify Commit to Revert**
   ```bash
   git log --oneline -5
   # Find the problematic commit SHA
   ```

2. **Create Revert Commit**
   ```bash
   git revert <commit-sha>
   git push origin main
   ```

3. **Trigger Re-Deployment**
   - GitHub Actions automatically deploys reverted code
   - Monitor pipeline for successful completion

4. **Verify Rollback**
   - Confirm old version is live
   - Run smoke tests again
   - Verify issues resolved

**Option B: Re-Deploy Previous Artifact (Fast Rollback)**

1. **Download Previous Build Artifact**
   - Go to previous successful GitHub Actions run
   - Download `nextjs-build` artifact from successful run

2. **Manual Ansible Deployment**
   ```bash
   # Extract artifact
   unzip nextjs-build.zip -d /tmp/previous-build/

   # Deploy via Ansible (modify playbook source path temporarily)
   cd ansible
   ansible-playbook -i inventory/hosts playbook.yml -e "artifact_path=/tmp/previous-build/out"
   ```

3. **Invalidate CloudFront**
   ```bash
   cd terraform
   CLOUDFRONT_ID=$(terraform output -raw cloudfront_id)
   aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
   ```

**Option C: Manual Restoration (Emergency)**

1. **SSH into EC2 Instance**
   ```bash
   INSTANCE_ID=$(terraform output -raw instance_id)
   aws ssm start-session --target $INSTANCE_ID
   ```

2. **Restore Previous Files** (if backup exists)
   ```bash
   sudo cp -r /var/www/html.backup/* /var/www/html/
   sudo chown -R nginx:nginx /var/www/html
   sudo systemctl restart nginx
   ```

3. **Invalidate CloudFront**
   - Same as Option B step 3

### 11. Rollback Authorization

- **Who can authorize rollback:**
  - Project Owner/Maintainer
  - On-call SRE (if production incident)
  - Deployment Lead (for planned rollbacks)

- **Communication Protocol:**
  1. Notify team in Slack/Teams channel
  2. Post in #coordination NATS channel
  3. Document rollback reason in incident log
  4. Update GitHub issue/PR with rollback status

- **Post-Rollback Actions:**
  - [ ] Document root cause of failure
  - [ ] Create GitHub issue for bug fix
  - [ ] Update deployment checklist if needed
  - [ ] Schedule post-mortem if critical incident
  - [ ] Test fix in staging before re-deploying

---

## Monitoring & Observability

### 12. Post-Deployment Monitoring (First 24 Hours)

- [ ] **CloudFront Metrics** (AWS Console)
  - [ ] Monitor request count (should match baseline)
  - [ ] Check 4xx error rate (should be < 1%)
  - [ ] Check 5xx error rate (should be 0%)
  - [ ] Cache hit ratio (should improve over time)

- [ ] **EC2 Instance Metrics**
  - [ ] CPU utilization (should be < 20%)
  - [ ] Memory utilization (should be < 50%)
  - [ ] Network traffic (monitor for anomalies)
  - [ ] Disk utilization (should be stable)

- [ ] **Nginx Access Logs** (if needed)
  ```bash
  sudo tail -f /var/log/nginx/access.log
  # Monitor for unusual patterns or errors
  ```

- [ ] **Nginx Error Logs** (critical)
  ```bash
  sudo tail -f /var/log/nginx/error.log
  # Should be empty or minimal errors
  ```

### 13. Ongoing Monitoring

- [ ] Set up CloudWatch alarms (if not already configured):
  - [ ] 5xx error rate > 1% for 5 minutes
  - [ ] 4xx error rate > 5% for 10 minutes
  - [ ] EC2 instance status check failure
  - [ ] CloudFront origin latency > 3 seconds

---

## Sign-Off

### Deployment Team Sign-Off

- [ ] **Pre-Deployment**: All pre-deployment checks passed
  - Signed: _________________ Date: _________

- [ ] **Post-Deployment**: All smoke tests passed
  - Signed: _________________ Date: _________

- [ ] **Production Approval**: Site verified in production
  - Signed: _________________ Date: _________

### Rollback Authority

- [ ] **Rollback Authorized By** (if applicable): _________________
- [ ] **Rollback Reason**: _________________________________
- [ ] **Rollback Completed**: _________________ Date: _________

---

## Appendix

### A. Useful Commands

**Check Build Output Structure:**
```bash
cd personal-page-nextjs
npm run build
ls -lah out/
find out/ -type f | wc -l  # Count files
du -sh out/                 # Check size
```

**Verify Terraform Outputs:**
```bash
cd terraform
terraform output
terraform output -raw cloudfront_url
terraform output -raw instance_id
```

**Check Nginx Configuration:**
```bash
sudo nginx -t                    # Test config syntax
sudo systemctl status nginx      # Check service status
sudo systemctl restart nginx     # Restart service
```

**Monitor CloudFront Invalidation:**
```bash
aws cloudfront get-invalidation \
  --distribution-id <CLOUDFRONT_ID> \
  --id <INVALIDATION_ID>
```

### B. Artifact Structure Reference

Expected `out/` directory structure after Next.js build:

```
out/
├── index.html                    # Main page
├── 404.html                      # 404 error page
├── _not-found.html               # Not found page
├── favicon.ico                   # Site icon
├── *.svg                         # Static SVG assets
├── _next/
│   ├── static/
│   │   ├── chunks/
│   │   │   ├── *.js             # JavaScript bundles (8+ files)
│   │   │   ├── *.css            # CSS stylesheets (2+ files)
│   │   │   └── *.js.map         # Source maps
│   │   ├── media/
│   │   │   └── favicon.*.ico    # Processed favicon
│   │   └── <build-id>/          # Build-specific assets
│   │       ├── _buildManifest.js
│   │       ├── _ssgManifest.js
│   │       └── _clientMiddlewareManifest.json
│   └── <build-id>/              # Build hash directory
└── _not-found/                   # Not found route assets
```

**Key Files to Verify:**
- `index.html` - Entry point (should be 7-10KB)
- `_next/static/chunks/*.js` - JavaScript bundles (total ~1-2MB)
- `_next/static/chunks/*.css` - Stylesheets (total ~5-15KB)

### C. Common Issues & Resolutions

**Issue: Build fails with TypeScript errors**
- **Resolution**: Run `npm run build` locally and fix TypeScript errors before committing

**Issue: Artifact upload/download path mismatch**
- **Resolution**: Verify `actions/upload-artifact@v4` and `actions/download-artifact@v4` use same `name` and compatible paths

**Issue: Nginx serves 404 for `_next/` resources**
- **Resolution**: Verify nginx location block allows serving from `_next/` subdirectory and MIME types configured

**Issue: CloudFront still shows old content after invalidation**
- **Resolution**: Wait 5-15 minutes for invalidation completion; test with `?nocache` query parameter

**Issue: Three.js not loading**
- **Resolution**: Check browser console for errors; verify Three.js scripts in build output; check CSP headers

**Issue: Ansible playbook fails to connect**
- **Resolution**: Verify SSM agent running on EC2; wait 60 seconds after instance start; check IAM role attached

---

**End of Checklist**
