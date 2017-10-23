FROM node:alpine

RUN echo "http://nl.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories
RUN apk add --no-cache \
    gmp \
    libffi

RUN mkdir -p /pandoc-build
WORKDIR /pandoc-build

ENV PANDOC_VERSION 1.19.2.1
ENV PANDOC_DOWNLOAD_URL https://hackage.haskell.org/package/pandoc-$PANDOC_VERSION/pandoc-$PANDOC_VERSION.tar.gz
ENV PANDOC_ROOT /usr/local/pandoc

RUN apk add --no-cache --virtual build-dependencies \
    ghc \
    cabal \
    linux-headers \
    musl-dev \
    zlib-dev \
    curl \
 && curl -fsSL "$PANDOC_DOWNLOAD_URL" | tar -xzf - \
 && ( cd pandoc-$PANDOC_VERSION && cabal update && cabal install --only-dependencies \
    && cabal configure --prefix=$PANDOC_ROOT \
    && cabal build \
    && cabal copy \
    && cd .. ) \
 && rm -Rf pandoc-$PANDOC_VERSION/ \
 && apk del build-dependencies \
 && rm -Rf /root/.cabal/ /root/.ghc/

ENV PATH $PATH:$PANDOC_ROOT/bin

WORKDIR /
RUN rmdir /pandoc-build


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
