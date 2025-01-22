# How to install Stylo

Depending on your needs, you may want to install Stylo in different ways :

- [With Docker](#run-with-docker) (suited to run Stylo rapidly)
- [Without Docker](#run-without-docker) (suited to tailor your Stylo setup)

[Ansible playbooks](#deploy-with-ansible) enable you to deploy Stylo on a remote machine, accessible with the SSH protocol.

You can find various pointers in our [GitHub Actions automations](./.github/workflows/deploy.yml), and in the [`./infrastructure` folder](./infrastructure).

## Clone git project

First step is to clone the project, you can use either the HTTPS or SSH version of the repository URL:

    $ git clone git@github.com:EcrituresNumeriques/stylo.git

## Run with Docker

Useful to run a fully fledged Stylo in no time.

Run the following command:

    $ cp stylo-example.env .env
    $ docker-compose up

**NOTE:** The first time, this command can take a few dozen minutes depending on your network speed and machine capabilities. Subsequent calls will be faster.

This gives your access to:

- Stylo (frontend): http://localhost:3000
- GraphQL endpoint: http://localhost:3030
- Export endpoint: http://localhost:3080
- Pandoc API: http://localhost:3090

## Run without Docker

**Note**: this section can be improved.

We recommend you to host Stylo **behind a reverse proxy**.
We provide a working configuration example below for the Nginx server.

### Install the pre-requisite

    $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    $ nvm install v16
    $ sudo apt install mongodb-org pandoc

### Prepare the server

After _cloning_ the repo, build the service and its dependencies:

    $ cp stylo-example.env .env
    $ npm clean-install
    $ npm start

After the image is built, you should have a Stylo instance running on your server.
Now, we need to expose it to the outside world with a reverse proxy.

### Expose online

Obtain a working sample file with the following command:

    $ wget -O /etc/nginx/sites-available/stylo.conf \
        https://github.com/EcrituresNumeriques/stylo/raw/dev/infrastructure/stylo.huma-num.fr.conf

Replace the service domain name:

    $ sed -i s/stylo.huma-num.fr/STYLO_SUBDOMAIN.MYDOMAIN.TLD/g' /etc/nginx/sites-available/stylo.conf

Alternatively, alter the various ports, and domains on your own.

When you are done, enable the website and reload the configuration:

    $ ln -s /etc/nginx/sites-available/stylo.conf /etc/nginx/sites-enable/stylo.conf
    $ nginx reload

## Deploy with Ansible

**Note**: this section can be improved.

    $ pip install ansible===2.9.7 requests
    $ cd infrastructure
    $ ansible-playbook -i inventories/prod playbook.yml

## Next steps

Once you have an up and running Stylo instance, read the [`SERVER.md` file](SERVER.md) to run daily and maintenance operations, such as database migrations and such.
