FROM node

RUN echo "deb http://httpredir.debian.org/debian jessie contrib" > /etc/apt/sources.list.d/contrib.list ;\
    echo "deb http://httpredir.debian.org/debian jessie-updates contrib" >> /etc/apt/sources.list.d/contrib.list ;\
    echo "deb http://security.debian.org jessie/updates contrib" >> /etc/apt/sources.list.d/contrib.list

# install haskell
RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update -y \
    && apt-get upgrade -y \
    && apt-get install -y \
              abcm2ps \
              ca-certificates \
              cm-super \
              curl \
              fontconfig \
              fonts-liberation \
              git \
              graphviz \
              imagemagick \
              inotify-tools \
              latex-xcolor \
              make \
              python-pygraphviz \
              python3 \
              texlive-bibtex-extra \
              texlive-fonts-extra \
              texlive-lang-all \
              texlive-latex-base \
              texlive-latex-extra \
              texlive-math-extra \
              texlive-xetex \
              wget \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

ENV PKGREL 1
ENV VERSION 1.19.2.1
ADD https://github.com/jgm/pandoc/releases/download/${VERSION}/pandoc-${VERSION}-${PKGREL}-amd64.deb /pandoc.deb
RUN export DEBIAN_FRONTEND=noninteractive \
    && dpkg -i /pandoc.deb \
    && rm /pandoc.deb

    RUN git clone https://github.com/jgm/pandocfilters.git /pandocfilters \
    && cd /pandocfilters \
    && python setup.py install \
    && python3 setup.py install \
    && cp examples/*.py /usr/bin \
    && ls examples/*.py > /installed-pandocfilters.txt \
    && rm -rf /pandocfilters

ADD https://raw.githubusercontent.com/silvio/pandocfilters/sfr/git-diff-filter/examples/git-diff.py /usr/bin/git-diff.py
RUN echo "examples/git-diff.py" >> /installed-pandocfilters.txt

RUN sed -i 's#examples#/usr/bin#' /installed-pandocfilters.txt


RUN npm install -g n
RUN n stable
RUN yarn global add npm

ADD sails /sails
RUN cd /sails; npm i

ADD front /front
RUN cd /front; npm i
RUN cd /front; npm run build

WORKDIR /sails

EXPOSE 80
CMD ["npm","run","dist"]
