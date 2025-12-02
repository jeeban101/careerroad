#!/usr/bin/env bash
# Install Docker Engine and Docker Compose plugin on common EC2 AMIs
# - Amazon Linux 2
# - Amazon Linux 2023
# - Ubuntu 20.04/22.04/24.04
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/jeeban101/careerroad/main/scripts/install-docker-ec2.sh -o install-docker-ec2.sh
#   sudo bash install-docker-ec2.sh
#
# After installation, re-login (or `newgrp docker`) for group changes to take effect.

set -euo pipefail

log()  { echo -e "[INFO] $*"; }
warn() { echo -e "[WARN] $*" >&2; }
err()  { echo -e "[ERR ] $*" >&2; }

require_root() {
  if [[ "${EUID}" -ne 0 ]]; then
    err "Please run as root (use: sudo bash $0)"
    exit 1
  fi
}

detect_user() {
  local user="${SUDO_USER:-$(whoami)}"
  if [[ "$user" == "root" ]]; then
    if id -u ec2-user &>/dev/null; then
      user="ec2-user"
    elif id -u ubuntu &>/dev/null; then
      user="ubuntu"
    fi
  fi
  echo "$user"
}

ensure_curl() {
  if ! command -v curl &>/dev/null; then
    if command -v apt-get &>/dev/null; then
      apt-get update -y
      apt-get install -y curl ca-certificates
    elif command -v yum &>/dev/null; then
      yum install -y curl ca-certificates
    elif command -v dnf &>/dev/null; then
      dnf install -y curl ca-certificates
    else
      err "curl is required but couldn't be installed automatically."
      exit 1
    fi
  fi
}

install_compose_plugin_from_github() {
  local dest_dir="/usr/local/lib/docker/cli-plugins"
  local arch
  arch="$(uname -m)"

  mkdir -p "${dest_dir}"
  # Choose Compose v2 release known stable; update as needed
  local version="v2.29.7"
  local url="https://github.com/docker/compose/releases/download/${version}/docker-compose-$(uname -s)-${arch}"

  log "Installing docker compose plugin from GitHub: ${version}"
  curl -fsSL "${url}" -o "${dest_dir}/docker-compose"
  chmod +x "${dest_dir}/docker-compose"
}

install_on_amazon_linux_2() {
  log "Detected Amazon Linux 2"
  yum update -y
  # amazon-linux-extras is standard for AL2
  if command -v amazon-linux-extras &>/dev/null; then
    amazon-linux-extras install -y docker
  else
    # Fallback
    yum install -y docker
  fi

  systemctl enable docker
  systemctl start docker

  # Try compose plugin from repos if available, else GitHub
  if yum list docker-compose-plugin &>/dev/null; then
    yum install -y docker-compose-plugin || true
  fi
  if ! command -v docker &>/dev/null || ! docker compose version &>/dev/null; then
    install_compose_plugin_from_github
  fi
}

install_on_amazon_linux_2023() {
  log "Detected Amazon Linux 2023"
  dnf update -y
  dnf install -y docker

  systemctl enable --now docker

  # Try compose plugin from repos if available, else GitHub
  if dnf list docker-compose-plugin &>/dev/null; then
    dnf install -y docker-compose-plugin || true
  fi
  if ! docker compose version &>/dev/null; then
    install_compose_plugin_from_github
  fi
}
install_on_ubuntu() {
  log "Detected Ubuntu"
  apt-get update -y

  # Simple path: use distro packages (sufficient for most cases)
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    docker.io docker-compose-plugin

  systemctl enable --now docker

  # Fallback if compose plugin missing
  if ! docker compose version &>/dev/null; then
    install_compose_plugin_from_github
  fi
}

post_install() {
  local user="$1"

  # Ensure docker group exists then add user
  if ! getent group docker >/dev/null; then
    groupadd docker
  fi
  usermod -aG docker "$user" || true

  log "Docker versions:"
  docker --version || true
  log "Docker Compose plugin version:"
  docker compose version || true

  log "Post-install steps:"
  echo "  - User '$user' was added to the 'docker' group."
  echo "  - You must log out and log back in (or run: newgrp docker) for group changes to take effect."
  echo "  - Test with: docker run --rm hello-world"
  echo "  - Deploy this app with:"
  echo "        docker compose up -d --build"
}

main() {
  require_root
  ensure_curl

  if [[ -r /etc/os-release ]]; then
    # shellcheck disable=SC1091
    . /etc/os-release
  else
    err "/etc/os-release not found; unsupported distribution."
    exit 1
  fi

  case "${ID:-}" in
    amzn)
      # Amazon Linux 2 has VERSION_ID like "2"
      if [[ "${VERSION_ID:-}" == 2* ]]; then
        install_on_amazon_linux_2
      else
        # Assume AL2023+
        install_on_amazon_linux_2023
      fi
      ;;
    ubuntu)
      install_on_ubuntu
      ;;
    *)
      warn "Unrecognized distro ID '${ID}'. Attempting generic installation..."
      # Try common managers
      if command -v dnf &>/dev/null; then
        dnf update -y
        dnf install -y docker || dnf install -y moby-engine || true
        systemctl enable --now docker || true
      elif command -v yum &>/dev/null; then
        yum update -y
        yum install -y docker || yum install -y docker-engine || true
        systemctl enable --now docker || true
      elif command -v apt-get &>/dev/null; then
        apt-get update -y
        apt-get install -y docker.io
        systemctl enable --now docker
      else
        err "No supported package manager found."
        exit 1
      fi
      if ! docker compose version &>/dev/null; then
        install_compose_plugin_from_github
      fi
      ;;
  esac

  local target_user
  target_user="$(detect_user)"
  post_install "$target_user"
}

main "$@"
