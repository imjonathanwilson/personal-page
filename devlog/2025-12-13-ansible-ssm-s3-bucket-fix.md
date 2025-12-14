# Ansible SSM Deployment - S3 Bucket Configuration Fix

**Date:** 2025-12-13
**Issue:** Ansible AWS SSM connection failing with NoneType error
**Resolution:** Added S3 bucket configuration to inventory

## Problem

When attempting to deploy the Ansible playbook to the EC2 instance using AWS Systems Manager (SSM) connection, the deployment failed with:

```
[ERROR]: Task failed: expected string or bytes-like object, got 'NoneType'
fatal: [web-server]: FAILED! => {"changed": false, "msg": "Task failed: expected string or bytes-like object, got 'NoneType'"}
```

The error occurred during the "Gathering Facts" task, preventing any deployment from happening.

## Root Cause

The `amazon.aws.aws_ssm` connection plugin **requires an S3 bucket** for file transfers, even for tasks that don't explicitly transfer files. This is because Ansible needs to transfer Python module files to the remote instance via S3.

From the plugin documentation:
> "This plugin requires an S3 bucket to send files to/from the remote instance. This is required even for modules which do not explicitly send files (such as the shell or command modules), because Ansible sends over the .py files of the module itself, via S3."

The inventory configuration was missing the `ansible_aws_ssm_bucket_name` parameter.

## Solution

Added the S3 bucket configuration to the Ansible inventory file:

**File:** `ansible/inventory/hosts`

```ini
[webservers:vars]
ansible_connection=aws_ssm
ansible_aws_ssm_region=us-east-1
ansible_aws_ssm_bucket_name=jonathan-wilson-maintenance  # <- Added this line
ansible_aws_ssm_profile=
ansible_shell_type=sh
ansible_remote_tmp=/tmp/.ansible-${USER}/tmp
```

The bucket `jonathan-wilson-maintenance` already existed in the Terraform configuration (defined in `terraform/s3.tf`).

## Verification Steps

Before the fix:
```bash
cd ansible
ansible -m ping web-server
# Result: Failed with NoneType error
```

After the fix:
```bash
cd ansible
ansible-playbook playbook.yml
# Result: Success - all tasks completed
```

## Deployment Results

The playbook successfully:
- Updated all packages
- Installed nginx, git, python3-pip
- Created website directory at /var/www/html
- Deployed the website HTML file
- Configured nginx
- Started and enabled nginx service
- Restarted nginx to apply configuration

## Additional Notes

- The firewall configuration tasks failed due to missing Python firewall library on the instance, but these were set to `ignore_errors: yes`
- Firewall rules should be managed through AWS Security Groups instead
- The SSM connection requires:
  - AWS SSM Session Manager plugin installed on control machine
  - SSM Agent running on EC2 instance
  - Proper IAM permissions for SSM and S3
  - S3 bucket for file transfers

## References

- Ansible Collection: amazon.aws v10.1.2
- EC2 Instance: i-015aed3efee4eec07 (jonathan-wilson-web-server)
- S3 Bucket: jonathan-wilson-maintenance
- Connection Plugin: amazon.aws.aws_ssm
