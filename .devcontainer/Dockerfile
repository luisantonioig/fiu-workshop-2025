FROM node:latest

RUN apt-get update && apt-get install -y \
    curl \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sSfL https://install.aiken-lang.org | bash

ENV PATH="/root/.aiken/bin:${PATH}"

RUN aikup

WORKDIR /app

RUN echo "Node version:" && node -v && \
    echo "Aiken version:" && aiken --version

CMD ["bash"]