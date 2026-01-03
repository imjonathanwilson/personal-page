# Infrastructure Analysis - Next.js Migration
**Date**: 2026-01-01
**Analyst**: Asheron

## Current Deployment Architecture

### GitHub Actions Workflow
**File**: `.github/workflows/deploy.yml`

**Current Jobs**:
1. `terraform-plan` - Validates and plans infrastructure changes
2. `terraform-apply` - Applies Terraform changes to AWS
3. `deploy-website` - Runs Ansible playbook to deploy HTML
4. `invalidate-cloudfront` - Clears CloudFront cache

**Current Configuration**:
- **Terraform Version**: 1.14.0
- **Python Version**: 3.12
- **AWS Region**: us-east-1
- **Triggers**: Push to main/master, pull requests, manual workflow dispatch
- **Environments**: Production environment for apply step

### Ansible Playbook
**File**: `ansible/playbook.yml`

**Current Tasks**:
1. Update all system packages
2. Install nginx, git, python3-pip
3. Start and enable nginx
4. Create website directory (`/var/www/html`)
5. Copy single HTML file to `index.html`
6. Configure nginx from template
7. Configure firewall (HTTP/HTTPS)
8. Ensure nginx running

**Key Variables**:
- `website_dir`: `/var/www/html`
- `nginx_user`: `nginx`

**Current File Copy Method**:
```yaml
- name: Copy website HTML file
  copy:
    src: ../website/jonathan-wilson-90s.html
    dest: "{{ website_dir }}/index.html"
```

### Infrastructure Stack
- **Compute**: EC2 t4g.small (ARM64)
- **OS**: Amazon Linux 2023
- **Web Server**: Nginx
- **CDN**: CloudFront with SSL/TLS
- **Access**: AWS Systems Manager Session Manager (no SSH)
- **State Management**: S3 backend with versioning

## Required Modifications for Next.js

### 1. GitHub Actions Workflow Changes

#### Add New Job: `build-nextjs`
**Position**: Between `terraform-apply` and `deploy-website`

**Steps Required**:
```yaml
build-nextjs:
  runs-on: ubuntu-latest
  needs: terraform-apply  # or can run in parallel
  if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: 'personal-page-nextjs/package-lock.json'

    - name: Install dependencies
      working-directory: ./personal-page-nextjs
      run: npm ci

    - name: Build Next.js
      working-directory: ./personal-page-nextjs
      run: npm run build

    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: nextjs-build
        path: personal-page-nextjs/out/
        retention-days: 1
```

**Rationale**:
- Uses `npm ci` for faster, deterministic installs
- Caches npm dependencies for faster builds
- Uploads `out/` directory as artifact for deployment job
- Short retention (1 day) as artifacts only needed for deployment

#### Modify Existing Job: `deploy-website`

**Add Dependency**:
```yaml
deploy-website:
  needs: [terraform-apply, build-nextjs]  # Add build-nextjs
```

**Add Artifact Download Step** (before Ansible playbook):
```yaml
- name: Download Next.js build
  uses: actions/download-artifact@v4
  with:
    name: nextjs-build
    path: ./nextjs-build
```

**Update Working Directory**:
Ansible will reference `../nextjs-build/` instead of `../website/`

### 2. Ansible Playbook Changes

#### Replace Single File Copy with Directory Sync

**OLD (lines 38-45)**:
```yaml
- name: Copy website HTML file
  copy:
    src: ../website/jonathan-wilson-90s.html
    dest: "{{ website_dir }}/index.html"
    owner: "{{ nginx_user }}"
    group: "{{ nginx_user }}"
    mode: '0644'
  notify: restart nginx
```

**NEW**:
```yaml
- name: Copy Next.js build output
  ansible.posix.synchronize:
    src: ../nextjs-build/
    dest: "{{ website_dir }}/"
    delete: yes
    recursive: yes
  delegate_to: localhost
  notify: restart nginx

- name: Set ownership on website files
  file:
    path: "{{ website_dir }}"
    owner: "{{ nginx_user }}"
    group: "{{ nginx_user }}"
    recurse: yes

- name: Set permissions on website files
  shell: |
    find {{ website_dir }} -type f -exec chmod 644 {} \;
    find {{ website_dir }} -type d -exec chmod 755 {} \;
  notify: restart nginx
```

**Rationale**:
- `synchronize` module efficiently copies entire directory structure
- `delete: yes` removes old files from previous deployments
- Separate ownership and permission tasks ensure correct security
- Files: 644 (rw-r--r--), Directories: 755 (rwxr-xr-x)

#### Add Ansible Collection Dependency

**File**: `requirements.txt` (add if not present)
```txt
ansible>=8.0.0
ansible-core>=2.15.0
boto3>=1.26.0
botocore>=1.29.0
```

**File**: `ansible/requirements.yml` (create new file)
```yaml
---
collections:
  - name: ansible.posix
    version: ">=1.5.0"
```

**Installation in GitHub Actions** (add step before Ansible playbook):
```yaml
- name: Install Ansible collections
  run: |
    ansible-galaxy collection install ansible.posix
```

### 3. Nginx Configuration

**Current**: Already configured via template (`templates/nginx.conf.j2`)

**Required Changes**: None expected, but verify:
- Default root is `/var/www/html`
- Index files include `index.html`
- MIME types configured for `.js`, `.css`, `.json`
- Gzip compression enabled for text files

**Verification Needed**:
Review `ansible/templates/nginx.conf.j2` to ensure:
```nginx
location / {
    root /var/www/html;
    index index.html;
    try_files $uri $uri/ /index.html;  # For SPA routing (if needed)
}

# Ensure proper MIME types
include /etc/nginx/mime.types;

# Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
```

### 4. CloudFront Configuration

**Current**: Invalidates `/*` after deployment

