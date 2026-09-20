# Oracle VM deployment handoff

Use this template to provide the deployment facts. Do not send an Oracle password, an SSH
private key, OCI API keys, database passwords, admin tokens or provider tokens.

## Fill in manually

```text
VM public IPv4:
VM public hostname/FQDN:
SSH username:
Operating system and version:
CPU architecture: amd64 / arm64 (the images build natively for either architecture)
Deployment directory: /opt/hoptrip (or another path)
Production domain:
ACME email:
DNS A record points to VM: yes / no
DNS AAAA record: not configured / configured and tested
Backup destination:
Backup retention:
```

The SSH username and public IP are enough for a manual deployment handoff. If remote access is
needed, use a temporary SSH public key through a secure channel; never paste the matching private
key into chat. The safer first step is to run the diagnostic commands below on the VM and send
their text output.

## Run on the VM

```bash
hostname
cat /etc/os-release
uname -m
docker --version
docker compose version
systemctl is-active docker
df -h /
free -h
ss -ltn
```

For DNS, run from your workstation:

```bash
nslookup <production-domain>
nslookup -type=AAAA <production-domain>
```

or, if `nslookup` is unavailable:

```bash
dig +short A <production-domain>
dig +short AAAA <production-domain>
```

If the current user receives `permission denied while trying to connect to the Docker API`,
use `sudo docker ps` for the inventory. To allow the `ubuntu` user to run Docker without
`sudo`, an administrator can run:

```bash
sudo usermod -aG docker ubuntu
newgrp docker
docker ps
```

The group change grants root-equivalent control of the VM through Docker. Keep it limited to
trusted administrators.

## Required network state

- SSH `22/tcp` is allowed only from the administrator's fixed IP where possible.
- HTTP `80/tcp` and HTTPS `443/tcp` are reachable from the internet.
- PostgreSQL `5432/tcp`, API `8000/tcp` and web `3000/tcp` are not publicly reachable.
- Docker Engine and the Compose plugin are installed.
- At least 10 GB of free disk space is available for the initial image build, database and dumps.
- The chosen backup destination is outside the VM disk, or its loss is explicitly accepted.

Once these values are available, the remaining deployment input is the production environment
file. Keep its contents on the VM; only report whether the required variables are filled:
`HOPTRIP_DOMAIN`, `ACME_EMAIL`, `POSTGRES_PASSWORD`, `ADMIN_TOKEN`,
`TRAVELPAYOUTS_API_TOKEN` and `AFFILIATE_ALLOWED_HOSTS`.
