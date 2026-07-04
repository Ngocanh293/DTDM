FROM jenkins/jenkins:lts-jdk17

USER root

# Cài các gói cần thiết
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    lsb-release

# Cài Docker CLI
RUN install -m 0755 -d /etc/apt/keyrings

RUN curl -fsSL https://download.docker.com/linux/debian/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

RUN chmod a+r /etc/apt/keyrings/docker.gpg

RUN echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/debian bookworm stable" \
> /etc/apt/sources.list.d/docker.list

RUN apt-get update && \
    apt-get install -y docker-ce-cli docker-compose-plugin

# Cài NodeJS 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

RUN apt-get install -y nodejs

USER jenkinsFROM jenkins/jenkins:lts-jdk17

USER root

# ==========================
# Install basic packages
# ==========================
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    wget \
    gnupg \
    lsb-release \
    ca-certificates

# ==========================
# Install Maven
# ==========================
RUN apt-get install -y maven

# ==========================
# Install Docker CLI
# ==========================
RUN install -m 0755 -d /etc/apt/keyrings

RUN curl -fsSL https://download.docker.com/linux/debian/gpg \
 | gpg --dearmor \
 -o /etc/apt/keyrings/docker.gpg

RUN chmod a+r /etc/apt/keyrings/docker.gpg

RUN echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/debian bookworm stable" \
> /etc/apt/sources.list.d/docker.list

RUN apt-get update && \
    apt-get install -y docker-ce-cli docker-compose-plugin

# ==========================
# Install NodeJS 22
# ==========================
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

RUN apt-get install -y nodejs

USER jenkins
FROM jenkins/jenkins:lts-jdk17

USER root

# ==========================
# Install basic packages
# ==========================
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    wget \
    gnupg \
    lsb-release \
    ca-certificates \
    maven

# ==========================
# Install Docker CLI
# ==========================
RUN install -m 0755 -d /etc/apt/keyrings

RUN curl -fsSL https://download.docker.com/linux/debian/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

RUN chmod a+r /etc/apt/keyrings/docker.gpg

RUN echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/debian bookworm stable" \
> /etc/apt/sources.list.d/docker.list

RUN apt-get update && \
    apt-get install -y docker-ce-cli docker-compose-plugin

# ==========================
# Install NodeJS 22
# ==========================
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

RUN apt-get install -y nodejs

USER jenkins
