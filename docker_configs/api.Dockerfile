FROM ruby:2.6.5
RUN wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | apt-key add - && \
  sh -c 'VERSION_CODENAME=stretch; . /etc/os-release; echo "deb http://apt.postgresql.org/pub/repos/apt/ $VERSION_CODENAME-pgdg main" >> /etc/apt/sources.list.d/pgdg.list' && \
  apt-get update -qq && apt-get install -y build-essential libpq-dev postgresql postgresql-contrib && \
  curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
  sh -c 'echo "\nPackage: *\nPin: origin deb.nodesource.com\nPin-Priority: 700\n" >> /etc/apt/preferences' && \
  apt-get install -y nodejs && \
  mkdir /farmbot;
WORKDIR /farmbot
ENV     BUNDLE_PATH=/bundle BUNDLE_BIN=/bundle/bin GEM_HOME=/bundle
ENV     PATH="${BUNDLE_BIN}:${PATH}"
COPY     ./ /farmbot
COPY    ./Gemfile /farmbot

RUN gem install bundler:2.1.4 && \
  bundle install && \
  npm install 

# Add dogfish
# This should be set to where the volume mounts to.
ARG PERSISTANT_DIR=/vault/file
COPY dogfish/ /usr/share/dogfish
COPY migrations/ /usr/share/dogfish/shell-migrations
RUN ln -s /usr/share/dogfish/dogfish /usr/bin/dogfish
RUN mkdir /var/lib/dogfish 
# Need to do this all together because ultimately, the config folder is a volume, and anything done in there will be lost. 
RUN mkdir -p ${PERSISTANT_DIR} && touch ${PERSISTANT_DIR}/migrations.log && ln -s ${PERSISTANT_DIR}/migrations.log /var/lib/dogfish/migrations.log 

# TODO: These should be a migration.
#RUN bundle exec rails db:create db:migrate 
#RUN rake keys:generate
#RUN rake assets:precompile

## Set up the CMD as well as the pre and post hooks.
COPY go-init /bin/go-init
COPY entrypoint.sh /usr/bin/entrypoint.sh
COPY exitpoint.sh /usr/bin/exitpoint.sh

ENTRYPOINT ["go-init"]
#CMD ["-main", "/usr/bin/entrypoint.sh sleep 500", "-post", "/usr/bin/exitpoint.sh"]
CMD ["-main", "/usr/bin/entrypoint.sh bundle exec rails s -e development -b 0.0.0.0", "-post", "/usr/bin/exitpoint.sh"]
