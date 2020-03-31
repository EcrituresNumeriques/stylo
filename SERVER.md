# Install on an Ubuntu server

First, install the following system dependencies:

```bash
sudo apt update
sudo apt upgrade
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
```

Then, install `docker` from the official repository:

```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

Add your user to the `docker` group to run Docker as a non-root user:

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
sudo systemctl enable docker
```

Install `docker-compose`:

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Clone the stylo repository:

```bash
cd ~
mkdir git
cd git
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
