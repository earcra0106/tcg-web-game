ARG BASE_IMAGE=node:24.16.0-slim

FROM ${BASE_IMAGE}

ENV DEBIAN_FRONTEND=noninteractive

SHELL [ "/bin/bash", "-c" ]

ARG PNPM_VERSION

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        sudo \
        bubblewrap \
        ca-certificates \
        openssh-client \
        openssl \
        curl \
        git \
        jq \
        ripgrep \
        sed \
        gawk \
        vim && \
    if id -u 1000 >/dev/null 2>&1; then userdel -r $(id -nu 1000); fi && \
    groupadd --gid 1000 dev && \
    useradd --uid 1000 --gid dev --shell /bin/bash --create-home dev && \
    npm install -g \
        pnpm@${PNPM_VERSION} \
        @openai/codex && \
    mkdir -p /workspace && chown -R dev:dev /workspace && \
    mkdir -p /home/dev/.local/share/pnpm/store && chown -R dev:dev /home/dev/.local && \
    mkdir -p /home/dev/.codex && chown -R dev:dev /home/dev/.codex && \
    mkdir -p /home/dev/.ssh && chown -R dev:dev /home/dev/.ssh && \
    mkdir -p /home/dev/.config/gh && chown -R dev:dev /home/dev/.config && \
    echo "dev ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Tokyo

WORKDIR /workspace

USER dev
RUN pnpm config set store-dir "/home/dev/.local/share/pnpm/store"