**Required Changes**: None - invalidation pattern `/*` will work for Next.js static export

**Consideration**: Next.js static export creates hashed filenames (e.g., `_next/static/chunks/[hash].js`), which improves caching. CloudFront will cache these efficiently.

## Environment Setup Requirements

### Local Development Environment
✅ **Verified**:
- Node.js: v24.11.1 (exceeds requirement of 18+)
- npm: 11.6.2

### GitHub Actions Runner Environment
**Will be configured via actions/setup-node@v4**:
- Node.js: 18.x (LTS)
- npm: Bundled with Node.js

### EC2 Instance
**No Node.js required** - static files only
- Nginx serves pre-built static files
- No server-side JavaScript execution

## Deployment Flow Comparison

### Current (Static HTML)
```
GitHub Push → Terraform Apply → Ansible Copy HTML → CloudFront Invalidation
```

### Next.js (Static Export)
```
GitHub Push → Terraform Apply → Build Next.js → Ansible Sync Files → CloudFront Invalidation
                                  ↓
                            Upload Artifact
                                  ↓
                            Download Artifact
```

**Build Time Addition**: ~2-5 minutes for Next.js build
**Total Pipeline Time**: Current + 2-5 minutes

## Rollback Strategy

### Current Rollback
1. Git revert commit
2. Push to main
3. Pipeline re-deploys previous HTML

### Next.js Rollback (Same)
1. Git revert commit
2. Push to main
3. Pipeline rebuilds and deploys previous version

**Alternative**: Keep backup of `website/jonathan-wilson-90s.html` for emergency manual restore

**Emergency Restore Procedure**:
```bash
# Via Session Manager
aws ssm start-session --target <instance-id>

# On EC2 instance
sudo cp /backup/index.html /var/www/html/index.html
sudo systemctl restart nginx
```

## Risk Assessment

### Low Risk Changes
- ✅ Adding Node.js setup step (doesn't affect existing jobs)
- ✅ Building Next.js in parallel (isolated job)
- ✅ Uploading artifacts (standard GitHub Actions feature)
- ✅ CloudFront invalidation (same pattern)

### Medium Risk Changes
- ⚠️ Modifying Ansible playbook (requires `ansible.posix` collection)
- ⚠️ Changing file copy method from single file to directory sync
- ⚠️ Adding recursive permission setting

### Mitigation
1. Test in feature branch before merging to main
2. Verify `ansible.posix` collection installs correctly
3. Test `synchronize` module behavior
4. Keep original HTML file as backup
5. Document rollback procedure

## Testing Checklist for Phase 6

### GitHub Actions Testing
- [ ] `build-nextjs` job runs successfully
- [ ] `npm ci` completes without errors
- [ ] `npm run build` generates `out/` directory
- [ ] Artifact uploads successfully
- [ ] Artifact size is reasonable (< 500MB)
- [ ] `deploy-website` downloads artifact
- [ ] All jobs complete in sequence

### Ansible Testing
- [ ] `ansible.posix` collection installs
- [ ] `synchronize` module copies files
- [ ] File permissions set correctly (644/755)
- [ ] Ownership set to nginx:nginx
- [ ] Nginx serves files correctly
- [ ] No broken symlinks or missing files

### CloudFront Testing
- [ ] Cache invalidation completes
- [ ] New content visible after invalidation
- [ ] Hashed filenames cached correctly
- [ ] No 404 errors for static assets

## Estimated Timeline

### Phase 6 Implementation
- **GitHub Actions modification**: 30 minutes
- **Ansible playbook modification**: 30 minutes
- **Testing in feature branch**: 1 hour
- **Documentation**: 30 minutes
- **Total**: ~2.5 hours

### Phase 7 Deployment
- **Pre-deployment checks**: 15 minutes
- **Deployment execution**: 10-15 minutes (build + deploy)
- **Post-deployment verification**: 30 minutes
- **Monitoring period**: First hour critical
- **Total**: ~2 hours

## Dependencies

### GitHub Actions Dependencies
- `actions/checkout@v4` ✅ (already in use)
- `actions/setup-node@v4` 🆕 (new)
- `actions/upload-artifact@v4` 🆕 (new)
- `actions/download-artifact@v4` 🆕 (new)

### Ansible Dependencies
- `ansible.posix` collection 🆕 (new)

### Python Dependencies
- Already satisfied via `requirements.txt`

## Recommendations

1. **Pre-Migration Backup**
   - Create backup of current HTML file
   - Tag current state in git: `v1.0.0-static-html`
   - Document current CloudFront distribution ID

2. **Feature Branch Testing**
   - Test complete pipeline in `feature/nextjs-migration` branch
   - Verify deployment to EC2 instance
   - Confirm nginx serves Next.js files correctly
   - Validate CloudFront invalidation

3. **Monitoring Setup**
   - Monitor GitHub Actions build times
   - Track CloudFront cache hit ratios
   - Monitor EC2 disk usage (static files may increase)
   - Set up alerts for deployment failures

4. **Documentation Updates**
   - Update README.md with Next.js commands
   - Document new CI/CD pipeline flow
   - Create troubleshooting guide
   - Update rollback procedure

## Approval Checklist

Before proceeding to Phase 1:
- [x] Infrastructure analysis complete
- [x] Modification plan documented
- [x] Risk assessment performed
- [x] Rollback strategy defined
- [x] Testing checklist prepared
- [ ] Bob confirms Phase 0 visual baseline complete
- [ ] Both agents ready to proceed

## Next Steps

1. Bob completes Phase 0 visual baseline
2. Synchronization point: Review both baselines
3. Proceed to Phase 1: Foundation Setup (Bob leads)
4. Asheron monitors for Bob's completion of Next.js init
5. Asheron implements Three.js POC after Bob's step 5
