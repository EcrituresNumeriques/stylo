# Refresh paquet ubuntu + install docker

```bash
sudo apt update
sudo apt upgrade
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

```

# auto start docker (+group add no sudo)

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
sudo systemctl enable docker
```


# install docker-compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

```


# clone repo stylo

```bash
cd ~
mkdir git
cd git
git clone https://github.com/EcrituresNumeriques/stylo.git
```

# initialisation dev

```bash
cd stylo
cp example_docker-compose/docker-compose.dev.yaml docker-compose.yaml
docker network create root_default
docker-compose up -d --build
```