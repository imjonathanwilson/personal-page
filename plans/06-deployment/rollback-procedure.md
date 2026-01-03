# Rollback Procedure: Next.js to Static HTML

## Overview

This document provides step-by-step instructions for rolling back from the Next.js deployment to the previous static HTML website in case of issues.

## Rollback Scenarios

### When to Rollback
- Next.js build fails in CI/CD pipeline
- Website not accessible after deployment
- Critical functionality broken
- Performance degradation
- SEO issues detected
- User-facing errors

## Pre-Rollback Checklist

- [ ] Verify the issue is not a CloudFront caching problem (try invalidation first)
- [ ] Check EC2 instance status and Nginx logs
- [ ] Confirm issue is deployment-related, not infrastructure
- [ ] Notify team/stakeholders of rollback decision
- [ ] Document the issue for post-mortem

## Quick Rollback (Recommended)

### Option 1: Revert GitHub Actions Workflow (Fastest)

**Time Estimate: 5-10 minutes**

1. **Checkout Main Branch**
   ```bash
   cd /home/jdubz/personal-page
   git checkout main
   ```

2. **Revert to Previous Commit**
   ```bash
   # Find the commit hash before Next.js deployment
   git log --oneline -10

   # Revert to the commit before deployment changes
   git revert <deployment-commit-hash> --no-edit

   # Or reset to previous commit (if not pushed to remote)
   git reset --hard <previous-commit-hash>
   ```

3. **Push Rollback**
   ```bash
   git push origin main
   # If you used reset, force push (DANGER: coordinate with team)
   # git push origin main --force
   ```

4. **Monitor GitHub Actions**
   - Pipeline will automatically deploy static HTML
   - Wait for deployment to complete (5-8 minutes)

5. **Invalidate CloudFront Cache**
   ```bash
   cd terraform
   aws cloudfront create-invalidation \
     --distribution-id $(terraform output -raw cloudfront_id) \
     --paths "/*"
   ```

6. **Verify Website**
   - Visit CloudFront URL
   - Check static HTML is served
   - Test all links and functionality

### Option 2: Manual Ansible Deployment

**Time Estimate: 10-15 minutes**

If the automated pipeline is broken, deploy manually:

1. **Prepare Static HTML**
   ```bash
   cd /home/jdubz/personal-page
   ```

2. **Create Temporary Playbook**
   ```bash
   cat > ansible/rollback-playbook.yml << 'EOF'
   ---
   - name: Rollback to Static HTML Website
     hosts: webservers
     become: yes
     vars:
       website_dir: /var/www/html
       nginx_user: nginx

     tasks:
       - name: Clean website directory
         file:
           path: "{{ website_dir }}"
           state: absent

       - name: Recreate website directory
         file:
           path: "{{ website_dir }}"
           state: directory
           owner: "{{ nginx_user }}"
           group: "{{ nginx_user }}"
           mode: '0755'

       - name: Copy static HTML file
         copy:
           src: ../website/jonathan-wilson-90s.html
           dest: "{{ website_dir }}/index.html"
           owner: "{{ nginx_user }}"
           group: "{{ nginx_user }}"
           mode: '0644'

       - name: Restart nginx
         systemd:
           name: nginx
           state: restarted
   EOF
   ```

3. **Run Rollback Playbook**
   ```bash
   cd ansible
   ansible-playbook -i inventory/hosts rollback-playbook.yml
   ```

4. **Invalidate CloudFront Cache**
   ```bash
   cd ../terraform
   aws cloudfront create-invalidation \
     --distribution-id $(terraform output -raw cloudfront_id) \
     --paths "/*"
   ```

5. **Verify Website**
   - Test CloudFront URL
   - Confirm static HTML is live

## Full Rollback (Complete Revert)

### Option 3: Complete Pipeline Rollback

**Time Estimate: 15-20 minutes**

Use this if you need to completely restore the previous deployment pipeline:

1. **Identify Rollback Point**
   ```bash
   cd /home/jdubz/personal-page
   git log --oneline --graph --decorate
   ```

2. **Create Rollback Branch**
   ```bash
   git checkout -b rollback/nextjs-deployment-$(date +%Y%m%d)
   ```

3. **Restore Previous Files**
   ```bash
   # Checkout specific files from before deployment
   git checkout <previous-commit-hash> -- .github/workflows/deploy.yml
   git checkout <previous-commit-hash> -- ansible/playbook.yml
   ```

4. **Commit Rollback**
   ```bash
   git add .github/workflows/deploy.yml ansible/playbook.yml
   git commit -m "Rollback: Restore static HTML deployment pipeline"
   ```

5. **Push and Merge**
   ```bash
   git push origin rollback/nextjs-deployment-$(date +%Y%m%d)
   # Create PR or merge directly to main
   ```

