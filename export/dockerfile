FROM node:11

WORKDIR /usr/src/app


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

#install pandoc
ENV PKGREL 1
ENV VERSION 2.6
ADD ./vendors/pandoc-${VERSION}-${PKGREL}-amd64.deb /pandoc.deb
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

ADD vendors/git-diff.py /usr/bin/git-diff.py
RUN echo "examples/git-diff.py" >> /installed-pandocfilters.txt

RUN sed -i 's#examples#/usr/bin#' /installed-pandocfilters.txt

copy package.json .

RUN npm install

COPY src src

EXPOSE 80
CMD ["npm","run","start"]
