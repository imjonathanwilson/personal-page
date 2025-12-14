[webservers]
web-server ansible_host=${instance_id} ansible_python_interpreter=/usr/bin/python3

[webservers:vars]
ansible_connection=aws_ssm
ansible_aws_ssm_bucket_name=${bucket_name}
ansible_aws_ssm_region=us-east-1
ansible_remote_tmp=/tmp/.ansible-$${USER}/tmp