6. **Trigger Deployment**
   - GitHub Actions will run automatically
   - Or trigger manually via workflow_dispatch

7. **Invalidate CloudFront**
   ```bash
   cd terraform
   aws cloudfront create-invalidation \
     --distribution-id $(terraform output -raw cloudfront_id) \
     --paths "/*"
   ```

## Emergency Rollback (Direct Server Access)

### Option 4: Direct SSH/SSM Deployment

**Time Estimate: 5 minutes**
**Use Only If:** All automated methods fail

1. **Connect to EC2 Instance**
   ```bash
   cd terraform
   INSTANCE_ID=$(terraform output -raw instance_id)
   aws ssm start-session --target $INSTANCE_ID
   ```

2. **Backup Current Deployment**
   ```bash
   sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d%H%M%S)
   ```

3. **Restore Static HTML**
   ```bash
   # Clear current directory
   sudo rm -rf /var/www/html/*

   # Create simple static HTML (emergency version)
   sudo tee /var/www/html/index.html << 'EOF'
   <!DOCTYPE html>
   <html>
   <head>
       <title>Jonathan Wilson - Site Maintenance</title>
       <style>
           body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
           h1 { color: #333; }
       </style>
   </head>
   <body>
       <h1>Site Under Maintenance</h1>
       <p>We're working to restore full functionality. Please check back soon.</p>
   </body>
   </html>
   EOF

   # Or copy from Git if available
   # sudo curl -o /var/www/html/index.html https://raw.githubusercontent.com/<user>/<repo>/main/website/jonathan-wilson-90s.html
   ```

4. **Fix Permissions**
   ```bash
   sudo chown -R nginx:nginx /var/www/html
   sudo chmod 755 /var/www/html
   sudo chmod 644 /var/www/html/index.html
   ```

5. **Restart Nginx**
   ```bash
   sudo systemctl restart nginx
   sudo systemctl status nginx
   ```

6. **Invalidate CloudFront**
   ```bash
   # Exit SSM session, then:
   aws cloudfront create-invalidation \
     --distribution-id $(terraform output -raw cloudfront_id) \
     --paths "/*"
   ```

## Post-Rollback Actions

### Immediate Actions (Within 1 hour)
- [ ] Verify website is fully functional
- [ ] Monitor CloudFront logs for errors
- [ ] Check EC2 instance metrics (CPU, memory, disk)
- [ ] Test website from multiple geographic locations
- [ ] Notify stakeholders of rollback completion

### Short-term Actions (Within 24 hours)
- [ ] Conduct post-mortem meeting
- [ ] Document root cause of issue
- [ ] Create GitHub issue with rollback details
- [ ] Update rollback procedure with lessons learned
- [ ] Plan remediation for Next.js deployment issues

### Long-term Actions (Within 1 week)
- [ ] Fix issues that caused rollback
- [ ] Test fixes in staging/development environment
- [ ] Update deployment checklist
- [ ] Consider adding automated rollback triggers
- [ ] Review monitoring and alerting setup

## Rollback Validation Checklist

After completing rollback, verify:

- [ ] Website loads successfully via CloudFront URL
- [ ] Direct EC2 URL also works (if applicable)
- [ ] All images and assets load correctly
- [ ] No console errors in browser developer tools
- [ ] Page renders correctly on mobile and desktop
- [ ] SEO meta tags are present
- [ ] Analytics tracking works (if applicable)
- [ ] SSL/TLS certificate valid
- [ ] HTTP to HTTPS redirect working
- [ ] Nginx logs show no errors
- [ ] CloudFront cache invalidation completed

## Known Issues and Workarounds

### CloudFront Cache Delays
**Issue:** Changes not visible immediately after rollback
**Solution:**
- Wait 10-15 minutes for invalidation to complete
- Use `?v=timestamp` query parameter to bypass cache
- Check invalidation status: `aws cloudfront get-invalidation --id <id> --distribution-id <dist-id>`

### Ansible Connection Failures
**Issue:** SSM connection times out
**Solution:**
- Wait 60 seconds and retry
- Verify SSM agent running: Check AWS Systems Manager → Fleet Manager
- Use emergency direct server access (Option 4)

### Git Revert Conflicts
**Issue:** Merge conflicts during revert
**Solution:**
- Use `git checkout` to restore specific files
- Manually edit conflicting files
- Consider creating fresh branch from known-good commit

## Contact Information

**Primary Contacts:**
- DevOps Lead: [Contact Info]
- Infrastructure Team: [Contact Info]
- Emergency Escalation: [Contact Info]

**Resources:**
- AWS Console: https://console.aws.amazon.com/
- GitHub Actions: https://github.com/<repo>/actions
- Monitoring Dashboard: [URL if applicable]

## Version History

- v1.0 (2026-01-02): Initial rollback procedure created for Next.js migration
