# Install on an Ubuntu server

First, install the following system dependencies:

```bash
sudo apt update
sudo apt upgrade
sudo apt-get install --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common \
    python-certbot-nginx \
    nginx \
    git
```

Then, install `docker` from the official repository:

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install --no-install-recommends docker-ce docker-ce-cli containerd.io
```

Add your user to the `docker` group to run Docker as a non-root user:

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
sudo newgrp docker
sudo systemctl enable docker
sudo systemctl start docker
```

**Exit your shell session**, and come back to be able to execute docker commands later on.

Install `docker-compose`:

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Clone the stylo repository:

```bash
cd ~
git clone https://github.com/EcrituresNumeriques/stylo.git
```

Update the submodule:

```bash
cd stylo
git submodule init
git submodule update
```

Copy and configure the `docker-compose.yaml`:

```bash
cp example_docker-compose/docker-compose.prod.yaml docker-compose.yaml
```

Finally, start the application:

```bash
docker-compose up -d --build
```

## Deploy a new version

Push changes to the master branch then connect to the server using `ssh`.
Fetch the changes:

```
cd git/stylo
git pull --rebase
```

Update and restart Stylo:

```
docker-compose up -d --build
```

## Install a reverse proxy (NGINX)

Fetch the configuration file:

```
wget https://raw.githubusercontent.com/EcrituresNumeriques/stylo/master/infrastructure/stylo.huma-num.fr.conf -O- | sudo tee /etc/nginx/sites-available/stylo.huma-num.fr.conf
sudo ln -s /etc/nginx/sites-available/stylo.huma-num.fr.conf /etc/nginx/sites-enabled/stylo.huma-num.fr.conf
```

Edit the configuration to set the correct domain.


Install certbot to add Let's encrypt certificate:

```
sudo certbot certonly -n --standalone -d stylo-dev.huma-num.fr --agree-tos -m hi@oncletom.io
sudo openssl dhparam -dsaparam -out /etc/letsencrypt/ssl-dhparams.pem 4096
```

Once it's done, check that the configuration is valid with `nginx -t` then restart NGINX:

```
systemctl restart nginx
```